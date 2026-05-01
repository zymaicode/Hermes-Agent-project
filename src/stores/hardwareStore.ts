import { create } from 'zustand';
import type { HardwareSnapshot } from '../utils/types';

interface HardwareState {
  snapshot: HardwareSnapshot | null;
  history: number[];
  polling: boolean;

  setSnapshot: (snapshot: HardwareSnapshot) => void;
  setHistory: (history: number[]) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useHardwareStore = create<HardwareState>((set, get) => {
  let unsubscribe: (() => void) | null = null;

  return {
    snapshot: null,
    history: [],
    polling: false,

    setSnapshot: (snapshot) => set({ snapshot }),

    setHistory: (history) => set({ history }),

    startPolling: () => {
      if (get().polling) return;
      window.pchelper.startHardwarePolling(1000);

      unsubscribe = window.pchelper.onHardwareUpdate((data: unknown) => {
        const snapshot = data as HardwareSnapshot;
        set((state) => ({
          snapshot,
          history: [...state.history.slice(-59), snapshot.cpu.usage],
        }));
      });

      set({ polling: true });
    },

    stopPolling: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      window.pchelper.stopHardwarePolling();
      set({ polling: false });
    },
  };
});
