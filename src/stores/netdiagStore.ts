import { create } from 'zustand';
import type { PingResult } from '../../electron/netdiag/ping';
import type { TraceRouteResult } from '../../electron/netdiag/traceroute';
import type { PortScanResult } from '../../electron/netdiag/portscanner';
import type { DnsLookupResult } from '../../electron/netdiag/dns';
import type { BandwidthResult } from '../../electron/netdiag/bandwidth';

interface NetDiagState {
  pingResult: PingResult | null;
  pingRunning: boolean;
  traceResult: TraceRouteResult | null;
  traceRunning: boolean;
  portScanResult: PortScanResult | null;
  portScanRunning: boolean;
  dnsResult: DnsLookupResult | null;
  dnsRunning: boolean;
  bandwidthResult: BandwidthResult | null;
  bandwidthRunning: boolean;

  runPing: (target: string, count?: number, timeout?: number) => Promise<void>;
  runTraceRoute: (target: string) => Promise<void>;
  runPortScan: (target: string, ports?: number[]) => Promise<void>;
  runDnsLookup: (domain: string, types?: string[]) => Promise<void>;
  runBandwidthTest: () => Promise<void>;
  resetAll: () => void;
}

export const useNetDiagStore = create<NetDiagState>((set) => ({
  pingResult: null,
  pingRunning: false,
  traceResult: null,
  traceRunning: false,
  portScanResult: null,
  portScanRunning: false,
  dnsResult: null,
  dnsRunning: false,
  bandwidthResult: null,
  bandwidthRunning: false,

  runPing: async (target, count, timeout) => {
    set({ pingRunning: true, pingResult: null });
    try {
      const result = await window.pchelper.ping(target, count, timeout);
      set({ pingResult: result });
    } finally {
      set({ pingRunning: false });
    }
  },

  runTraceRoute: async (target) => {
    set({ traceRunning: true, traceResult: null });
    try {
      const result = await window.pchelper.traceRoute(target);
      set({ traceResult: result });
    } finally {
      set({ traceRunning: false });
    }
  },

  runPortScan: async (target, ports) => {
    set({ portScanRunning: true, portScanResult: null });
    try {
      const result = await window.pchelper.scanPorts(target, ports);
      set({ portScanResult: result });
    } finally {
      set({ portScanRunning: false });
    }
  },

  runDnsLookup: async (domain, types) => {
    set({ dnsRunning: true, dnsResult: null });
    try {
      const result = await window.pchelper.dnsLookup(domain, types);
      set({ dnsResult: result });
    } finally {
      set({ dnsRunning: false });
    }
  },

  runBandwidthTest: async () => {
    set({ bandwidthRunning: true, bandwidthResult: null });
    try {
      const result = await window.pchelper.testBandwidth();
      set({ bandwidthResult: result });
    } finally {
      set({ bandwidthRunning: false });
    }
  },

  resetAll: () => set({
    pingResult: null,
    traceResult: null,
    portScanResult: null,
    dnsResult: null,
    bandwidthResult: null,
  }),
}));
