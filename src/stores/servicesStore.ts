import { create } from 'zustand';
import type { ServiceEntry, ServiceDetail } from '../../electron/services/manager';

interface ServicesState {
  services: ServiceEntry[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  startupFilter: string;
  criticalOnly: boolean;
  thirdPartyOnly: boolean;
  expandedService: ServiceDetail | null;
  selectedService: ServiceEntry | null;
  sortField: string;
  sortAsc: boolean;
  actionResult: { success: boolean; message: string } | null;

  fetchServices: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: string) => void;
  setStartupFilter: (f: string) => void;
  setCriticalOnly: (v: boolean) => void;
  setThirdPartyOnly: (v: boolean) => void;
  setSortField: (f: string) => void;
  expandService: (name: string) => Promise<void>;
  collapseService: () => void;
  selectService: (s: ServiceEntry | null) => void;
  startService: (name: string) => Promise<void>;
  stopService: (name: string) => Promise<void>;
  restartService: (name: string) => Promise<void>;
  setStartupType: (name: string, type: ServiceEntry['startupType']) => Promise<void>;
  clearActionResult: () => void;
  getFilteredServices: () => ServiceEntry[];
  getStats: () => { total: number; running: number; stopped: number; paused: number; critical: number };
}

const thirdPartyPrefixes = ['NVIDIA', 'Realtek', 'Intel(R)', 'Docker', 'Steam', 'OpenSSH', 'Elgato'];
const isThirdParty = (s: ServiceEntry) =>
  thirdPartyPrefixes.some((p) => s.displayName.startsWith(p) || s.name.startsWith(p.split('(')[0].toLowerCase()));

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  loading: true,
  searchQuery: '',
  statusFilter: 'all',
  startupFilter: 'all',
  criticalOnly: false,
  thirdPartyOnly: false,
  expandedService: null,
  selectedService: null,
  sortField: 'displayName',
  sortAsc: true,
  actionResult: null,

  fetchServices: async () => {
    try {
      const services = await window.pchelper.getServices();
      set({ services, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  setStartupFilter: (f) => set({ startupFilter: f }),
  setCriticalOnly: (v) => set({ criticalOnly: v }),
  setThirdPartyOnly: (v) => set({ thirdPartyOnly: v }),
  setSortField: (f) => set((s) => ({ sortField: f, sortAsc: s.sortField === f ? !s.sortAsc : true })),

  expandService: async (name) => {
    try {
      const detail = await window.pchelper.getServiceDetails(name);
      set({ expandedService: detail });
    } catch {
      // silent
    }
  },

  collapseService: () => set({ expandedService: null }),
  selectService: (s) => set({ selectedService: s }),

  startService: async (name) => {
    const result = await window.pchelper.startService(name);
    set({ actionResult: result });
    if (result.success) {
      set((s) => ({
        services: s.services.map((svc) =>
          svc.name === name ? { ...svc, status: 'running' as const, pid: svc.pid || 1000 } : svc
        ),
      }));
    }
  },

  stopService: async (name) => {
    const result = await window.pchelper.stopService(name);
    set({ actionResult: result });
    if (result.success) {
      set((s) => ({
        services: s.services.map((svc) =>
          svc.name === name ? { ...svc, status: 'stopped' as const, pid: 0 } : svc
        ),
      }));
    }
  },

  restartService: async (name) => {
    const result = await window.pchelper.restartService(name);
    set({ actionResult: result });
  },

  setStartupType: async (name, type) => {
    const result = await window.pchelper.setServiceStartup(name, type);
    set({ actionResult: result });
    if (result.success) {
      set((s) => ({
        services: s.services.map((svc) =>
          svc.name === name ? { ...svc, startupType: type } : svc
        ),
      }));
    }
  },

  clearActionResult: () => set({ actionResult: null }),

  getFilteredServices: () => {
    const { services, searchQuery, statusFilter, startupFilter, criticalOnly, thirdPartyOnly, sortField, sortAsc } = get();
    let filtered = services;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.displayName.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }
    if (startupFilter !== 'all') {
      filtered = filtered.filter((s) => s.startupType === startupFilter);
    }
    if (criticalOnly) {
      filtered = filtered.filter((s) => s.isCritical);
    }
    if (thirdPartyOnly) {
      filtered = filtered.filter((s) => isThirdParty(s));
    }

    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField as keyof ServiceEntry] ?? '');
      const bVal = String(b[sortField as keyof ServiceEntry] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortAsc ? cmp : -cmp;
    });
  },

  getStats: () => {
    const { services } = get();
    return {
      total: services.length,
      running: services.filter((s) => s.status === 'running').length,
      stopped: services.filter((s) => s.status === 'stopped').length,
      paused: services.filter((s) => s.status === 'paused').length,
      critical: services.filter((s) => s.isCritical).length,
    };
  },
}));
