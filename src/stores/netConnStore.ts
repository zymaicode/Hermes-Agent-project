import { create } from 'zustand';
import type { NetworkConnection, ListeningPort, ConnectionStats } from '../../electron/network/connections';

interface NetConnState {
  connections: NetworkConnection[];
  listeningPorts: ListeningPort[];
  stats: ConnectionStats | null;
  tab: 'connections' | 'listening';
  protocolFilter: string;
  stateFilter: string;
  search: string;
  geoCache: Record<string, { country: string; city: string; isp: string }>;
  loading: boolean;

  fetchConnections: (filter?: { state?: string; protocol?: string; pid?: number }) => Promise<void>;
  fetchListeningPorts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setTab: (tab: 'connections' | 'listening') => void;
  setProtocolFilter: (protocol: string) => void;
  setStateFilter: (state: string) => void;
  setSearch: (search: string) => void;
  getGeoInfo: (ip: string) => Promise<{ country: string; city: string; isp: string } | null>;
}

export const useNetConnStore = create<NetConnState>((set, get) => ({
  connections: [],
  listeningPorts: [],
  stats: null,
  tab: 'connections',
  protocolFilter: 'all',
  stateFilter: 'all',
  search: '',
  geoCache: {},
  loading: false,

  fetchConnections: async (filter) => {
    set({ loading: true });
    try {
      const connections = await window.pchelper.getNetworkConnections(filter);
      set({ connections, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchListeningPorts: async () => {
    set({ loading: true });
    try {
      const listeningPorts = await window.pchelper.getListeningPorts();
      set({ listeningPorts, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchStats: async () => {
    try {
      const stats = await window.pchelper.getConnectionStats();
      set({ stats });
    } catch {}
  },

  setTab: (tab) => set({ tab }),

  setProtocolFilter: (protocolFilter) => set({ protocolFilter }),

  setStateFilter: (stateFilter) => set({ stateFilter }),

  setSearch: (search) => set({ search }),

  getGeoInfo: async (ip) => {
    const cached = get().geoCache[ip];
    if (cached) return cached;
    try {
      const info = await window.pchelper.getGeoInfo(ip);
      if (info) {
        set((s) => ({ geoCache: { ...s.geoCache, [ip]: info } }));
      }
      return info;
    } catch { return null; }
  },
}));
