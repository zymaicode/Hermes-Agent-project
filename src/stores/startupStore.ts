import { create } from 'zustand';
import type { StartupEntry, StartupImpact } from '../utils/types';

interface StartupState {
  startupApps: StartupEntry[];
  loading: boolean;
  impact: { bootTime: number; impactSources: { name: string; seconds: number }[] } | null;

  fetchStartupApps: () => Promise<void>;
  toggleApp: (name: string, enabled: boolean) => Promise<void>;
  disableSelected: (names: string[]) => Promise<{ success: number; failed: number }>;
  fetchImpact: () => Promise<void>;
}

export const useStartupStore = create<StartupState>((set) => ({
  startupApps: [],
  loading: false,
  impact: null,

  fetchStartupApps: async () => {
    set({ loading: true });
    const apps = await window.pchelper.getStartupApps();
    set({ startupApps: apps, loading: false });
  },

  toggleApp: async (name, enabled) => {
    await window.pchelper.toggleStartupApp(name, enabled);
    const apps = await window.pchelper.getStartupApps();
    set({ startupApps: apps });
  },

  disableSelected: async (names) => {
    const result = await window.pchelper.disableSelectedStartup(names);
    const apps = await window.pchelper.getStartupApps();
    set({ startupApps: apps });
    return { success: result.success, failed: result.failed };
  },

  fetchImpact: async () => {
    const impact = await window.pchelper.getStartupImpact();
    set({ impact });
  },
}));
