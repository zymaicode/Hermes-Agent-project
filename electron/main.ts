import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { initDatabase, getDatabase, saveHardwareSnapshot, getHardwareHistory, saveChatMessage, getChatHistory, getSetting, setSetting } from './database/index';
import { HardwareCollector } from './hardware/collector';
import { SoftwareCollector } from './software/collector';

let mainWindow: BrowserWindow | null = null;
let hardwareCollector: HardwareCollector | null = null;
const softwareCollector = new SoftwareCollector();

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
  });
  ipcMain.handle('pchelper:close-window', () => mainWindow?.close());
  ipcMain.handle('pchelper:get-app-version', () => app.getVersion());

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
