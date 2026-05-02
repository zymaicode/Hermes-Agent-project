import { create } from 'zustand';
import type { PrivacyScanResult } from '../../electron/privacy/types';

interface PrivacyState {
  scanResult: PrivacyScanResult | null;
  scanning: boolean;
  cleaning: boolean;
  lastScan: number;

  runScan: () => Promise<void>;
  cleanAll: () => Promise<void>;
  cleanBrowserTrace: (browser: string, traceType: string) => Promise<void>;
  clearRecentFiles: () => Promise<void>;
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  scanResult: null,
  scanning: false,
  cleaning: false,
  lastScan: 0,

  runScan: async () => {
    set({ scanning: true });
    try {
      const result: PrivacyScanResult = await window.pchelper.scanPrivacy();
      set({ scanResult: result, scanning: false, lastScan: Date.now() });
    } catch {
      set({ scanning: false });
    }
  },

  cleanAll: async () => {
    set({ cleaning: true });
    try {
      await window.pchelper.cleanAllPrivacy();
      const scanResult: PrivacyScanResult = await window.pchelper.scanPrivacy();
      set({ scanResult, cleaning: false, lastScan: Date.now() });
    } catch {
      set({ cleaning: false });
    }
  },

  cleanBrowserTrace: async (browser, traceType) => {
    await window.pchelper.cleanBrowserTrace(browser, traceType);
    const result: PrivacyScanResult = await window.pchelper.scanPrivacy();
    set({ scanResult: result, lastScan: Date.now() });
  },

  clearRecentFiles: async () => {
    await window.pchelper.clearRecentFiles();
    const result: PrivacyScanResult = await window.pchelper.scanPrivacy();
    set({ scanResult: result, lastScan: Date.now() });
  },
}));
