import { create } from 'zustand';
import type { LanDevice } from '../../electron/network/lanScanner';
import type { DnsCacheEntry } from '../../electron/network/dnsCache';
import type { BandwidthProcess } from '../../electron/network/bandwidthTop';
import type { SpeedTestResult } from '../utils/types';

interface NetworkToolsState {
  lanDevices: LanDevice[];
  lanScanning: boolean;
  lanLastScan: number;

  dnsCache: DnsCacheEntry[];
  dnsLoading: boolean;

  bwProcesses: BandwidthProcess[];
  bwLoading: boolean;

  speedHistory: SpeedTestResult[];
  speedStats: { avgDownload: number; avgUpload: number; avgPing: number; count: number } | null;
  speedTopResults: { maxDownload: SpeedTestResult | null; maxUpload: SpeedTestResult | null; minPing: SpeedTestResult | null } | null;

  scanLan: () => Promise<void>;
  refreshLan: () => Promise<void>;
  loadDnsCache: () => Promise<void>;
  flushDnsCache: () => Promise<{ success: boolean; cleared: number }>;
  loadBwTop: () => Promise<void>;
  loadSpeedHistory: () => Promise<void>;
  clearSpeedHistory: () => Promise<void>;
}

export const useNetworkToolsStore = create<NetworkToolsState>((set) => ({
  lanDevices: [],
  lanScanning: false,
  lanLastScan: 0,

  dnsCache: [],
  dnsLoading: false,

  bwProcesses: [],
  bwLoading: false,

  speedHistory: [],
  speedStats: null,
  speedTopResults: null,

  scanLan: async () => {
    set({ lanScanning: true });
    const devices: LanDevice[] = await window.pchelper.scanLanDevices();
    set({ lanDevices: devices, lanScanning: false, lanLastScan: Date.now() });
  },

  refreshLan: async () => {
    const devices: LanDevice[] = await window.pchelper.refreshLanDevices();
    set({ lanDevices: devices, lanLastScan: Date.now() });
  },

  loadDnsCache: async () => {
    set({ dnsLoading: true });
    const cache: DnsCacheEntry[] = await window.pchelper.getDnsCache();
    set({ dnsCache: cache, dnsLoading: false });
  },

  flushDnsCache: async () => {
    const result = await window.pchelper.flushDnsCache();
    set({ dnsCache: [] });
    return result;
  },

  loadBwTop: async () => {
    set({ bwLoading: true });
    const processes: BandwidthProcess[] = await window.pchelper.getBandwidthTop();
    set({ bwProcesses: processes, bwLoading: false });
  },

  loadSpeedHistory: async () => {
    const history: SpeedTestResult[] = await window.pchelper.getSpeedTestHistory();
    const stats = await window.pchelper.getSpeedTestStats();
    const topResults = await window.pchelper.getSpeedTestTopResults();
    set({ speedHistory: history, speedStats: stats, speedTopResults: topResults });
  },

  clearSpeedHistory: async () => {
    await window.pchelper.clearSpeedTestHistory();
    set({ speedHistory: [], speedStats: null, speedTopResults: null });
  },
}));
