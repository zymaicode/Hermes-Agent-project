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
import { FirewallReader } from './firewall/reader';
import { UsbManager } from './usb/manager';
import { DiskAnalyzer } from './disk/analyzer';
import { TempCleaner } from './cleanup/tempCleaner';
import { BrowserCleaner } from './cleanup/browserCleaner';
import { SystemCleaner } from './cleanup/systemCleaner';
import { LargeFileScanner } from './cleanup/largeFileScanner';
import { DuplicateFinder } from './cleanup/duplicateFinder';
import { SecurityCenter } from './security/center';
import { ClipboardManager } from './clipboard/history';
import { DriverManager } from './driver/driverManager';
import { ServiceManager } from './services/manager';
import { EventLogReader } from './events/reader';
import { BatteryReporter } from './battery/reporter';
import { PerfLogRecorder } from './perflog/recorder';
import { RegistryViewer } from './registry/viewer';
import { NetworkConnectionMonitor } from './network/connections';
import { FileAssociationReader } from './files/associations';
import { DisplayInfoCollector } from './display/monitor';
import { PowerPlanManager } from './power/manager';
import { RestoreManager } from './restore/manager';
import { FileScanner } from './files/scanner';
import { RemoteDesktopManager } from './remote/manager';
import { ReportExporter } from './report/exporter';
import { MemoryAnalyzer } from './memory/analyzer';
import { WindowsFeaturesManager } from './features/manager';
import { SoundManager } from './sounds/manager';
import { FontManager } from './fonts/manager';
import { RepairEngine } from './repair/engine';
import { RepairAiAssistant } from './repair/ai';
import { BluescreenAnalyzer } from './repair/bluescreen';
import { runSfcScan, runDismRestore } from './repair/sfc';
import { OverlayManager } from './overlay/overlayManager';
import { OverlayDataCollector } from './overlay/dataCollector';
import { handleOverlayAiQuery } from './overlay/aiQuery';
import { UserManager } from './accounts/userManager';
import { UacManager } from './accounts/uacManager';
import { CredentialManager } from './accounts/credentialManager';
import { ping } from './netdiag/ping';
import { traceRoute } from './netdiag/traceroute';
import { scanPorts } from './netdiag/portscanner';
import { dnsLookup } from './netdiag/dns';
import { testBandwidth } from './netdiag/bandwidth';
import { PolicyManager } from './policy/policyManager';
import { DeviceManager } from './external/deviceManager';
import { getDiagnosticEngine, resetDiagnosticEngine } from './ai/aiProvider';
import { analyzeProcess } from './ai/behaviorBridge';
import { detectGames } from './game/gameDetector';
import { optimizeForGaming, restoreAfterGaming, getActiveOptimization } from './game/gameOptimizer';
import { startRecording as fpsStartRecording, stopRecording as fpsStopRecording, getFpsHistory, getSessionDetail, clearFpsHistory } from './game/fpsRecorder';
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
const firewallReader = new FirewallReader();
const usbManager = new UsbManager();
const diskAnalyzer = new DiskAnalyzer();
const tempCleaner = new TempCleaner();
const browserCleaner = new BrowserCleaner();
const systemCleaner = new SystemCleaner();
const largeFileScanner = new LargeFileScanner();
const duplicateFinder = new DuplicateFinder();
const securityCenter = new SecurityCenter();
const clipboardManager = new ClipboardManager();
const driverManager = new DriverManager();
const serviceManager = new ServiceManager();
const eventLogReader = new EventLogReader();
const batteryReporter = new BatteryReporter();
const perfLogRecorder = new PerfLogRecorder();
const registryViewer = new RegistryViewer();
const networkConnectionMonitor = new NetworkConnectionMonitor();
const fileAssociationReader = new FileAssociationReader();
const displayInfoCollector = new DisplayInfoCollector();
const powerPlanManager = new PowerPlanManager();
const restoreManager = new RestoreManager();
const fileScanner = new FileScanner();
const remoteDesktopManager = new RemoteDesktopManager();
const reportExporter = new ReportExporter();
const memoryAnalyzer = new MemoryAnalyzer();
const windowsFeaturesManager = new WindowsFeaturesManager();
const soundManager = new SoundManager();
const fontManager = new FontManager();
const repairEngine = new RepairEngine();
const bluescreenAnalyzer = new BluescreenAnalyzer();
const overlayManager = new OverlayManager();
const overlayCollector = new OverlayDataCollector();
const userManager = new UserManager();
const uacManager = new UacManager();
const credentialManager = new CredentialManager();
const policyManager = new PolicyManager();
const deviceManager = new DeviceManager();

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
    if (key.startsWith('ai_')) { resetDiagnosticEngine(); }
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

  // AI Diagnostic
  ipcMain.handle('pchelper:run-ai-diagnostic', async () => {
    if (!hardwareCollector) return null;
    const snapshot = hardwareCollector.getSnapshot();
    const engine = await getDiagnosticEngine();
    return engine.runFullDiagnostic(snapshot);
  });

  ipcMain.handle('pchelper:reset-ai-engine', () => {
    resetDiagnosticEngine();
    return true;
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

  // Firewall
  ipcMain.handle('pchelper:get-firewall-rules', () =>
    firewallReader.getRules()
  );

  ipcMain.handle('pchelper:toggle-firewall-rule', (_event, name: string, enabled: boolean) =>
    firewallReader.toggleRule(name, enabled)
  );

  // USB Devices
  ipcMain.handle('pchelper:get-usb-devices', () =>
    usbManager.getConnectedDevices()
  );

  ipcMain.handle('pchelper:get-usb-history', () =>
    usbManager.getHistory()
  );

  ipcMain.handle('pchelper:eject-usb-device', (_event, serialNumber: string) =>
    usbManager.ejectDevice(serialNumber)
  );

  // Disk Cleanup (legacy - keep for backward compat)
  ipcMain.handle('pchelper:get-disk-space', (_event, drive: string) =>
    diskAnalyzer.getSpaceDistribution(drive)
  );

  ipcMain.handle('pchelper:get-large-files', (_event, drive: string, limit?: number) =>
    diskAnalyzer.getLargeFiles(drive, limit)
  );

  ipcMain.handle('pchelper:get-temp-files', () =>
    diskAnalyzer.getTempFiles()
  );

  ipcMain.handle('pchelper:clean-temp-files', (_event, categories: string[]) =>
    diskAnalyzer.cleanTempFiles(categories)
  );

  // Cleanup - Temp Files
  ipcMain.handle('pchelper:cleanup-scan-temp', () =>
    tempCleaner.scanTempFiles()
  );

  ipcMain.handle('pchelper:cleanup-clean-temp', (_event, categories: string[]) =>
    tempCleaner.cleanTempFiles(categories)
  );

  // Cleanup - Browser Caches
  ipcMain.handle('pchelper:cleanup-scan-browsers', () =>
    browserCleaner.scanBrowserCaches()
  );

  ipcMain.handle('pchelper:cleanup-clean-browser', (_event, browser: string) =>
    browserCleaner.cleanBrowserCache(browser)
  );

  // Cleanup - System
  ipcMain.handle('pchelper:cleanup-scan-system', () =>
    systemCleaner.scanSystem()
  );

  ipcMain.handle('pchelper:cleanup-clean-system', (_event, categories: string[]) =>
    systemCleaner.cleanSystem(categories)
  );

  // Cleanup - Large Files
  ipcMain.handle('pchelper:cleanup-scan-large-files', async (_event, minSizeMB?: number, scanPath?: string) => {
    const results = await largeFileScanner.scanLargeFiles(minSizeMB, scanPath, (pct, current) => {
      mainWindow?.webContents.send('pchelper:cleanup-large-files-progress', { pct, current });
    });
    return results;
  });

  // Cleanup - Duplicates
  ipcMain.handle('pchelper:cleanup-scan-duplicates', async (_event, paths?: string[]) => {
    const results = await duplicateFinder.scanForDuplicates(paths, (pct) => {
      mainWindow?.webContents.send('pchelper:cleanup-duplicates-progress', { pct });
    });
    return results;
  });

  // Security
  ipcMain.handle('pchelper:get-security-status', () =>
    securityCenter.getStatus()
  );

  ipcMain.handle('pchelper:run-quick-scan', () =>
    securityCenter.runQuickScan()
  );

  // Clipboard
  ipcMain.handle('pchelper:get-clipboard-history', () =>
    clipboardManager.getHistory()
  );

  ipcMain.handle('pchelper:clear-clipboard-history', () =>
    clipboardManager.clearHistory()
  );

  ipcMain.handle('pchelper:remove-clipboard-entry', (_event, id: string) =>
    clipboardManager.removeEntry(id)
  );

  ipcMain.handle('pchelper:toggle-clipboard-pin', (_event, id: string) =>
    clipboardManager.togglePin(id)
  );

  // Drivers
  ipcMain.handle('pchelper:driver-list', () =>
    driverManager.listDrivers()
  );

  ipcMain.handle('pchelper:driver-detail', (_event, hardwareId: string) =>
    driverManager.getDriverDetail(hardwareId)
  );

  ipcMain.handle('pchelper:driver-create-backup', (_event, name: string, driverIds?: string[]) =>
    driverManager.createBackup(name, driverIds)
  );

  ipcMain.handle('pchelper:driver-list-backups', () =>
    driverManager.listBackups()
  );

  ipcMain.handle('pchelper:driver-restore-backup', (_event, backupId: string) =>
    driverManager.restoreBackup(backupId)
  );

  ipcMain.handle('pchelper:driver-version-diff', (_event, backupId: string) =>
    driverManager.getVersionDiff(backupId)
  );

  ipcMain.handle('pchelper:driver-delete-backup', (_event, backupId: string) =>
    driverManager.deleteBackup(backupId)
  );

  // Services
  ipcMain.handle('pchelper:get-services', () =>
    serviceManager.getServices()
  );

  ipcMain.handle('pchelper:start-service', (_event, name: string) =>
    serviceManager.startService(name)
  );

  ipcMain.handle('pchelper:stop-service', (_event, name: string) =>
    serviceManager.stopService(name)
  );

  ipcMain.handle('pchelper:restart-service', (_event, name: string) =>
    serviceManager.restartService(name)
  );

  ipcMain.handle('pchelper:set-service-startup', (_event, name: string, type: string) =>
    serviceManager.setStartupType(name, type as import('./services/manager').ServiceEntry['startupType'])
  );

  ipcMain.handle('pchelper:get-service-details', (_event, name: string) =>
    serviceManager.getServiceDetails(name)
  );

  // Event Log
  ipcMain.handle('pchelper:get-events', (_event, logName?: string, level?: string, limit?: number, search?: string) =>
    eventLogReader.getEvents(logName, level, limit, search)
  );

  ipcMain.handle('pchelper:get-event-logs', () =>
    eventLogReader.getLogNames()
  );

  ipcMain.handle('pchelper:get-event-counts', () =>
    eventLogReader.getEventCounts()
  );

  // Battery
  ipcMain.handle('pchelper:get-battery-status', () =>
    batteryReporter.getBatteryStatus()
  );

  ipcMain.handle('pchelper:get-battery-history', (_event, hours?: number) =>
    batteryReporter.getBatteryHistory(hours)
  );

  ipcMain.handle('pchelper:get-battery-report', () =>
    batteryReporter.getBatteryReport()
  );

  // Perf Log
  ipcMain.handle('pchelper:get-perf-log-sessions', () =>
    perfLogRecorder.getSessions()
  );

  ipcMain.handle('pchelper:start-perf-recording', (_event, name: string) =>
    perfLogRecorder.startRecording(name)
  );

  ipcMain.handle('pchelper:stop-perf-recording', () =>
    perfLogRecorder.stopRecording()
  );

  ipcMain.handle('pchelper:get-perf-session-data', (_event, sessionId: string) =>
    perfLogRecorder.getSessionData(sessionId)
  );

  ipcMain.handle('pchelper:delete-perf-session', (_event, sessionId: string) =>
    perfLogRecorder.deleteSession(sessionId)
  );

  ipcMain.handle('pchelper:get-active-session', () =>
    perfLogRecorder.getActiveSession()
  );

  // Registry Viewer
  ipcMain.handle('pchelper:get-registry-roots', () =>
    registryViewer.getRootKeys()
  );

  ipcMain.handle('pchelper:get-registry-key', (_event, path: string) =>
    registryViewer.getKey(path)
  );

  ipcMain.handle('pchelper:navigate-registry', (_event, path: string) =>
    registryViewer.navigate(path)
  );

  ipcMain.handle('pchelper:search-registry', (_event, query: string) =>
    registryViewer.search(query)
  );

  ipcMain.handle('pchelper:get-registry-favorites', () =>
    registryViewer.getFavorites()
  );

  // Network Connections
  ipcMain.handle('pchelper:get-network-connections', (_event, filter?: { state?: string; protocol?: string; pid?: number }) =>
    networkConnectionMonitor.getConnections(filter)
  );

  ipcMain.handle('pchelper:get-listening-ports', () =>
    networkConnectionMonitor.getListeningPorts()
  );

  ipcMain.handle('pchelper:get-connection-stats', () =>
    networkConnectionMonitor.getConnectionStats()
  );

  ipcMain.handle('pchelper:get-geo-info', (_event, ip: string) =>
    networkConnectionMonitor.getGeoInfo(ip)
  );

  // File Associations
  ipcMain.handle('pchelper:get-file-associations', () =>
    fileAssociationReader.getAssociations()
  );

  ipcMain.handle('pchelper:get-protocol-associations', () =>
    fileAssociationReader.getProtocolAssociations()
  );

  ipcMain.handle('pchelper:get-category-breakdown', () =>
    fileAssociationReader.getCategoryBreakdown()
  );

  ipcMain.handle('pchelper:set-file-association', (_event, extension: string, program: string) =>
    fileAssociationReader.setAssociation(extension, program)
  );

  // Display Info
  ipcMain.handle('pchelper:get-displays', () =>
    displayInfoCollector.getDisplays()
  );

  ipcMain.handle('pchelper:get-adapter-info', () =>
    displayInfoCollector.getAdapterInfo()
  );

  ipcMain.handle('pchelper:get-color-profiles', () =>
    displayInfoCollector.getColorProfiles()
  );

  // Power Plan Manager
  ipcMain.handle('pchelper:get-power-plans', () =>
    powerPlanManager.getPlans()
  );

  ipcMain.handle('pchelper:set-active-plan', (_event, guid: string) =>
    powerPlanManager.setActivePlan(guid)
  );

  ipcMain.handle('pchelper:get-power-report', () =>
    powerPlanManager.getReport()
  );

  // System Restore
  ipcMain.handle('pchelper:get-restore-points', () =>
    restoreManager.getRestorePoints()
  );

  ipcMain.handle('pchelper:get-restore-settings', () =>
    restoreManager.getSettings()
  );

  ipcMain.handle('pchelper:create-restore-point', (_event, description: string) =>
    restoreManager.createRestorePoint(description)
  );

  ipcMain.handle('pchelper:restore-to-point', (_event, id: number) =>
    restoreManager.restoreToPoint(id)
  );

  ipcMain.handle('pchelper:delete-restore-point', (_event, id: number) =>
    restoreManager.deleteRestorePoint(id)
  );

  ipcMain.handle('pchelper:toggle-restore-protection', (_event, enabled: boolean) =>
    restoreManager.toggleProtection(enabled)
  );

  ipcMain.handle('pchelper:set-restore-max-usage', (_event, percentage: number) =>
    restoreManager.setMaxUsage(percentage)
  );

  // File Scanner
  ipcMain.handle('pchelper:scan-files', async (_event, config: import('./files/scanner').ScanConfig) => {
    const result = await fileScanner.scanFiles(config, (pct, phase, found) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('pchelper:file-scan-progress', { pct, phase, found });
      }
    });
    return result;
  });

  ipcMain.handle('pchelper:cancel-file-scan', () => {
    fileScanner.cancel();
  });

  ipcMain.handle('pchelper:get-recent-file-scans', () =>
    fileScanner.getRecentScans()
  );

  // Remote Desktop Manager
  ipcMain.handle('pchelper:get-remote-connections', () =>
    remoteDesktopManager.getConnections()
  );

  ipcMain.handle('pchelper:connect-remote', (_event, id: string) =>
    remoteDesktopManager.connect(id)
  );

  ipcMain.handle('pchelper:test-remote-connection', (_event, id: string) =>
    remoteDesktopManager.testConnection(id)
  );

  ipcMain.handle('pchelper:add-remote-connection', (_event, conn: Omit<import('./remote/manager').RemoteConnection, 'id' | 'lastConnected' | 'connectionCount'>) =>
    remoteDesktopManager.addConnection(conn)
  );

  ipcMain.handle('pchelper:update-remote-connection', (_event, id: string, updates: Partial<import('./remote/manager').RemoteConnection>) =>
    remoteDesktopManager.updateConnection(id, updates)
  );

  ipcMain.handle('pchelper:delete-remote-connection', (_event, id: string) => {
    remoteDesktopManager.deleteConnection(id);
  });

  ipcMain.handle('pchelper:toggle-remote-favorite', (_event, id: string) => {
    remoteDesktopManager.toggleFavorite(id);
  });

  ipcMain.handle('pchelper:get-remote-groups', () =>
    remoteDesktopManager.getGroups()
  );

  ipcMain.handle('pchelper:export-remote-connections', () =>
    remoteDesktopManager.exportToFile()
  );

  ipcMain.handle('pchelper:import-remote-connections', (_event, path: string) =>
    remoteDesktopManager.importFromFile(path)
  );

  // Report Export
  ipcMain.handle('pchelper:generate-report', (_event, template?: import('./report/exporter').ReportTemplate) =>
    reportExporter.generateReport(template)
  );

  ipcMain.handle('pchelper:export-report-json', (_event, report: import('./report/exporter').ExportReport) =>
    reportExporter.exportToJson(report)
  );

  ipcMain.handle('pchelper:export-report-html', (_event, report: import('./report/exporter').ExportReport) =>
    reportExporter.exportToHtml(report)
  );

  ipcMain.handle('pchelper:export-report-text', (_event, report: import('./report/exporter').ExportReport) =>
    reportExporter.exportToText(report)
  );

  ipcMain.handle('pchelper:export-report-csv', (_event, section: string, data: unknown[]) =>
    reportExporter.exportToCsv(section, data as Record<string, unknown>[])
  );

  ipcMain.handle('pchelper:get-report-templates', () =>
    reportExporter.getAvailableTemplates()
  );

  // Memory Analyzer
  ipcMain.handle('pchelper:get-memory-modules', () =>
    memoryAnalyzer.getModules()
  );

  ipcMain.handle('pchelper:get-memory-allocation', () =>
    memoryAnalyzer.getAllocation()
  );

  ipcMain.handle('pchelper:get-memory-timings', () =>
    memoryAnalyzer.getTimings()
  );

  ipcMain.handle('pchelper:get-memory-health', () =>
    memoryAnalyzer.getHealth()
  );

  ipcMain.handle('pchelper:get-page-file', () =>
    memoryAnalyzer.getPageFile()
  );

  // Windows Features Manager
  ipcMain.handle('pchelper:get-windows-features', () =>
    windowsFeaturesManager.getFeatures()
  );

  ipcMain.handle('pchelper:get-feature-categories', () =>
    windowsFeaturesManager.getCategories()
  );

  ipcMain.handle('pchelper:toggle-feature', (_event, name: string, enable: boolean) =>
    windowsFeaturesManager.toggleFeature(name, enable)
  );

  ipcMain.handle('pchelper:get-feature-details', (_event, name: string) =>
    windowsFeaturesManager.getFeatureDetails(name)
  );

  ipcMain.handle('pchelper:get-feature-install-size', () =>
    windowsFeaturesManager.getInstallSize()
  );

  // Sound Manager
  ipcMain.handle('pchelper:get-sound-scheme', () =>
    soundManager.getCurrentScheme()
  );

  ipcMain.handle('pchelper:get-sound-schemes', () =>
    soundManager.getSchemes()
  );

  ipcMain.handle('pchelper:get-audio-devices', () =>
    soundManager.getAudioDevices()
  );

  ipcMain.handle('pchelper:set-sound-scheme', (_event, name: string) =>
    soundManager.setScheme(name)
  );

  ipcMain.handle('pchelper:set-sound-event', (_event, eventName: string, file: string | null) =>
    soundManager.setSoundEvent(eventName, file)
  );

  ipcMain.handle('pchelper:reset-sound-defaults', () =>
    soundManager.resetToDefaults()
  );

  ipcMain.handle('pchelper:test-system-sound', (_event, eventName: string) =>
    soundManager.testSound(eventName)
  );

  ipcMain.handle('pchelper:play-sound-file', (_event, path: string) =>
    soundManager.playFile(path)
  );

  // Font Manager
  ipcMain.handle('pchelper:get-fonts', () =>
    fontManager.getInstalledFonts()
  );

  ipcMain.handle('pchelper:get-font-preview', (_event, fontName: string, text: string, size: number) =>
    fontManager.getFontPreview(fontName, text, size)
  );

  ipcMain.handle('pchelper:get-font-detail', (_event, name: string) =>
    fontManager.getFontDetail(name)
  );

  ipcMain.handle('pchelper:get-fonts-grouped', () =>
    fontManager.getGroupedByType()
  );

  ipcMain.handle('pchelper:get-recent-fonts', () =>
    fontManager.getRecentFonts()
  );

  // Repair: Start scan
  ipcMain.handle('pchelper:repair-start-scan', async () => {
    return repairEngine.startScan((progress) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('pchelper:repair-scan-progress', progress);
      }
    });
  });

  // Repair: Get issue detail
  ipcMain.handle('pchelper:repair-get-detail', (_event, issueId: string) =>
    repairEngine.getIssueById(issueId)
  );

  // Repair: Execute fix
  ipcMain.handle('pchelper:repair-execute-fix', async (_event, issueId: string, createRestorePoint: boolean) =>
    repairEngine.executeFix(issueId, createRestorePoint)
  );

  // Repair: Undo fix
  ipcMain.handle('pchelper:repair-undo-fix', async () =>
    repairEngine.undoLastFix()
  );

  // Repair: AI diagnose
  ipcMain.handle('pchelper:repair-ai-diagnose', async (_event, issues: unknown[], systemInfo: unknown) => {
    const apiKey = getSetting('ai_api_key') || '';
    const endpoint = getSetting('ai_endpoint') || 'https://api.deepseek.com';
    const model = getSetting('ai_model') || 'deepseek-v4-pro';
    const assistant = new RepairAiAssistant(endpoint, model, apiKey);
    return assistant.diagnoseIssues(
      issues as import('./repair/engine').DetectedIssue[],
      systemInfo as Record<string, unknown>,
    );
  });

  // Repair: AI chat
  ipcMain.handle('pchelper:repair-ai-chat', async (_event, message: string, context: {
    issues: import('./repair/engine').DetectedIssue[];
    history: Array<{ role: string; content: string }>;
  }) => {
    const apiKey = getSetting('ai_api_key') || '';
    const endpoint = getSetting('ai_endpoint') || 'https://api.deepseek.com';
    const model = getSetting('ai_model') || 'deepseek-v4-pro';
    const assistant = new RepairAiAssistant(endpoint, model, apiKey);
    return assistant.chatDiagnose(message, {
      issues: context.issues,
      history: context.history as import('./repair/ai').AiChatMessage[],
    });
  });

  // Repair: Bluescreen analysis
  ipcMain.handle('pchelper:repair-analyze-bluescreen', () =>
    bluescreenAnalyzer.scanMinidumps()
  );

  // Repair: History
  ipcMain.handle('pchelper:repair-get-history', () =>
    repairEngine.getRepairHistory()
  );

  // Repair: Create restore point
  ipcMain.handle('pchelper:repair-create-restore-point', async (_event, description: string) =>
    repairEngine.createSystemRestorePoint(description)
  );

  // Repair: Elevate privileges (simulated)
  ipcMain.handle('pchelper:repair-elevate', () =>
    ({ success: true })
  );

  // Repair: SFC scan
  ipcMain.handle('pchelper:repair-run-sfc', async () =>
    runSfcScan()
  );

  // Repair: DISM restore
  ipcMain.handle('pchelper:repair-run-dism', async () =>
    runDismRestore()
  );

  // Performance Overlay
  // Wire data collector to push metrics to overlay window
  overlayCollector.onData((data) => {
    overlayManager.sendMetrics(data);
  });

  ipcMain.handle('pchelper:overlay-toggle', (_event, enabled: boolean) => {
    if (enabled) {
      overlayManager.toggle(true);
      overlayCollector.start(overlayManager.getConfig().refreshInterval);
    } else {
      overlayManager.toggle(false);
      overlayCollector.stop();
    }
  });

  ipcMain.handle('pchelper:overlay-update-config', (_event, config: Partial<import('./overlay/overlayManager').OverlayWinConfig>) => {
    overlayManager.updateConfig(config);
    if (config.refreshInterval && overlayManager.isActive) {
      overlayCollector.start(config.refreshInterval);
    }
  });

  ipcMain.handle('pchelper:overlay-get-status', () => ({
    active: overlayManager.isActive,
    config: overlayManager.getConfig(),
  }));

  ipcMain.handle('pchelper:overlay-get-metrics', () =>
    overlayManager.getMetrics()
  );

  // Overlay AI query
  ipcMain.handle('pchelper:overlay-ai-query', async (_event, query: string) => {
    const snapshot = hardwareCollector?.getSnapshot();
    if (!snapshot) {
      return { answer: '❌ 硬件数据未就绪', error: 'no_hardware_data' };
    }
    return handleOverlayAiQuery(query, snapshot, {
      endpoint: getSetting('ai_endpoint') || 'https://api.deepseek.com',
      model: getSetting('ai_model') || 'deepseek-chat',
      apiKey: getSetting('ai_api_key') || '',
    });
  });

  // AI Process Behavior Analysis
  ipcMain.handle('pchelper:analyze-process', async (_event, proc: { name: string; pid: number; cpu: number; memory: number; status: string; path?: string; user?: string; startTime?: string }) => {
    return analyzeProcess(proc, {
      endpoint: getSetting('ai_endpoint') || 'https://api.deepseek.com',
      model: getSetting('ai_model') || 'deepseek-chat',
      apiKey: getSetting('ai_api_key') || '',
    });
  });

  // User Accounts
  ipcMain.handle('pchelper:accounts-list-users', () =>
    userManager.listUsers()
  );

  ipcMain.handle('pchelper:accounts-list-groups', () =>
    userManager.listGroups()
  );

  ipcMain.handle('pchelper:accounts-get-user-detail', (_event, name: string) =>
    userManager.getUserDetail(name)
  );

  ipcMain.handle('pchelper:accounts-get-group-detail', (_event, name: string) =>
    userManager.getGroupDetail(name)
  );

  // UAC Settings
  ipcMain.handle('pchelper:accounts-get-uac-settings', () =>
    uacManager.getSettings()
  );

  // Credentials
  ipcMain.handle('pchelper:accounts-list-credentials', () =>
    credentialManager.listCredentials()
  );

  ipcMain.handle('pchelper:accounts-remove-credential', (_event, targetName: string) =>
    credentialManager.removeCredential(targetName)
  );

  // NetDiag
  ipcMain.handle('pchelper:netdiag-ping', (_event, target: string, count?: number, timeout?: number) =>
    ping(target, count, timeout)
  );

  ipcMain.handle('pchelper:netdiag-traceroute', (_event, target: string) =>
    traceRoute(target)
  );

  ipcMain.handle('pchelper:netdiag-scan-ports', (_event, target: string, ports?: number[]) =>
    scanPorts(target, ports)
  );

  ipcMain.handle('pchelper:netdiag-dns-lookup', (_event, domain: string, types?: string[]) =>
    dnsLookup(domain, types)
  );

  ipcMain.handle('pchelper:netdiag-bandwidth-test', () =>
    testBandwidth()
  );

  // Policy Browser
  ipcMain.handle('pchelper:policy-get-categories', () =>
    policyManager.getCategories()
  );

  ipcMain.handle('pchelper:policy-get-by-category', (_event, categoryId: string) =>
    policyManager.getPoliciesByCategory(categoryId)
  );

  ipcMain.handle('pchelper:policy-search', (_event, query: string) =>
    policyManager.searchPolicies(query)
  );

  ipcMain.handle('pchelper:policy-get-detail', (_event, id: string) =>
    policyManager.getPolicyById(id)
  );

  // External Devices
  ipcMain.handle('pchelper:external-get-monitors', () =>
    deviceManager.getMonitors()
  );

  ipcMain.handle('pchelper:external-get-audio', () =>
    deviceManager.getAudioDevices()
  );

  ipcMain.handle('pchelper:external-get-bluetooth', () =>
    deviceManager.getBluetoothDevices()
  );

  ipcMain.handle('pchelper:external-get-printers', () =>
    deviceManager.getPrinters()
  );

  ipcMain.handle('pchelper:external-get-controllers', () =>
    deviceManager.getGameControllers()
  );

  ipcMain.handle('pchelper:external-refresh', () => {
    deviceManager.refresh();
  });

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

  // FPS History
  ipcMain.handle('pchelper:fps-start-recording', (_event, gameName: string) => {
    fpsStartRecording(gameName);
    return true;
  });
  ipcMain.handle('pchelper:fps-stop-recording', () => {
    return fpsStopRecording();
  });
  ipcMain.handle('pchelper:fps-get-history', (_event, limit?: number) => {
    return getFpsHistory(limit);
  });
  ipcMain.handle('pchelper:fps-get-session', (_event, sessionId: number) => {
    return getSessionDetail(sessionId);
  });
  ipcMain.handle('pchelper:fps-clear-history', () => {
    clearFpsHistory();
    return true;
  });

  // Game Optimizer
  ipcMain.handle('pchelper:detect-games', async () => {
    const processes = processMonitor.getProcesses();
    return detectGames(processes);
  });

  ipcMain.handle('pchelper:optimize-for-gaming', async () => {
    return optimizeForGaming();
  });

  ipcMain.handle('pchelper:restore-gaming', async () => {
    await restoreAfterGaming();
    return true;
  });

  ipcMain.handle('pchelper:get-optimization-status', () => {
    return getActiveOptimization();
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
  overlayCollector.stop();
  overlayManager.destroy();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
