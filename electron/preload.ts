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

  // App Manager
  getManagedApps: () => ipcRenderer.invoke('pchelper:get-managed-apps'),
  uninstallApp: (name: string) => ipcRenderer.invoke('pchelper:uninstall-app', name),
  uninstallSelected: (names: string[]) => ipcRenderer.invoke('pchelper:uninstall-selected', names),
  getAppDetails: (name: string) => ipcRenderer.invoke('pchelper:get-app-details', name),

  // Conflicts
  scanConflicts: () => ipcRenderer.invoke('pchelper:scan-conflicts'),
  dismissConflict: (id: number) =>
    ipcRenderer.invoke('pchelper:dismiss-conflict', id),
  getConflictHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-conflict-history', limit),

  // Updates
  scanUpdates: () => ipcRenderer.invoke('pchelper:scan-updates'),
  getUpdateHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-update-history', limit),

  // Alerts
  getAlerts: () => ipcRenderer.invoke('pchelper:get-alerts'),
  dismissAlert: (id: string) => ipcRenderer.invoke('pchelper:dismiss-alert', id),
  snoozeAlert: (id: string, minutes: number) =>
    ipcRenderer.invoke('pchelper:snooze-alert', id, minutes),
  dismissAllAlerts: () => ipcRenderer.invoke('pchelper:dismiss-all-alerts'),
  getAlertHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-alert-history', limit),
  runAiAnalysis: () => ipcRenderer.invoke('pchelper:run-ai-analysis'),
  onAlertUpdate: (callback: (data: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) =>
      callback(data);
    ipcRenderer.on('pchelper:alert-update', handler);
    return () => {
      ipcRenderer.removeListener('pchelper:alert-update', handler);
    };
  },

  // Health
  getHealthScore: () => ipcRenderer.invoke('pchelper:get-health-score'),
  getHealthHistory: (limit?: number) =>
    ipcRenderer.invoke('pchelper:get-health-history', limit),

  // App
  getAppVersion: () => ipcRenderer.invoke('pchelper:get-app-version'),
  minimizeWindow: () => ipcRenderer.invoke('pchelper:minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('pchelper:maximize-window'),
  closeWindow: () => ipcRenderer.invoke('pchelper:close-window'),
  openExternal: (url: string) => ipcRenderer.invoke('pchelper:open-external', url),
});
