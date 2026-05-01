import { create } from 'zustand';
import type { UpdateScanResult } from '../utils/types';

interface UpdateState {
  scanResult: UpdateScanResult | null;
  loading: boolean;
  scanning: boolean;

  scanForUpdates: () => Promise<void>;
  clearResults: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  scanResult: null,
  loading: true,
  scanning: false,

  scanForUpdates: async () => {
    set({ scanning: true });
    try {
      const result = await window.pchelper.scanUpdates();
      set({ scanResult: result, loading: false, scanning: false });
    } catch {
      set({ loading: false, scanning: false });
    }
  },

  clearResults: () => set({ scanResult: null, loading: true }),
}));
