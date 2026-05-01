import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { initDatabase, getDatabase, saveHardwareSnapshot, getHardwareHistory, saveChatMessage, getChatHistory, getSetting, setSetting, logConflict, dismissConflict, getConflictHistory, saveUpdateHistory, getUpdateHistory, saveAlert, getAlertHistoryFromDb, saveHealthScore, getHealthHistoryFromDb } from './database/index';
import { HardwareCollector } from './hardware/collector';
import { SoftwareCollector } from './software/collector';
import { ConflictDetector } from './conflict/detector';
import { AppManager } from './software/manager';
import { SoftwareUpdater } from './software/updater';
import { AlertEngine } from './alerter/engine';
import { calculateHealthScore } from './health/scorer';
import { StartupManager } from './startup/manager';
import { NetworkMonitor } from './network/monitor';
import { ProcessMonitor } from './process/monitor';
import { SystemInfoCollector } from './system/info';
import { BenchmarkRunner } from './benchmark/runner';
import { SchedulerReader } from './scheduler/reader';
import type { HardwareSnapshot } from './hardware/collector';

let mainWindow: BrowserWindow | null = null;
let hardwareCollector: HardwareCollector | null = null;
const softwareCollector = new SoftwareCollector();
const conflictDetector = new ConflictDetector();
const appManager = new AppManager();
const softwareUpdater = new SoftwareUpdater();
const alertEngine = new AlertEngine();
const startupManager = new StartupManager();
const networkMonitor = new NetworkMonitor();
const processMonitor = new ProcessMonitor();
const systemInfoCollector = new SystemInfoCollector();
const benchmarkRunner = new BenchmarkRunner();
const schedulerReader = new SchedulerReader();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d1117',
    title: 'PCHelper',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // In dev, load from Vite dev server; in prod, load built files
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('pchelper:window-state-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('pchelper:window-state-changed', false);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  // Window controls
  ipcMain.handle('pchelper:minimize-window', () => mainWindow?.minimize());
  ipcMain.handle('pchelper:maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
    mainWindow?.webContents.send('pchelper:window-state-changed', mainWindow?.isMaximized() ?? false);
  });
  ipcMain.handle('pchelper:is-maximized', () => mainWindow?.isMaximized() ?? false);
  ipcMain.handle('pchelper:close-window', () => mainWindow?.close());
  ipcMain.handle('pchelper:get-app-version', () => app.getVersion());

  // AI connection test
  ipcMain.handle('pchelper:test-ai-connection', async (_event, endpoint: string, model: string, apiKey: string) => {
    try {
      const url = `${endpoint}/v1/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      const data = await response.json();
      return { success: true, models: Array.isArray(data.data) ? data.data.length : undefined };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Hardware
  hardwareCollector = new HardwareCollector();
  hardwareCollector.init().catch(() => {});

  ipcMain.handle('pchelper:get-hardware-snapshot', () =>
    hardwareCollector!.getSnapshot()
  );

  ipcMain.handle('pchelper:start-hardware-polling', (_event, interval?: number) => {
    hardwareCollector?.stopPolling();
    hardwareCollector?.startPolling((snapshot) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('pchelper:hardware-update', snapshot);
      }

      // Alert engine: check local rules
      const newAlerts = alertEngine.checkLocalRules(snapshot as unknown as import('./alerter/engine').HardwareSnapshot);
      for (const alert of newAlerts) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('pchelper:alert-update', alert);
        }
        try {
          saveAlert({
            timestamp: alert.timestamp,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            detail: alert.detail,
          });
        } catch {
          // DB may not be available
        }
      }

      // Alert engine: AI analysis every 5 minutes
      if (alertEngine.shouldRunAiAnalysis()) {
        alertEngine.markAiAnalysisRun();
        const apiKey = getSetting('ai_api_key') || '';
        const endpoint = getSetting('ai_endpoint') || 'https://api.deepseek.com';
        const model = getSetting('ai_model') || 'deepseek-v4-pro';
        if (apiKey) {
          alertEngine.analyzeWithAI(
            snapshot as unknown as import('./alerter/engine').HardwareSnapshot,
            apiKey,
            endpoint,
            model
          ).then((aiAlert) => {
            if (aiAlert && mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('pchelper:alert-update', aiAlert);
              try {
                saveAlert({
                  timestamp: aiAlert.timestamp,
                  type: aiAlert.type,
                  severity: aiAlert.severity,
                  title: aiAlert.title,
                  message: aiAlert.message,
                  detail: aiAlert.detail,
                });
              } catch {
                // DB may not be available
              }
            }
          }).catch(() => {
            // AI analysis failed silently
          });
        }
      }

      try {
        const hw = snapshot;
        saveHardwareSnapshot({
          cpu_usage: hw.cpu.usage,
          cpu_temp: hw.cpu.temp,
          memory_used: hw.memory.used,
          memory_total: hw.memory.total,
          disk_used: hw.disks[0].used,
          disk_total: hw.disks[0].total,
          gpu_usage: hw.gpu.usage,
          gpu_temp: hw.gpu.temp,
        });
      } catch {
        // DB not yet initialized
      }
    }, interval ?? 1000);
  });

  ipcMain.handle('pchelper:stop-hardware-polling', () => {
    hardwareCollector?.stopPolling();
  });

  ipcMain.handle('pchelper:get-hardware-history', (_event, limit?: number) =>
    getHardwareHistory(limit ?? 60)
  );

  // Software
  ipcMain.handle('pchelper:get-installed-apps', () =>
    softwareCollector.getInstalledApps()
  );

  ipcMain.handle('pchelper:search-apps', (_event, query: string) =>
    softwareCollector.searchApps(query)
  );

  // Chat
  ipcMain.handle(
    'pchelper:send-chat-message',
    async (_event, message: string, endpoint?: string, model?: string) => {
      saveChatMessage('user', message);

      const apiEndpoint = endpoint || getSetting('ai_endpoint') || 'https://api.deepseek.com';
      const apiModel = model || getSetting('ai_model') || 'deepseek-v4-pro';
      const apiKey = getSetting('ai_api_key') || '';

      try {
        const url = `${apiEndpoint}/v1/chat/completions`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: apiModel,
            messages: [{ role: 'user', content: message }],
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const reply = `API Error (${response.status}): ${errorText}`;
          saveChatMessage('assistant', reply);
          return { role: 'assistant', content: reply };
        }

        const data = await response.json() as {
          choices: Array<{ message: { role: string; content: string } }>;
        };
        const reply = data.choices[0]?.message?.content || 'No response';
        saveChatMessage('assistant', reply);
        return { role: 'assistant', content: reply };
      } catch (err) {
        const reply = `Connection error: ${String(err)}`;
        saveChatMessage('assistant', reply);
        return { role: 'assistant', content: reply };
      }
    }
  );

  ipcMain.handle('pchelper:get-chat-history', (_event, limit?: number) =>
    getChatHistory(limit ?? 100)
  );

  ipcMain.handle('pchelper:clear-chat-history', () => {
    const db = getDatabase();
    db.prepare('DELETE FROM ai_chat_history').run();
  });

  // Settings
  ipcMain.handle('pchelper:get-setting', (_event, key: string) =>
    getSetting(key)
  );

  ipcMain.handle('pchelper:set-setting', (_event, key: string, value: string) => {
    setSetting(key, value);
  });

  ipcMain.handle('pchelper:get-all-settings', () => {
    const db = getDatabase();
    return db.prepare('SELECT key, value FROM settings').all() as Array<{
      key: string;
      value: string;
    }>;
  });

  // Conflict detection
  ipcMain.handle('pchelper:scan-conflicts', () => {
    const report = conflictDetector.scanConflicts();
    for (const c of report.conflicts) {
      try {
        logConflict({
          type: c.type,
          severity: c.severity,
          title: c.title,
          description: c.description,
        });
      } catch {
        // DB may not be available
      }
    }
    return report;
  });

  ipcMain.handle('pchelper:dismiss-conflict', (_event, id: number) => {
    dismissConflict(id);
  });

  ipcMain.handle('pchelper:get-conflict-history', (_event, limit?: number) =>
    getConflictHistory(limit ?? 50)
  );

  // App Manager
  ipcMain.handle('pchelper:get-managed-apps', () => appManager.getApps());

  ipcMain.handle('pchelper:uninstall-app', (_event, name: string) =>
    appManager.uninstallApp(name)
  );

  ipcMain.handle('pchelper:uninstall-selected', (_event, names: string[]) =>
    appManager.uninstallSelected(names)
  );

  ipcMain.handle('pchelper:get-app-details', (_event, name: string) =>
    appManager.getAppDetails(name)
  );

  // Software Updates
  ipcMain.handle('pchelper:scan-updates', () =>
    softwareUpdater.scanForUpdates(softwareCollector.getInstalledApps())
      .then((result) => {
        try {
          saveUpdateHistory(JSON.stringify(result));
        } catch {
          // DB may not be available
        }
        return result;
      })
  );

  ipcMain.handle('pchelper:get-update-history', (_event, limit?: number) =>
    getUpdateHistory(limit ?? 10)
  );

  // Alerts
  ipcMain.handle('pchelper:get-alerts', () => alertEngine.getActiveAlerts());

  ipcMain.handle('pchelper:dismiss-alert', (_event, id: string) => {
    alertEngine.dismissAlert(id);
  });

  ipcMain.handle('pchelper:snooze-alert', (_event, id: string, minutes: number) => {
    alertEngine.snoozeAlert(id, minutes);
  });

  ipcMain.handle('pchelper:dismiss-all-alerts', () => {
    alertEngine.dismissAll();
  });

  ipcMain.handle('pchelper:get-alert-history', (_event, limit?: number) =>
    getAlertHistoryFromDb(limit ?? 100)
  );

  ipcMain.handle('pchelper:run-ai-analysis', async () => {
    if (!hardwareCollector) return null;
    const snapshot = hardwareCollector.getSnapshot() as unknown as import('./alerter/engine').HardwareSnapshot;
    const apiKey = getSetting('ai_api_key') || '';
    const endpoint = getSetting('ai_endpoint') || 'https://api.deepseek.com';
    const model = getSetting('ai_model') || 'deepseek-v4-pro';
    if (!apiKey) return null;
    const alert = await alertEngine.analyzeWithAI(snapshot, apiKey, endpoint, model);
    if (alert) {
      try {
        saveAlert({
          timestamp: alert.timestamp,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          detail: alert.detail,
        });
      } catch {
        // DB may not be available
      }
    }
    return alert;
  });

  // Health Score
  ipcMain.handle('pchelper:get-health-score', async () => {
    const hw = hardwareCollector?.getSnapshot();
    const alerts = alertEngine.getActiveAlerts();
    const conflictReport = conflictDetector.scanConflicts();
    const updateResult = await softwareUpdater.scanForUpdates(softwareCollector.getInstalledApps());
    const apps = softwareCollector.getInstalledApps();

    const score = calculateHealthScore({
      cpu: hw ? {
        usage: hw.cpu.usage,
        temp: hw.cpu.temp,
        currentClock: hw.cpu.currentClock,
        baseClock: hw.cpu.baseClock,
      } : { usage: 0, temp: 0, currentClock: 0, baseClock: 0 },
      memory: hw ? { usagePercent: hw.memory.usagePercent } : { usagePercent: 0 },
      disks: hw ? hw.disks.map((d) => ({ usagePercent: d.usagePercent, temp: d.temp })) : [{ usagePercent: 0, temp: 0 }],
      gpu: hw ? { temp: hw.gpu.temp, usage: hw.gpu.usage } : { temp: 0, usage: 0 },
      outdatedApps: updateResult.updatesAvailable,
      highSeverityConflicts: conflictReport.summary.high,
      criticalUpdates: updateResult.criticalUpdates,
      normalUpdates: updateResult.updatesAvailable - updateResult.criticalUpdates,
      activeCriticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
      activeWarningAlerts: alerts.filter((a) => a.severity === 'warning').length,
    });

    try {
      saveHealthScore({
        total: score.total,
        grade: score.grade,
        categories: score.categories,
      });
    } catch {
      // DB may not be available
    }

    return score;
  });

  ipcMain.handle('pchelper:get-health-history', (_event, limit?: number) =>
    getHealthHistoryFromDb(limit ?? 24)
  );

  // Startup Manager
  ipcMain.handle('pchelper:get-startup-apps', () =>
    startupManager.getStartupApps()
  );

  ipcMain.handle('pchelper:toggle-startup-app', (_event, name: string, enabled: boolean) =>
    startupManager.toggleStartupApp(name, enabled)
  );

  ipcMain.handle('pchelper:disable-selected-startup', (_event, names: string[]) =>
    startupManager.disableSelected(names)
  );

  ipcMain.handle('pchelper:get-startup-impact', () =>
    startupManager.getStartupImpact()
  );

  // Network Monitor
  ipcMain.handle('pchelper:get-network-interfaces', () =>
    networkMonitor.getInterfaces()
  );

  ipcMain.handle('pchelper:get-network-traffic', () =>
    networkMonitor.getTraffic()
  );

  ipcMain.handle('pchelper:run-speed-test', () =>
    networkMonitor.getSpeedTestResults()
  );

  // Process Monitor
  ipcMain.handle('pchelper:get-processes', () =>
    processMonitor.getProcesses()
  );

  ipcMain.handle('pchelper:kill-process', (_event, pid: number) =>
    processMonitor.killProcess(pid)
  );

  ipcMain.handle('pchelper:get-process-detail', (_event, pid: number) =>
    processMonitor.getProcessDetail(pid)
  );

  // System Info
  ipcMain.handle('pchelper:get-system-info', () =>
    systemInfoCollector.getSystemInfo()
  );

  // Benchmark
  ipcMain.handle('pchelper:run-benchmark', async (_event) => {
    return new Promise((resolve) => {
      benchmarkRunner.runBenchmark((pct, phase) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('pchelper:benchmark-progress', { pct, phase });
        }
      }).then(resolve);
    });
  });

  ipcMain.handle('pchelper:get-benchmark-history', () => {
    const last = benchmarkRunner.getLastResult();
    return last ? [last] : [];
  });

  // Scheduled Tasks
  ipcMain.handle('pchelper:get-scheduled-tasks', () =>
    schedulerReader.getScheduledTasks()
  );

  ipcMain.handle('pchelper:get-task-detail', (_event, name: string) =>
    schedulerReader.getTaskDetail(name)
  );

  // Settings management
  ipcMain.handle('pchelper:clear-local-data', () => {
    const db = getDatabase();
    db.prepare('DELETE FROM ai_chat_history').run();
    db.prepare('DELETE FROM alert_history').run();
    db.prepare('DELETE FROM health_history').run();
    db.prepare('DELETE FROM hardware_history').run();
    db.prepare('DELETE FROM conflict_log').run();
    db.prepare('DELETE FROM update_history').run();
    db.prepare('DELETE FROM settings').run();
    return { success: true };
  });

  // External links
  ipcMain.handle('pchelper:open-external', (_event, url: string) => {
    shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  hardwareCollector?.stopPolling();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
