import { create } from 'zustand';
import type { BenchmarkResult } from '../../electron/benchmark/runner';

interface BenchmarkState {
  lastResult: BenchmarkResult | null;
  running: boolean;
  progress: number;
  phase: string;
  history: BenchmarkResult[];

  startBenchmark: () => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useBenchmarkStore = create<BenchmarkState>((set, get) => ({
  lastResult: null,
  running: false,
  progress: 0,
  phase: '',
  history: [],

  startBenchmark: async () => {
    set({ running: true, progress: 0, phase: 'Starting...' });
    try {
      const result = await window.pchelper.runBenchmark((pct: number, phase: string) => {
        set({ progress: pct, phase });
      });
      set((s) => ({
        lastResult: result,
        running: false,
        progress: 100,
        phase: 'Complete',
        history: [result, ...s.history].slice(0, 10),
      }));
    } catch {
      set({ running: false });
    }
  },

  fetchHistory: async () => {
    try {
      const history = await window.pchelper.getBenchmarkHistory();
      set({ history, lastResult: history[0] ?? null });
    } catch {
      // no-op
    }
  },
}));
