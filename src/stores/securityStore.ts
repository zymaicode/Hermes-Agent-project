import { create } from 'zustand';
import type { SecurityStatus } from '../../electron/security/center';

interface SecurityState {
  status: SecurityStatus | null;
  loading: boolean;
  scanning: boolean;
  scanResult: { threats: number; scanned: number; duration: string; status: 'clean' | 'threats_found' } | null;

  fetchStatus: () => Promise<void>;
  runQuickScan: () => Promise<void>;
  clearScanResult: () => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  status: null,
  loading: true,
  scanning: false,
  scanResult: null,

  fetchStatus: async () => {
    try {
      const status = await window.pchelper.getSecurityStatus();
      set({ status, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  runQuickScan: async () => {
    set({ scanning: true, scanResult: null });
    try {
      const result = await window.pchelper.runQuickScan();
      set({ scanResult: result, scanning: false });
    } catch {
      set({ scanning: false });
    }
  },

  clearScanResult: () => set({ scanResult: null }),
}));
