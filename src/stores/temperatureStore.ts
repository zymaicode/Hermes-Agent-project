import { create } from 'zustand';
import type { TemperatureReading } from '../utils/types';

interface TemperatureState {
  readings: TemperatureReading[];
  period: '1min' | '6hour';

  addReading: (reading: TemperatureReading) => void;
  setPeriod: (period: '1min' | '6hour') => void;
  getCurrentStats: () => {
    cpu: { current: number; min: number; max: number; avg: number };
    gpu: { current: number; min: number; max: number; avg: number };
    disk: { current: number; min: number; max: number; avg: number };
  } | null;
}

export const useTemperatureStore = create<TemperatureState>((set, get) => ({
  readings: [],
  period: '1min',

  addReading: (reading) => {
    set((state) => ({
      readings: [...state.readings.slice(-3600), reading],
    }));
  },

  setPeriod: (period) => set({ period }),

  getCurrentStats: () => {
    const { readings, period } = get();
    if (readings.length === 0) return null;
    const cutoff = period === '1min' ? 60 : 3600;
    const recent = readings.slice(-cutoff);
    const stats = (key: 'cpuTemp' | 'gpuTemp' | 'diskTemp') => {
      const vals = recent.map((r) => r[key]);
      return {
        current: vals[vals.length - 1],
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      };
    };
    return {
      cpu: stats('cpuTemp'),
      gpu: stats('gpuTemp'),
      disk: stats('diskTemp'),
    };
  },
}));
