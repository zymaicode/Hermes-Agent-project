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
  isMaximized: () => ipcRenderer.invoke('pchelper:is-maximized'),
  closeWindow: () => ipcRenderer.invoke('pchelper:close-window'),
  openExternal: (url: string) => ipcRenderer.invoke('pchelper:open-external', url),

  // AI
  testAiConnection: (endpoint: string, model: string, apiKey: string) =>
    ipcRenderer.invoke('pchelper:test-ai-connection', endpoint, model, apiKey),

  clearLocalData: () => ipcRenderer.invoke('pchelper:clear-local-data'),

  onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) =>
      callback(isMaximized);
    ipcRenderer.on('pchelper:window-state-changed', handler);
    return () => {
      ipcRenderer.removeListener('pchelper:window-state-changed', handler);
    };
  },

  // Startup
  getStartupApps: () => ipcRenderer.invoke('pchelper:get-startup-apps'),
  toggleStartupApp: (name: string, enabled: boolean) =>
    ipcRenderer.invoke('pchelper:toggle-startup-app', name, enabled),
  disableSelectedStartup: (names: string[]) =>
    ipcRenderer.invoke('pchelper:disable-selected-startup', names),
  getStartupImpact: () => ipcRenderer.invoke('pchelper:get-startup-impact'),

  // Network
  getNetworkInterfaces: () => ipcRenderer.invoke('pchelper:get-network-interfaces'),
  getNetworkTraffic: () => ipcRenderer.invoke('pchelper:get-network-traffic'),
  runSpeedTest: () => ipcRenderer.invoke('pchelper:run-speed-test'),

  // Process Monitor
  getProcesses: () => ipcRenderer.invoke('pchelper:get-processes'),
  killProcess: (pid: number) => ipcRenderer.invoke('pchelper:kill-process', pid),
  getProcessDetail: (pid: number) => ipcRenderer.invoke('pchelper:get-process-detail', pid),

  // System Info
  getSystemInfo: () => ipcRenderer.invoke('pchelper:get-system-info'),

  // Benchmark
  runBenchmark: (onProgress: (pct: number, phase: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { pct: number; phase: string }) =>
      onProgress(data.pct, data.phase);
    ipcRenderer.on('pchelper:benchmark-progress', handler);
    return ipcRenderer.invoke('pchelper:run-benchmark').finally(() => {
      ipcRenderer.removeListener('pchelper:benchmark-progress', handler);
    });
  },
  getBenchmarkHistory: () => ipcRenderer.invoke('pchelper:get-benchmark-history'),

  // Scheduled Tasks
  getScheduledTasks: () => ipcRenderer.invoke('pchelper:get-scheduled-tasks'),
  getTaskDetail: (name: string) => ipcRenderer.invoke('pchelper:get-task-detail', name),
});
