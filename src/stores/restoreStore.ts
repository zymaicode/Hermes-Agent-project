import { create } from 'zustand';
import type { RestorePoint, RestoreSettings } from '../../electron/restore/manager';

interface RestoreState {
  points: RestorePoint[];
  settings: RestoreSettings | null;
  loading: boolean;

  fetchPoints: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  createRestorePoint: (description: string) => Promise<{ success: boolean; message: string; point?: RestorePoint }>;
  restoreToPoint: (id: number) => Promise<{ success: boolean; message: string }>;
  deleteRestorePoint: (id: number) => Promise<{ success: boolean; message: string }>;
  toggleProtection: (enabled: boolean) => Promise<{ success: boolean }>;
  setMaxUsage: (percentage: number) => Promise<{ success: boolean }>;
}

export const useRestoreStore = create<RestoreState>((set) => ({
  points: [],
  settings: null,
  loading: false,

  fetchPoints: async () => {
    set({ loading: true });
    try {
      const points = await window.pchelper.getRestorePoints();
      set({ points, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchSettings: async () => {
    try {
      const settings = await window.pchelper.getRestoreSettings();
      set({ settings });
    } catch {}
  },

  createRestorePoint: async (description: string) => {
    const result = await window.pchelper.createRestorePoint(description);
    return result;
  },

  restoreToPoint: async (id: number) => {
    const result = await window.pchelper.restoreToPoint(id);
    return result;
  },

  deleteRestorePoint: async (id: number) => {
    const result = await window.pchelper.deleteRestorePoint(id);
    return result;
  },

  toggleProtection: async (enabled: boolean) => {
    const result = await window.pchelper.toggleRestoreProtection(enabled);
    return result;
  },

  setMaxUsage: async (percentage: number) => {
    const result = await window.pchelper.setRestoreMaxUsage(percentage);
    return result;
  },
}));
