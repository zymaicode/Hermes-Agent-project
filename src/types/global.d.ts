import type { HardwareSnapshot, SoftwareEntry, ConflictReport, AppEntry, UninstallResult, UpdateScanResult, Alert, HealthScore, StartupEntry, StartupImpact, NetworkInterface, NetworkTraffic, SpeedTestResult, ProcessEntry, SystemInfo, BenchmarkResult, ScheduledTask } from '../utils/types';
import type { FirewallRule } from '../../electron/firewall/reader';
import type { UsbDevice, UsbHistoryEntry } from '../../electron/usb/manager';
import type { DiskCategory, LargeFile, TempFileCategory } from '../../electron/disk/analyzer';
import type { SecurityStatus } from '../../electron/security/center';
import type { ClipboardEntry } from '../../electron/clipboard/history';

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

      // Disk Cleanup
      getDiskSpace: (drive: string) => Promise<DiskCategory[]>;
      getLargeFiles: (drive: string, limit?: number) => Promise<LargeFile[]>;
      getTempFiles: () => Promise<TempFileCategory[]>;
      cleanTempFiles: (categories: string[]) => Promise<{ freedMB: number; errors: string[] }>;

      // Security
      getSecurityStatus: () => Promise<SecurityStatus>;
      runQuickScan: () => Promise<{ threats: number; scanned: number; duration: string; status: 'clean' | 'threats_found' }>;

      // Clipboard
      getClipboardHistory: () => Promise<ClipboardEntry[]>;
      clearClipboardHistory: () => Promise<void>;
      removeClipboardEntry: (id: string) => Promise<void>;
      toggleClipboardPin: (id: string) => Promise<void>;
    };
  }
}
