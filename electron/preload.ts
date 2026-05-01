import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pchelper', {
  // Hardware
  getHardwareSnapshot: () =>
    ipcRenderer.invoke('pchelper:get-hardware-snapshot'),

  startHardwarePolling: (interval?: number) =>
    ipcRenderer.invoke('pchelper:start-hardware-polling', interval),

  stopHardwarePolling: () =>
    ipcRenderer.invoke('pchelper:stop-hardware-polling'),

  getHardwareHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-hardware-history', limit),

  onHardwareUpdate: (callback: (data: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) =>
      callback(data);
    ipcRenderer.on('pchelper:hardware-update', handler);
    return () => {
      ipcRenderer.removeListener('pchelper:hardware-update', handler);
    };
  },

  // Software
  getInstalledApps: () => ipcRenderer.invoke('pchelper:get-installed-apps'),
  searchApps: (query: string) =>
    ipcRenderer.invoke('pchelper:search-apps', query),

  // Chat
  sendChatMessage: (message: string, endpoint?: string, model?: string) =>
    ipcRenderer.invoke('pchelper:send-chat-message', message, endpoint, model),
  getChatHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-chat-history', limit),
  clearChatHistory: () => ipcRenderer.invoke('pchelper:clear-chat-history'),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('pchelper:get-setting', key),
  setSetting: (key: string, value: string) =>
    ipcRenderer.invoke('pchelper:set-setting', key, value),
  getAllSettings: () => ipcRenderer.invoke('pchelper:get-all-settings'),

  // App
  getAppVersion: () => ipcRenderer.invoke('pchelper:get-app-version'),
  minimizeWindow: () => ipcRenderer.invoke('pchelper:minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('pchelper:maximize-window'),
  closeWindow: () => ipcRenderer.invoke('pchelper:close-window'),
});
