import { create } from 'zustand';
import type { ScannedFile, ScanConfig } from '../../electron/files/scanner';

interface FileScannerState {
  files: ScannedFile[];
  totalSizeMB: number;
  totalFiles: number;
  duplicates: ScannedFile[];
  categories: Record<string, { count: number; totalMB: number }>;
  recentScans: Array<{ timestamp: number; totalFiles: number; totalSizeMB: number; duplicates: number }>;
  scanning: boolean;
  scanProgress: number;
  scanPhase: string;
  scanFound: number;
  activeTab: 'all' | 'large' | 'duplicates' | 'categories';

  setActiveTab: (tab: 'all' | 'large' | 'duplicates' | 'categories') => void;
  startScan: (config: ScanConfig) => Promise<void>;
  cancelScan: () => void;
  fetchRecentScans: () => Promise<void>;
  resetResults: () => void;
}

export const useFileScannerStore = create<FileScannerState>((set, get) => ({
  files: [],
  totalSizeMB: 0,
  totalFiles: 0,
  duplicates: [],
  categories: {},
  recentScans: [],
  scanning: false,
  scanProgress: 0,
  scanPhase: '',
  scanFound: 0,
  activeTab: 'all',

  setActiveTab: (tab) => set({ activeTab: tab }),

  startScan: async (config: ScanConfig) => {
    set({ scanning: true, scanProgress: 0, scanPhase: 'Starting...', scanFound: 0 });
    try {
      const result = await window.pchelper.scanFiles(config, (pct, phase, found) => {
        set({ scanProgress: pct, scanPhase: phase, scanFound: found });
      });
      set({
        files: result.files,
        totalSizeMB: result.totalSizeMB,
        totalFiles: result.totalFiles,
        duplicates: result.duplicates,
        categories: result.categories,
        scanning: false,
        scanProgress: 100,
        scanPhase: 'Complete',
      });
    } catch {
      set({ scanning: false });
    }
  },

  cancelScan: () => {
    window.pchelper.cancelFileScan();
    set({ scanning: false });
  },

  fetchRecentScans: async () => {
    try {
      const recentScans = await window.pchelper.getRecentFileScans();
      set({ recentScans });
    } catch {}
  },

  resetResults: () => {
    set({ files: [], totalSizeMB: 0, totalFiles: 0, duplicates: [], categories: {}, scanProgress: 0, scanPhase: '', scanFound: 0 });
  },
}));
