import type { HardwareSnapshot, SoftwareEntry, ConflictReport, AppEntry, UninstallResult, UpdateScanResult, Alert, HealthScore } from '../utils/types';

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
      closeWindow: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}
