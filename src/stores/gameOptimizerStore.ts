import { create } from 'zustand';
import type { OptimizationStatus } from '../../electron/game/types';

interface GameOptimizerState {
  status: OptimizationStatus;
  detectedGames: Array<{ name: string; pid: number }>;
  optimizationSnapshot: any;
  detectGames: () => Promise<void>;
  optimize: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useGameOptimizerStore = create<GameOptimizerState>((set) => ({
  status: 'idle',
  detectedGames: [],
  optimizationSnapshot: null,

  detectGames: async () => {
    try {
      const games = await (window as any).pchelper.detectGames();
      set({ detectedGames: games || [] });
    } catch {
      set({ detectedGames: [] });
    }
  },

  optimize: async () => {
    set({ status: 'optimizing' });
    try {
      const snapshot = await (window as any).pchelper.optimizeForGaming();
      set({ status: 'optimized', optimizationSnapshot: snapshot });
    } catch {
      set({ status: 'idle' });
    }
  },

  restore: async () => {
    set({ status: 'restoring' });
    try {
      await (window as any).pchelper.restoreGaming();
      set({ status: 'idle', optimizationSnapshot: null });
    } catch {
      set({ status: 'idle' });
    }
  },
}));
