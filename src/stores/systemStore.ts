import { create } from 'zustand';
import type { SystemInfo } from '../../electron/system/info';

interface SystemState {
  info: SystemInfo | null;
  loading: boolean;
  envSearch: string;

  fetchInfo: () => Promise<void>;
  setEnvSearch: (q: string) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  info: null,
  loading: true,
  envSearch: '',

  fetchInfo: async () => {
    set({ loading: true });
    try {
      const info = await window.pchelper.getSystemInfo();
      set({ info, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setEnvSearch: (q) => set({ envSearch: q }),
}));
