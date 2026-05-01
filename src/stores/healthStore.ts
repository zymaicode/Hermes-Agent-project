import { create } from 'zustand';
import type { HealthScore } from '../utils/types';

interface HealthHistoryEntry {
  timestamp: number;
  score: number;
  grade: string;
}

interface HealthState {
  score: HealthScore | null;
  history: HealthHistoryEntry[];
  loading: boolean;

  fetchScore: () => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  score: null,
  history: [],
  loading: true,

  fetchScore: async () => {
    set({ loading: true });
    try {
      const score = await window.pchelper.getHealthScore();
      set({ score, loading: false });
      // Append to history for mini chart
      set((state) => ({
        history: [
          ...state.history.slice(-23),
          { timestamp: score.timestamp, score: score.total, grade: score.grade },
        ],
      }));
    } catch {
      set({ loading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const history = await window.pchelper.getHealthHistory(24);
      set({ history: history as HealthHistoryEntry[] });
    } catch {
      // History fetch is non-critical
    }
  },
}));
