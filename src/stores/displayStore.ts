import { create } from 'zustand';
import type { DisplayMonitor, AdapterInfo, ColorProfile } from '../../electron/display/monitor';

interface DisplayState {
  displays: DisplayMonitor[];
  adapter: AdapterInfo | null;
  colorProfiles: ColorProfile[];
  loading: boolean;

  fetchDisplays: () => Promise<void>;
  fetchAdapter: () => Promise<void>;
  fetchColorProfiles: () => Promise<void>;
}

export const useDisplayStore = create<DisplayState>((set) => ({
  displays: [],
  adapter: null,
  colorProfiles: [],
  loading: false,

  fetchDisplays: async () => {
    set({ loading: true });
    try {
      const displays = await window.pchelper.getDisplays();
      set({ displays, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchAdapter: async () => {
    try {
      const adapter = await window.pchelper.getAdapterInfo();
      set({ adapter });
    } catch {}
  },

  fetchColorProfiles: async () => {
    try {
      const colorProfiles = await window.pchelper.getColorProfiles();
      set({ colorProfiles });
    } catch {}
  },
}));
