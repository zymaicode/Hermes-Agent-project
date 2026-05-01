import { create } from 'zustand';
import type { AppEntry, UninstallResult } from '../utils/types';

interface AppManagerState {
  apps: AppEntry[];
  loading: boolean;
  selectedApps: Set<string>;
  expandedApp: string | null;
  uninstalling: string | null;
  batchUninstalling: boolean;

  fetchApps: () => Promise<void>;
  toggleSelect: (name: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleExpand: (name: string) => void;
  uninstallSingle: (name: string) => Promise<UninstallResult>;
  uninstallSelected: () => Promise<UninstallResult>;
}

export const useAppManagerStore = create<AppManagerState>((set, get) => ({
  apps: [],
  loading: true,
  selectedApps: new Set(),
  expandedApp: null,
  uninstalling: null,
  batchUninstalling: false,

  fetchApps: async () => {
    set({ loading: true });
    try {
      const apps = await window.pchelper.getManagedApps();
      set({ apps, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggleSelect: (name: string) => {
    const { selectedApps } = get();
    const next = new Set(selectedApps);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    set({ selectedApps: next });
  },

  selectAll: () => {
    const { apps } = get();
    set({ selectedApps: new Set(apps.map((a) => a.name)) });
  },

  deselectAll: () => {
    set({ selectedApps: new Set() });
  },

  toggleExpand: (name: string) => {
    const { expandedApp } = get();
    set({ expandedApp: expandedApp === name ? null : name });
  },

  uninstallSingle: async (name: string) => {
    set({ uninstalling: name });
    try {
      const result = await window.pchelper.uninstallApp(name);
      if (result.success) {
        const { apps, selectedApps } = get();
        const nextSelected = new Set(selectedApps);
        nextSelected.delete(name);
        set({
          apps: apps.filter((a) => a.name !== name),
          selectedApps: nextSelected,
          expandedApp: null,
        });
      }
      set({ uninstalling: null });
      return { success: result.success ? 1 : 0, failed: result.success ? 0 : 1, errors: result.success ? [] : [result.message] };
    } catch (err) {
      set({ uninstalling: null });
      return { success: 0, failed: 1, errors: [String(err)] };
    }
  },

  uninstallSelected: async () => {
    const { selectedApps } = get();
    const names = Array.from(selectedApps);
    set({ batchUninstalling: true });
    try {
      const result = await window.pchelper.uninstallSelected(names);
      if (result.success > 0) {
        const failedSet = new Set(result.errors.map((_e, i) => {
          // errors correspond to failed uninstalls in order
          return '';
        }));
        const { apps } = get();
        const remaining = apps.filter((a) => !names.includes(a.name));
        const succeeded = names.filter((n) => !failedSet.has(n));
        set({
          apps: remaining,
          selectedApps: new Set(),
          batchUninstalling: false,
        });
      }
      set({ batchUninstalling: false, selectedApps: new Set() });
      // Refresh the app list to get actual state
      get().fetchApps();
      return result;
    } catch (err) {
      set({ batchUninstalling: false });
      return { success: 0, failed: names.length, errors: [String(err)] };
    }
  },
}));
