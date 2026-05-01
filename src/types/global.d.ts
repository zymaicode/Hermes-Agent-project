import type { HardwareSnapshot, SoftwareEntry } from '../utils/types';

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

      // App
      getAppVersion: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
  }
}
