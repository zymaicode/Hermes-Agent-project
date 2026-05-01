import { create } from 'zustand';
import type { ConflictReport, ConflictItem, ConflictType } from '../utils/types';

interface ConflictState {
  report: ConflictReport | null;
  loading: boolean;
  scanning: boolean;

  scanConflicts: () => Promise<void>;
  dismissConflict: (id: string) => void;
  getConflictsByType: (type: ConflictType) => ConflictItem[];
}

export const useConflictStore = create<ConflictState>((set, get) => ({
  report: null,
  loading: true,
  scanning: false,

  scanConflicts: async () => {
    set({ scanning: true });
    try {
      const report = await window.pchelper.scanConflicts();
      set({ report, loading: false, scanning: false });
    } catch {
      set({ loading: false, scanning: false });
    }
  },

  dismissConflict: (id: string) => {
    const { report } = get();
    if (!report) return;
    set({
      report: {
        ...report,
        conflicts: report.conflicts.filter((c) => c.id !== id),
        summary: {
          ...report.summary,
          total: report.summary.total - 1,
        },
      },
    });
  },

  getConflictsByType: (type: ConflictType) => {
    const { report } = get();
    if (!report) return [];
    return report.conflicts.filter((c) => c.type === type);
  },
}));
