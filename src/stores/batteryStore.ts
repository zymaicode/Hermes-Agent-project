import { create } from 'zustand';
import type { BatteryStatus, BatteryHistoryPoint } from '../../electron/battery/reporter';

interface BatteryState {
  status: BatteryStatus | null;
  history: BatteryHistoryPoint[];
  loading: boolean;
  noBattery: boolean;

  fetchStatus: () => Promise<void>;
  fetchHistory: (hours?: number) => Promise<void>;
}

export const useBatteryStore = create<BatteryState>((set) => ({
  status: null,
  history: [],
  loading: true,
  noBattery: false,

  fetchStatus: async () => {
    try {
      const status = await window.pchelper.getBatteryStatus();
      set({ status, loading: false, noBattery: false });
    } catch {
      set({ loading: false, noBattery: true });
    }
  },

  fetchHistory: async (hours?: number) => {
    try {
      const history = await window.pchelper.getBatteryHistory(hours);
      set({ history });
    } catch {
      // silent
    }
  },
}));
