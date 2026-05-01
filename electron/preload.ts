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

  // Firewall
  getFirewallRules: () => ipcRenderer.invoke('pchelper:get-firewall-rules'),
  toggleFirewallRule: (name: string, enabled: boolean) =>
    ipcRenderer.invoke('pchelper:toggle-firewall-rule', name, enabled),

  // USB Devices
  getUsbDevices: () => ipcRenderer.invoke('pchelper:get-usb-devices'),
  getUsbHistory: () => ipcRenderer.invoke('pchelper:get-usb-history'),
  ejectUsbDevice: (serialNumber: string) => ipcRenderer.invoke('pchelper:eject-usb-device', serialNumber),

  // Disk Cleanup (legacy)
  getDiskSpace: (drive: string) => ipcRenderer.invoke('pchelper:get-disk-space', drive),
  getLargeFiles: (drive: string, limit?: number) => ipcRenderer.invoke('pchelper:get-large-files', drive, limit),
  getTempFiles: () => ipcRenderer.invoke('pchelper:get-temp-files'),
  cleanTempFiles: (categories: string[]) => ipcRenderer.invoke('pchelper:clean-temp-files', categories),

  // Cleanup - Temp & System
  scanTempFiles: () => ipcRenderer.invoke('pchelper:cleanup-scan-temp'),
  cleanTempFilesAdv: (categories: string[]) => ipcRenderer.invoke('pchelper:cleanup-clean-temp', categories),
  scanBrowserCaches: () => ipcRenderer.invoke('pchelper:cleanup-scan-browsers'),
  cleanBrowserCache: (browser: string) => ipcRenderer.invoke('pchelper:cleanup-clean-browser', browser),
  scanSystemCleanup: () => ipcRenderer.invoke('pchelper:cleanup-scan-system'),
  cleanSystem: (categories: string[]) => ipcRenderer.invoke('pchelper:cleanup-clean-system', categories),

  // Cleanup - Large Files & Duplicates
  scanLargeFiles: (minSizeMB?: number, scanPath?: string) =>
    ipcRenderer.invoke('pchelper:cleanup-scan-large-files', minSizeMB, scanPath),
  scanDuplicates: (paths?: string[]) =>
    ipcRenderer.invoke('pchelper:cleanup-scan-duplicates', paths),
  onLargeFilesProgress: (callback: (data: { pct: number; current: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { pct: number; current: string }) => callback(data);
    ipcRenderer.on('pchelper:cleanup-large-files-progress', handler);
    return () => { ipcRenderer.removeListener('pchelper:cleanup-large-files-progress', handler); };
  },
  onDuplicatesProgress: (callback: (data: { pct: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { pct: number }) => callback(data);
    ipcRenderer.on('pchelper:cleanup-duplicates-progress', handler);
    return () => { ipcRenderer.removeListener('pchelper:cleanup-duplicates-progress', handler); };
  },

  // Security
  getSecurityStatus: () => ipcRenderer.invoke('pchelper:get-security-status'),
  runQuickScan: () => ipcRenderer.invoke('pchelper:run-quick-scan'),

  // Clipboard
  getClipboardHistory: () => ipcRenderer.invoke('pchelper:get-clipboard-history'),
  clearClipboardHistory: () => ipcRenderer.invoke('pchelper:clear-clipboard-history'),
  removeClipboardEntry: (id: string) => ipcRenderer.invoke('pchelper:remove-clipboard-entry', id),
  toggleClipboardPin: (id: string) => ipcRenderer.invoke('pchelper:toggle-clipboard-pin', id),

  // Drivers
  listDrivers: () => ipcRenderer.invoke('pchelper:driver-list'),
  getDriverDetail: (hardwareId: string) => ipcRenderer.invoke('pchelper:driver-detail', hardwareId),
  createDriverBackup: (name: string, driverIds?: string[]) => ipcRenderer.invoke('pchelper:driver-create-backup', name, driverIds),
  listDriverBackups: () => ipcRenderer.invoke('pchelper:driver-list-backups'),
  restoreDriverBackup: (backupId: string) => ipcRenderer.invoke('pchelper:driver-restore-backup', backupId),
  getDriverVersionDiff: (backupId: string) => ipcRenderer.invoke('pchelper:driver-version-diff', backupId),
  deleteDriverBackup: (backupId: string) => ipcRenderer.invoke('pchelper:driver-delete-backup', backupId),

  // Services
  getServices: () => ipcRenderer.invoke('pchelper:get-services'),
  startService: (name: string) => ipcRenderer.invoke('pchelper:start-service', name),
  stopService: (name: string) => ipcRenderer.invoke('pchelper:stop-service', name),
  restartService: (name: string) => ipcRenderer.invoke('pchelper:restart-service', name),
  setServiceStartup: (name: string, type: string) => ipcRenderer.invoke('pchelper:set-service-startup', name, type),
  getServiceDetails: (name: string) => ipcRenderer.invoke('pchelper:get-service-details', name),

  // Event Log
  getEvents: (logName?: string, level?: string, limit?: number, search?: string) => ipcRenderer.invoke('pchelper:get-events', logName, level, limit, search),
  getEventLogs: () => ipcRenderer.invoke('pchelper:get-event-logs'),
  getEventCounts: () => ipcRenderer.invoke('pchelper:get-event-counts'),

  // Battery
  getBatteryStatus: () => ipcRenderer.invoke('pchelper:get-battery-status'),
  getBatteryHistory: (hours?: number) => ipcRenderer.invoke('pchelper:get-battery-history', hours),
  getBatteryReport: () => ipcRenderer.invoke('pchelper:get-battery-report'),

  // Perf Log
  getPerfLogSessions: () => ipcRenderer.invoke('pchelper:get-perf-log-sessions'),
  startPerfRecording: (name: string) => ipcRenderer.invoke('pchelper:start-perf-recording', name),
  stopPerfRecording: () => ipcRenderer.invoke('pchelper:stop-perf-recording'),
  getPerfSessionData: (sessionId: string) => ipcRenderer.invoke('pchelper:get-perf-session-data', sessionId),
  deletePerfSession: (sessionId: string) => ipcRenderer.invoke('pchelper:delete-perf-session', sessionId),
  getActiveSession: () => ipcRenderer.invoke('pchelper:get-active-session'),

  // Registry Viewer
  getRegistryRoots: () => ipcRenderer.invoke('pchelper:get-registry-roots'),
  getRegistryKey: (path: string) => ipcRenderer.invoke('pchelper:get-registry-key', path),
  navigateRegistry: (path: string) => ipcRenderer.invoke('pchelper:navigate-registry', path),
  searchRegistry: (query: string) => ipcRenderer.invoke('pchelper:search-registry', query),
  getRegistryFavorites: () => ipcRenderer.invoke('pchelper:get-registry-favorites'),

  // Network Connections
  getNetworkConnections: (filter?: { state?: string; protocol?: string; pid?: number }) =>
    ipcRenderer.invoke('pchelper:get-network-connections', filter),
  getListeningPorts: () => ipcRenderer.invoke('pchelper:get-listening-ports'),
  getConnectionStats: () => ipcRenderer.invoke('pchelper:get-connection-stats'),
  getGeoInfo: (ip: string) => ipcRenderer.invoke('pchelper:get-geo-info', ip),

  // File Associations
  getFileAssociations: () => ipcRenderer.invoke('pchelper:get-file-associations'),
  getProtocolAssociations: () => ipcRenderer.invoke('pchelper:get-protocol-associations'),
  getCategoryBreakdown: () => ipcRenderer.invoke('pchelper:get-category-breakdown'),
  setFileAssociation: (extension: string, program: string) =>
    ipcRenderer.invoke('pchelper:set-file-association', extension, program),

  // Display Info
  getDisplays: () => ipcRenderer.invoke('pchelper:get-displays'),
  getAdapterInfo: () => ipcRenderer.invoke('pchelper:get-adapter-info'),
  getColorProfiles: () => ipcRenderer.invoke('pchelper:get-color-profiles'),

  // Power Plan Manager
  getPowerPlans: () => ipcRenderer.invoke('pchelper:get-power-plans'),
  setActivePlan: (guid: string) => ipcRenderer.invoke('pchelper:set-active-plan', guid),
  getPowerReport: () => ipcRenderer.invoke('pchelper:get-power-report'),

  // System Restore
  getRestorePoints: () => ipcRenderer.invoke('pchelper:get-restore-points'),
  getRestoreSettings: () => ipcRenderer.invoke('pchelper:get-restore-settings'),
  createRestorePoint: (description: string) =>
    ipcRenderer.invoke('pchelper:create-restore-point', description),
  restoreToPoint: (id: number) =>
    ipcRenderer.invoke('pchelper:restore-to-point', id),
  deleteRestorePoint: (id: number) =>
    ipcRenderer.invoke('pchelper:delete-restore-point', id),
  toggleRestoreProtection: (enabled: boolean) =>
    ipcRenderer.invoke('pchelper:toggle-restore-protection', enabled),
  setRestoreMaxUsage: (percentage: number) =>
    ipcRenderer.invoke('pchelper:set-restore-max-usage', percentage),

  // File Scanner
  scanFiles: (config: unknown, onProgress: (pct: number, phase: string, found: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { pct: number; phase: string; found: number }) =>
      onProgress(data.pct, data.phase, data.found);
    ipcRenderer.on('pchelper:file-scan-progress', handler);
    return ipcRenderer.invoke('pchelper:scan-files', config).finally(() => {
      ipcRenderer.removeListener('pchelper:file-scan-progress', handler);
    });
  },
  cancelFileScan: () => ipcRenderer.invoke('pchelper:cancel-file-scan'),
  getRecentFileScans: () => ipcRenderer.invoke('pchelper:get-recent-file-scans'),

  // Remote Desktop Manager
  getRemoteConnections: () => ipcRenderer.invoke('pchelper:get-remote-connections'),
  connectRemote: (id: string) => ipcRenderer.invoke('pchelper:connect-remote', id),
  testRemoteConnection: (id: string) => ipcRenderer.invoke('pchelper:test-remote-connection', id),
  addRemoteConnection: (conn: unknown) => ipcRenderer.invoke('pchelper:add-remote-connection', conn),
  updateRemoteConnection: (id: string, updates: unknown) =>
    ipcRenderer.invoke('pchelper:update-remote-connection', id, updates),
  deleteRemoteConnection: (id: string) => ipcRenderer.invoke('pchelper:delete-remote-connection', id),
  toggleRemoteFavorite: (id: string) => ipcRenderer.invoke('pchelper:toggle-remote-favorite', id),
  getRemoteGroups: () => ipcRenderer.invoke('pchelper:get-remote-groups'),
  exportRemoteConnections: () => ipcRenderer.invoke('pchelper:export-remote-connections'),
  importRemoteConnections: (path: string) => ipcRenderer.invoke('pchelper:import-remote-connections', path),

  // Report Export
  generateReport: (template?: unknown) => ipcRenderer.invoke('pchelper:generate-report', template),
  exportReportJson: (report: unknown) => ipcRenderer.invoke('pchelper:export-report-json', report),
  exportReportHtml: (report: unknown) => ipcRenderer.invoke('pchelper:export-report-html', report),
  exportReportText: (report: unknown) => ipcRenderer.invoke('pchelper:export-report-text', report),
  exportReportCsv: (section: string, data: unknown[]) => ipcRenderer.invoke('pchelper:export-report-csv', section, data),
  getReportTemplates: () => ipcRenderer.invoke('pchelper:get-report-templates'),

  // Memory Analyzer
  getMemoryModules: () => ipcRenderer.invoke('pchelper:get-memory-modules'),
  getMemoryAllocation: () => ipcRenderer.invoke('pchelper:get-memory-allocation'),
  getMemoryTimings: () => ipcRenderer.invoke('pchelper:get-memory-timings'),
  getMemoryHealth: () => ipcRenderer.invoke('pchelper:get-memory-health'),
  getPageFile: () => ipcRenderer.invoke('pchelper:get-page-file'),

  // Windows Features Manager
  getWindowsFeatures: () => ipcRenderer.invoke('pchelper:get-windows-features'),
  getFeatureCategories: () => ipcRenderer.invoke('pchelper:get-feature-categories'),
  toggleFeature: (name: string, enable: boolean) => ipcRenderer.invoke('pchelper:toggle-feature', name, enable),
  getFeatureDetails: (name: string) => ipcRenderer.invoke('pchelper:get-feature-details', name),
  getFeatureInstallSize: () => ipcRenderer.invoke('pchelper:get-feature-install-size'),

  // Sound Manager
  getSoundScheme: () => ipcRenderer.invoke('pchelper:get-sound-scheme'),
  getSoundSchemes: () => ipcRenderer.invoke('pchelper:get-sound-schemes'),
  getAudioDevices: () => ipcRenderer.invoke('pchelper:get-audio-devices'),
  setSoundScheme: (name: string) => ipcRenderer.invoke('pchelper:set-sound-scheme', name),
  setSoundEvent: (eventName: string, file: string | null) => ipcRenderer.invoke('pchelper:set-sound-event', eventName, file),
  resetSoundDefaults: () => ipcRenderer.invoke('pchelper:reset-sound-defaults'),
  testSystemSound: (eventName: string) => ipcRenderer.invoke('pchelper:test-system-sound', eventName),
  playSoundFile: (path: string) => ipcRenderer.invoke('pchelper:play-sound-file', path),

  // Font Manager
  getFonts: () => ipcRenderer.invoke('pchelper:get-fonts'),
  getFontPreview: (fontName: string, text: string, size: number) => ipcRenderer.invoke('pchelper:get-font-preview', fontName, text, size),
  getFontDetail: (name: string) => ipcRenderer.invoke('pchelper:get-font-detail', name),
  getFontsGrouped: () => ipcRenderer.invoke('pchelper:get-fonts-grouped'),
  getRecentFonts: () => ipcRenderer.invoke('pchelper:get-recent-fonts'),

  // Repair
  startRepairScan: (onProgress: (progress: { phase: string; pct: number; category?: string; issuesFound: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { phase: string; pct: number; category?: string; issuesFound: number }) =>
      onProgress(data);
    ipcRenderer.on('pchelper:repair-scan-progress', handler);
    return ipcRenderer.invoke('pchelper:repair-start-scan').finally(() => {
      ipcRenderer.removeListener('pchelper:repair-scan-progress', handler);
    });
  },
  getRepairDetail: (issueId: string) => ipcRenderer.invoke('pchelper:repair-get-detail', issueId),
  executeRepairFix: (issueId: string, createRestorePoint: boolean) =>
    ipcRenderer.invoke('pchelper:repair-execute-fix', issueId, createRestorePoint),
  undoRepairFix: () => ipcRenderer.invoke('pchelper:repair-undo-fix'),
  aiDiagnoseIssues: (issues: unknown[], systemInfo: unknown) =>
    ipcRenderer.invoke('pchelper:repair-ai-diagnose', issues, systemInfo),
  aiRepairChat: (message: string, context: { issues: unknown[]; history: Array<{ role: string; content: string }> }) =>
    ipcRenderer.invoke('pchelper:repair-ai-chat', message, context),
  analyzeBluescreen: () => ipcRenderer.invoke('pchelper:repair-analyze-bluescreen'),
  getRepairHistory: () => ipcRenderer.invoke('pchelper:repair-get-history'),
  repairCreateRestorePoint: (description: string) =>
    ipcRenderer.invoke('pchelper:repair-create-restore-point', description),
  elevateRepairPrivileges: () => ipcRenderer.invoke('pchelper:repair-elevate'),
  runSfcScan: () => ipcRenderer.invoke('pchelper:repair-run-sfc'),
  runDismRestore: () => ipcRenderer.invoke('pchelper:repair-run-dism'),

  // Performance Overlay
  togglePerfOverlay: (enabled: boolean) =>
    ipcRenderer.invoke('pchelper:overlay-toggle', enabled),
  updateOverlayConfig: (config: unknown) =>
    ipcRenderer.invoke('pchelper:overlay-update-config', config),
  getOverlayStatus: () =>
    ipcRenderer.invoke('pchelper:overlay-get-status'),
  getOverlayMetrics: () =>
    ipcRenderer.invoke('pchelper:overlay-get-metrics'),

  // NetDiag
  ping: (target: string, count?: number, timeout?: number) =>
    ipcRenderer.invoke('pchelper:netdiag-ping', target, count, timeout),
  traceRoute: (target: string) =>
    ipcRenderer.invoke('pchelper:netdiag-traceroute', target),
  scanPorts: (target: string, ports?: number[]) =>
    ipcRenderer.invoke('pchelper:netdiag-scan-ports', target, ports),
  dnsLookup: (domain: string, types?: string[]) =>
    ipcRenderer.invoke('pchelper:netdiag-dns-lookup', domain, types),
  testBandwidth: () =>
    ipcRenderer.invoke('pchelper:netdiag-bandwidth-test'),

  // User Accounts
  listLocalUsers: () =>
    ipcRenderer.invoke('pchelper:accounts-list-users'),
  listLocalGroups: () =>
    ipcRenderer.invoke('pchelper:accounts-list-groups'),
  getUserDetail: (name: string) =>
    ipcRenderer.invoke('pchelper:accounts-get-user-detail', name),
  getGroupDetail: (name: string) =>
    ipcRenderer.invoke('pchelper:accounts-get-group-detail', name),
  getUacSettings: () =>
    ipcRenderer.invoke('pchelper:accounts-get-uac-settings'),
  listCredentials: () =>
    ipcRenderer.invoke('pchelper:accounts-list-credentials'),
  removeCredential: (targetName: string) =>
    ipcRenderer.invoke('pchelper:accounts-remove-credential', targetName),

  // Policy Browser
  getPolicyCategories: () =>
    ipcRenderer.invoke('pchelper:policy-get-categories'),
  getPoliciesByCategory: (categoryId: string) =>
    ipcRenderer.invoke('pchelper:policy-get-by-category', categoryId),
  searchPolicies: (query: string) =>
    ipcRenderer.invoke('pchelper:policy-search', query),
  getPolicyDetail: (id: string) =>
    ipcRenderer.invoke('pchelper:policy-get-detail', id),
});
