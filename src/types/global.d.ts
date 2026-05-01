import type { HardwareSnapshot, SoftwareEntry, ConflictReport, AppEntry, UninstallResult, UpdateScanResult, Alert, HealthScore, StartupEntry, StartupImpact, NetworkInterface, NetworkTraffic, SpeedTestResult, ProcessEntry, SystemInfo, BenchmarkResult, ScheduledTask, LocalUser, LocalGroup, UacSettings, CredentialEntry } from '../utils/types';
import type { PolicyCategory, PolicyEntry } from '../../electron/policy/policyManager';
import type { FirewallRule } from '../../electron/firewall/reader';
import type { UsbDevice, UsbHistoryEntry } from '../../electron/usb/manager';
import type { DiskCategory, LargeFile, TempFileCategory } from '../../electron/disk/analyzer';
import type { TempFileCategory as CleanupTempCategory, CleanupResult } from '../../electron/cleanup/tempCleaner';
import type { BrowserCacheInfo } from '../../electron/cleanup/browserCleaner';
import type { SystemCleanupCategory } from '../../electron/cleanup/systemCleaner';
import type { LargeFileEntry } from '../../electron/cleanup/largeFileScanner';
import type { DuplicateGroup } from '../../electron/cleanup/duplicateFinder';
import type { SecurityStatus } from '../../electron/security/center';
import type { ClipboardEntry } from '../../electron/clipboard/history';
import type { DriverEntry, DriverBackup, DriverVersionDiff } from '../../electron/driver/driverManager';
import type { ServiceEntry, ServiceDetail } from '../../electron/services/manager';
import type { EventLogEntry } from '../../electron/events/reader';
import type { BatteryStatus, BatteryHistoryPoint } from '../../electron/battery/reporter';
import type { PerfLogSession, PerfLogEntry } from '../../electron/perflog/recorder';
import type { RegistryKey, RegistrySearchResult } from '../../electron/registry/viewer';
import type { NetworkConnection, ListeningPort, ConnectionStats } from '../../electron/network/connections';
import type { FileAssociation, ProtocolAssociation } from '../../electron/files/associations';
import type { DisplayMonitor, AdapterInfo, ColorProfile } from '../../electron/display/monitor';
import type { PowerPlan, PowerReport } from '../../electron/power/manager';
import type { RestorePoint, RestoreSettings } from '../../electron/restore/manager';
import type { ScannedFile, ScanConfig } from '../../electron/files/scanner';
import type { RemoteConnection } from '../../electron/remote/manager';
import type { ExportReport, ReportTemplate } from '../../electron/report/exporter';
import type { MemoryModule, MemoryAllocation, MemoryTiming, MemoryHealth, PageFileInfo } from '../../electron/memory/analyzer';
import type { WindowsFeature } from '../../electron/features/manager';
import type { SoundScheme, SystemSound, AudioDevice } from '../../electron/sounds/manager';
import type { FontEntry } from '../../electron/fonts/manager';
import type { MonitorInfo, AudioDeviceInfo, BluetoothDeviceEntry, PrinterEntry, GameControllerEntry } from '../../electron/external/deviceManager';
import type { PingResult } from '../../electron/netdiag/ping';
import type { TraceRouteResult } from '../../electron/netdiag/traceroute';
import type { PortScanResult } from '../../electron/netdiag/portscanner';
import type { DnsLookupResult } from '../../electron/netdiag/dns';
import type { BandwidthResult } from '../../electron/netdiag/bandwidth';

export {};

declare global {
  interface Window {
    pchelper: {
      // Hardware
      getHardwareSnapshot: () => Promise<HardwareSnapshot>;
      startHardwarePolling: (interval?: number) => Promise<void>;
      stopHardwarePolling: () => Promise<void>;
      getHardwareHistory: (limit?: number) => Promise<unknown[]>;
      onHardwareUpdate: (callback: (data: unknown) => void) => () => void;

      // Software
      getInstalledApps: () => Promise<SoftwareEntry[]>;
      searchApps: (query: string) => Promise<SoftwareEntry[]>;

      // Chat
      sendChatMessage: (
        message: string,
        endpoint?: string,
        model?: string
      ) => Promise<{ role: string; content: string }>;
      getChatHistory: (limit?: number) => Promise<unknown[]>;
      clearChatHistory: () => Promise<void>;

      // Settings
      getSetting: (key: string) => Promise<string | undefined>;
      setSetting: (key: string, value: string) => Promise<void>;
      getAllSettings: () => Promise<Array<{ key: string; value: string }>>;

      // App Manager
      getManagedApps: () => Promise<AppEntry[]>;
      uninstallApp: (name: string) => Promise<{ success: boolean; message: string }>;
      uninstallSelected: (names: string[]) => Promise<UninstallResult>;
      getAppDetails: (name: string) => Promise<AppEntry & { description: string; dependencies: string[] }>;

      // Conflicts
      scanConflicts: () => Promise<ConflictReport>;
      dismissConflict: (id: number) => Promise<void>;
      getConflictHistory: (limit?: number) => Promise<unknown[]>;

      // Updates
      scanUpdates: () => Promise<UpdateScanResult>;
      getUpdateHistory: (limit?: number) => Promise<unknown[]>;

      // Alerts
      getAlerts: () => Promise<Alert[]>;
      dismissAlert: (id: string) => Promise<void>;
      snoozeAlert: (id: string, minutes: number) => Promise<void>;
      dismissAllAlerts: () => Promise<void>;
      getAlertHistory: (limit?: number) => Promise<unknown[]>;
      runAiAnalysis: () => Promise<Alert | null>;
      onAlertUpdate: (callback: (data: unknown) => void) => () => void;

      // Health
      getHealthScore: () => Promise<HealthScore>;
      getHealthHistory: (limit?: number) => Promise<unknown[]>;

      // App
      getAppVersion: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      closeWindow: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;

      // AI
      testAiConnection: (
        endpoint: string,
        model: string,
        apiKey: string
      ) => Promise<{ success: boolean; error?: string; models?: number }>;

      clearLocalData: () => Promise<{ success: boolean }>;

      onWindowStateChange: (callback: (isMaximized: boolean) => void) => () => void;

      // Startup
      getStartupApps: () => Promise<StartupEntry[]>;
      toggleStartupApp: (name: string, enabled: boolean) => Promise<{ success: boolean; message: string }>;
      disableSelectedStartup: (names: string[]) => Promise<{ success: number; failed: number; errors: string[] }>;
      getStartupImpact: () => Promise<StartupImpact>;

      // Network
      getNetworkInterfaces: () => Promise<NetworkInterface[]>;
      getNetworkTraffic: () => Promise<NetworkTraffic>;
      runSpeedTest: () => Promise<SpeedTestResult>;

      // Process Monitor
      getProcesses: () => Promise<ProcessEntry[]>;
      killProcess: (pid: number) => Promise<{ success: boolean; message: string }>;
      getProcessDetail: (pid: number) => Promise<(ProcessEntry & { children: number[]; cpuHistory: number[]; memHistory: number[] }) | null>;

      // System Info
      getSystemInfo: () => Promise<SystemInfo>;

      // Benchmark
      runBenchmark: (onProgress: (pct: number, phase: string) => void) => Promise<BenchmarkResult>;
      getBenchmarkHistory: () => Promise<BenchmarkResult[]>;

      // Scheduled Tasks
      getScheduledTasks: () => Promise<ScheduledTask[]>;
      getTaskDetail: (name: string) => Promise<(ScheduledTask & { conditions: string[]; settings: string[] }) | null>;

      // Firewall
      getFirewallRules: () => Promise<FirewallRule[]>;
      toggleFirewallRule: (name: string, enabled: boolean) => Promise<{ success: boolean; message: string }>;

      // USB Devices
      getUsbDevices: () => Promise<UsbDevice[]>;
      getUsbHistory: () => Promise<UsbHistoryEntry[]>;
      ejectUsbDevice: (serialNumber: string) => Promise<{ success: boolean; message: string }>;

      // Disk Cleanup (legacy)
      getDiskSpace: (drive: string) => Promise<DiskCategory[]>;
      getLargeFiles: (drive: string, limit?: number) => Promise<LargeFile[]>;
      getTempFiles: () => Promise<TempFileCategory[]>;
      cleanTempFiles: (categories: string[]) => Promise<{ freedMB: number; errors: string[] }>;

      // Cleanup - Temp & System
      scanTempFiles: () => Promise<CleanupTempCategory[]>;
      cleanTempFilesAdv: (categories: string[]) => Promise<CleanupResult[]>;
      scanBrowserCaches: () => Promise<BrowserCacheInfo[]>;
      cleanBrowserCache: (browser: string) => Promise<{ size: number; message: string }>;
      scanSystemCleanup: () => Promise<SystemCleanupCategory[]>;
      cleanSystem: (categories: string[]) => Promise<CleanupResult[]>;

      // Cleanup - Large Files & Duplicates
      scanLargeFiles: (minSizeMB?: number, scanPath?: string) => Promise<LargeFileEntry[]>;
      scanDuplicates: (paths?: string[]) => Promise<DuplicateGroup[]>;
      onLargeFilesProgress: (callback: (data: { pct: number; current: string }) => void) => () => void;
      onDuplicatesProgress: (callback: (data: { pct: number }) => void) => () => void;

      // Security
      getSecurityStatus: () => Promise<SecurityStatus>;
      runQuickScan: () => Promise<{ threats: number; scanned: number; duration: string; status: 'clean' | 'threats_found' }>;

      // Clipboard
      getClipboardHistory: () => Promise<ClipboardEntry[]>;
      clearClipboardHistory: () => Promise<void>;
      removeClipboardEntry: (id: string) => Promise<void>;
      toggleClipboardPin: (id: string) => Promise<void>;

      // Drivers
      listDrivers: () => Promise<DriverEntry[]>;
      getDriverDetail: (hardwareId: string) => Promise<DriverEntry | null>;
      createDriverBackup: (name: string, driverIds?: string[]) => Promise<DriverBackup>;
      listDriverBackups: () => Promise<DriverBackup[]>;
      restoreDriverBackup: (backupId: string) => Promise<{ success: boolean; message: string; restoredCount: number }>;
      getDriverVersionDiff: (backupId: string) => Promise<DriverVersionDiff[]>;
      deleteDriverBackup: (backupId: string) => Promise<boolean>;

      // Services
      getServices: () => Promise<ServiceEntry[]>;
      startService: (name: string) => Promise<{ success: boolean; message: string }>;
      stopService: (name: string) => Promise<{ success: boolean; message: string }>;
      restartService: (name: string) => Promise<{ success: boolean; message: string }>;
      setServiceStartup: (name: string, type: ServiceEntry['startupType']) => Promise<{ success: boolean; message: string }>;
      getServiceDetails: (name: string) => Promise<ServiceDetail | null>;

      // Event Log
      getEvents: (logName?: string, level?: string, limit?: number, search?: string) => Promise<EventLogEntry[]>;
      getEventLogs: () => Promise<string[]>;
      getEventCounts: () => Promise<Record<string, Record<string, number>>>;

      // Battery
      getBatteryStatus: () => Promise<BatteryStatus>;
      getBatteryHistory: (hours?: number) => Promise<BatteryHistoryPoint[]>;
      getBatteryReport: () => Promise<{ design: number; actual: number; wear: number; cycles: number; estimatedLife: number }>;

      // Perf Log
      getPerfLogSessions: () => Promise<PerfLogSession[]>;
      startPerfRecording: (name: string) => Promise<PerfLogSession>;
      stopPerfRecording: () => Promise<PerfLogSession | null>;
      getPerfSessionData: (sessionId: string) => Promise<PerfLogEntry[]>;
      deletePerfSession: (sessionId: string) => Promise<void>;
      getActiveSession: () => Promise<PerfLogSession | null>;

      // Registry Viewer
      getRegistryRoots: () => Promise<RegistryKey[]>;
      getRegistryKey: (path: string) => Promise<RegistryKey>;
      navigateRegistry: (path: string) => Promise<{ key: RegistryKey; subkeys: string[]; parent: string | null }>;
      searchRegistry: (query: string) => Promise<RegistrySearchResult[]>;
      getRegistryFavorites: () => Promise<string[]>;

      // Network Connections
      getNetworkConnections: (filter?: { state?: string; protocol?: string; pid?: number }) => Promise<NetworkConnection[]>;
      getListeningPorts: () => Promise<ListeningPort[]>;
      getConnectionStats: () => Promise<ConnectionStats>;
      getGeoInfo: (ip: string) => Promise<{ country: string; city: string; isp: string } | null>;

      // File Associations
      getFileAssociations: () => Promise<FileAssociation[]>;
      getProtocolAssociations: () => Promise<ProtocolAssociation[]>;
      getCategoryBreakdown: () => Promise<Record<string, number>>;
      setFileAssociation: (extension: string, program: string) => Promise<{ success: boolean; message: string }>;

      // Display Info
      getDisplays: () => Promise<DisplayMonitor[]>;
      getAdapterInfo: () => Promise<AdapterInfo>;
      getColorProfiles: () => Promise<ColorProfile[]>;

      // Power Plan Manager
      getPowerPlans: () => Promise<PowerPlan[]>;
      setActivePlan: (guid: string) => Promise<{ success: boolean; message: string }>;
      getPowerReport: () => Promise<PowerReport>;

      // System Restore
      getRestorePoints: () => Promise<RestorePoint[]>;
      getRestoreSettings: () => Promise<RestoreSettings>;
      createRestorePoint: (description: string) => Promise<{ success: boolean; message: string; point?: RestorePoint }>;
      restoreToPoint: (id: number) => Promise<{ success: boolean; message: string }>;
      deleteRestorePoint: (id: number) => Promise<{ success: boolean; message: string }>;
      toggleRestoreProtection: (enabled: boolean) => Promise<{ success: boolean }>;
      setRestoreMaxUsage: (percentage: number) => Promise<{ success: boolean }>;

      // File Scanner
      scanFiles: (config: ScanConfig, onProgress: (pct: number, phase: string, found: number) => void) => Promise<{
        files: ScannedFile[];
        totalSizeMB: number;
        totalFiles: number;
        duplicates: ScannedFile[];
        categories: Record<string, { count: number; totalMB: number }>;
      }>;
      cancelFileScan: () => Promise<void>;
      getRecentFileScans: () => Promise<Array<{ timestamp: number; totalFiles: number; totalSizeMB: number; duplicates: number }>>;

      // Remote Desktop Manager
      getRemoteConnections: () => Promise<RemoteConnection[]>;
      connectRemote: (id: string) => Promise<{ success: boolean; message: string; command?: string }>;
      testRemoteConnection: (id: string) => Promise<{ success: boolean; latency: number; message: string }>;
      addRemoteConnection: (conn: Omit<RemoteConnection, 'id' | 'lastConnected' | 'connectionCount'>) => Promise<RemoteConnection>;
      updateRemoteConnection: (id: string, updates: Partial<RemoteConnection>) => Promise<RemoteConnection>;
      deleteRemoteConnection: (id: string) => Promise<void>;
      toggleRemoteFavorite: (id: string) => Promise<void>;
      getRemoteGroups: () => Promise<string[]>;
      exportRemoteConnections: () => Promise<string>;
      importRemoteConnections: (path: string) => Promise<{ added: number; failed: number }>;

      // Report Export
      generateReport: (template?: ReportTemplate) => Promise<ExportReport>;
      exportReportJson: (report: ExportReport) => Promise<string>;
      exportReportHtml: (report: ExportReport) => Promise<string>;
      exportReportText: (report: ExportReport) => Promise<string>;
      exportReportCsv: (section: string, data: unknown[]) => Promise<string>;
      getReportTemplates: () => Promise<ReportTemplate[]>;

      // Memory Analyzer
      getMemoryModules: () => Promise<MemoryModule[]>;
      getMemoryAllocation: () => Promise<MemoryAllocation[]>;
      getMemoryTimings: () => Promise<MemoryTiming>;
      getMemoryHealth: () => Promise<MemoryHealth>;
      getPageFile: () => Promise<PageFileInfo>;

      // Windows Features Manager
      getWindowsFeatures: () => Promise<WindowsFeature[]>;
      getFeatureCategories: () => Promise<string[]>;
      toggleFeature: (name: string, enable: boolean) => Promise<{ success: boolean; message: string; restartRequired: boolean }>;
      getFeatureDetails: (name: string) => Promise<(WindowsFeature & {
        registryPath: string;
        imagePath: string;
        installDate: string | null;
        logPath: string;
        statusPaths: string[];
      }) | null>;
      getFeatureInstallSize: () => Promise<{ totalEnabledMB: number; totalAvailableMB: number; totalDisabledMB: number }>;

      // Sound Manager
      getSoundScheme: () => Promise<SoundScheme>;
      getSoundSchemes: () => Promise<SoundScheme[]>;
      getAudioDevices: () => Promise<AudioDevice[]>;
      setSoundScheme: (name: string) => Promise<{ success: boolean }>;
      setSoundEvent: (eventName: string, file: string | null) => Promise<{ success: boolean }>;
      resetSoundDefaults: () => Promise<{ success: boolean }>;
      testSystemSound: (eventName: string) => Promise<{ success: boolean }>;
      playSoundFile: (path: string) => Promise<{ success: boolean }>;

      // Font Manager
      getFonts: () => Promise<FontEntry[]>;
      getFontPreview: (fontName: string, text: string, size: number) => Promise<string>;
      getFontDetail: (name: string) => Promise<(FontEntry & {
        glyphCount: number;
        kerningPairs: number;
        panose: string;
        fsSelection: string;
        unicodeRanges: string[];
        embeddingRights: string;
        subfamily: string;
        fullName: string;
        postScriptName: string;
      }) | null>;
      getFontsGrouped: () => Promise<Record<string, FontEntry[]>>;
      getRecentFonts: () => Promise<string[]>;

      // Repair
      startRepairScan: (onProgress: (progress: { phase: string; pct: number; category?: string; issuesFound: number }) => void) => Promise<{
        issues: Array<{
          id: string;
          category: string;
          severity: 'critical' | 'warning' | 'info';
          title: string;
          description: string;
          details: string;
          evidence: string[];
          canAutoFix: boolean;
          autoFixDescription: string;
          canGuideFix: boolean;
          requiresAdmin: boolean;
          fixId: string;
          rollbackPlan: string;
        }>;
        systemInfo: { os: string; uptime: string; lastBoot: string; pendingUpdate: boolean; adminAccess: boolean };
        scanDuration: number;
      }>;
      getRepairDetail: (issueId: string) => Promise<unknown>;
      executeRepairFix: (issueId: string, createRestorePoint: boolean) => Promise<{
        success: boolean;
        message: string;
        requiresRestart: boolean;
        rollbackSteps?: string[];
        performedActions: string[];
        duration: number;
        error?: string;
      }>;
      undoRepairFix: () => Promise<{ success: boolean; message: string }>;
      aiDiagnoseIssues: (issues: unknown[], systemInfo: unknown) => Promise<{
        analysis: string;
        likelyRootCause: string;
        recommendedFix: Array<{ steps: string[]; priority: number; confidence: number; explanation: string }>;
        followUpQuestions: string[];
      }>;
      aiRepairChat: (message: string, context: { issues: unknown[]; history: Array<{ role: string; content: string }> }) => Promise<{
        reply: string;
        suggestedFixes?: string[];
      }>;
      analyzeBluescreen: () => Promise<{
        dumpFiles: Array<{ path: string; timestamp: string; sizeKB: number }>;
        eventLogEntries: Array<{ id: number; timestamp: string; message: string }>;
        possibleCauses: string[];
        stopCode: string | null;
        affectedDriver: string | null;
        recommendations: string[];
      }>;
      getRepairHistory: () => Promise<Array<{
        id: number;
        timestamp: string;
        issueId: string;
        issueTitle: string;
        category: string;
        severity: string;
        fixAction: string;
        fixResult: 'success' | 'failed' | 'partial';
        details: string;
        userApproved: boolean;
        requiresRestart: boolean;
        restartPerformed: boolean;
        rollbackAvailable: boolean;
        duration: number;
        adminElevated: boolean;
      }>>;
      repairCreateRestorePoint: (description: string) => Promise<{ success: boolean; message: string }>;
      elevateRepairPrivileges: () => Promise<{ success: boolean }>;
      runSfcScan: () => Promise<{ success: boolean; foundCorruption: boolean; repairedFiles: number; logPath: string; details: string[]; duration: number }>;
      runDismRestore: () => Promise<{ success: boolean; stage: string; progress: number; details: string[]; duration: number }>;

      // Performance Overlay
      togglePerfOverlay: (enabled: boolean) => Promise<void>;
      updateOverlayConfig: (config: OverlayConfigPartial) => Promise<void>;
      getOverlayStatus: () => Promise<{ active: boolean; config: OverlayConfigFull }>;
      getOverlayMetrics: () => Promise<OverlayMetricsData | null>;

      // NetDiag
      ping: (target: string, count?: number, timeout?: number) => Promise<PingResult>;
      traceRoute: (target: string) => Promise<TraceRouteResult>;
      scanPorts: (target: string, ports?: number[]) => Promise<PortScanResult>;
      dnsLookup: (domain: string, types?: string[]) => Promise<DnsLookupResult>;
      testBandwidth: () => Promise<BandwidthResult>;

      // User Accounts
      listLocalUsers: () => Promise<LocalUser[]>;
      listLocalGroups: () => Promise<LocalGroup[]>;
      getUserDetail: (name: string) => Promise<LocalUser | null>;
      getGroupDetail: (name: string) => Promise<LocalGroup | null>;
      getUacSettings: () => Promise<UacSettings>;
      listCredentials: () => Promise<CredentialEntry[]>;
      removeCredential: (targetName: string) => Promise<boolean>;

      // Policy Browser
      getPolicyCategories: () => Promise<PolicyCategory[]>;
      getPoliciesByCategory: (categoryId: string) => Promise<PolicyEntry[]>;
      searchPolicies: (query: string) => Promise<PolicyEntry[]>;
      getPolicyDetail: (id: string) => Promise<PolicyEntry | null>;

      // External Devices
      getMonitors: () => Promise<MonitorInfo[]>;
      getExternalAudioDevices: () => Promise<AudioDeviceInfo[]>;
      getBluetoothDevices: () => Promise<BluetoothDeviceEntry[]>;
      getPrinters: () => Promise<PrinterEntry[]>;
      getGameControllers: () => Promise<GameControllerEntry[]>;
      refreshDevices: () => Promise<void>;
    };
  }

  interface OverlayMetricsData {
    cpu: { usage: number; temp: number };
    memory: { used: number; total: number; usage: number };
    gpu: { usage: number; temp: number; memoryUsed: number; memoryTotal: number };
    fps: { current: number; min: number; max: number };
    network: { uploadSpeed: number; downloadSpeed: number };
    timestamp: number;
  }

  interface OverlayConfigFull {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    opacity: number;
    metrics: {
      showCpu: boolean;
      showMemory: boolean;
      showGpu: boolean;
      showFps: boolean;
      showNetwork: boolean;
    };
    fontSize: number;
    refreshInterval: number;
    clickThrough: boolean;
    autoHide: boolean;
    accentColor: string;
  }

  type OverlayConfigPartial = Partial<OverlayConfigFull>;
}
