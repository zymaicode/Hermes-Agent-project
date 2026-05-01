import { create } from 'zustand';
import type { NetworkInterface, NetworkTraffic, SpeedTestResult } from '../utils/types';

interface NetworkState {
  interfaces: NetworkInterface[];
  traffic: NetworkTraffic | null;
  speedTest: SpeedTestResult | null;
  speedTestRunning: boolean;
  loading: boolean;

  fetchInterfaces: () => Promise<void>;
  fetchTraffic: () => Promise<void>;
  runSpeedTest: () => Promise<void>;
  startTrafficPolling: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  interfaces: [],
  traffic: null,
  speedTest: null,
  speedTestRunning: false,
  loading: false,

  fetchInterfaces: async () => {
    const interfaces = await window.pchelper.getNetworkInterfaces();
    set({ interfaces });
  },

  fetchTraffic: async () => {
    const traffic = await window.pchelper.getNetworkTraffic();
    set({ traffic });
  },

  runSpeedTest: async () => {
    set({ speedTestRunning: true });
    const speedTest = await window.pchelper.runSpeedTest();
    set({ speedTest, speedTestRunning: false });
  },

  startTrafficPolling: () => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      try {
        const traffic = await window.pchelper.getNetworkTraffic();
        if (active) set({ traffic });
      } catch { /* ignore */ }
      if (active) setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
  },
}));
