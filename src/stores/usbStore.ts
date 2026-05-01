import { create } from 'zustand';
import type { UsbDevice, UsbHistoryEntry } from '../../electron/usb/manager';

interface UsbState {
  devices: UsbDevice[];
  history: UsbHistoryEntry[];
  loading: boolean;
  historyOpen: boolean;
  ejectResult: { success: boolean; message: string } | null;

  fetchDevices: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleHistory: () => void;
  ejectDevice: (serial: string) => Promise<void>;
  clearEjectResult: () => void;
}

export const useUsbStore = create<UsbState>((set) => ({
  devices: [],
  history: [],
  loading: true,
  historyOpen: false,
  ejectResult: null,

  fetchDevices: async () => {
    try {
      const devices = await window.pchelper.getUsbDevices();
      set({ devices, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const history = await window.pchelper.getUsbHistory();
      set({ history });
    } catch {
      // silent
    }
  },

  toggleHistory: () => set((s) => ({ historyOpen: !s.historyOpen })),

  ejectDevice: async (serial) => {
    try {
      const result = await window.pchelper.ejectUsbDevice(serial);
      set({ ejectResult: result });
      setTimeout(() => set({ ejectResult: null }), 3000);
    } catch {
      set({ ejectResult: { success: false, message: 'Eject failed' } });
      setTimeout(() => set({ ejectResult: null }), 3000);
    }
  },

  clearEjectResult: () => set({ ejectResult: null }),
}));
