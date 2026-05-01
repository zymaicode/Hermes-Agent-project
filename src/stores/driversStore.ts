import { create } from 'zustand';
import type { DriverEntry, DriverDetail } from '../../electron/drivers/manager';

interface DriversState {
  drivers: DriverEntry[];
  loading: boolean;
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
  problemOnly: boolean;
  expandedDriver: DriverDetail | null;
  sortField: string;
  sortAsc: boolean;

  fetchDrivers: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (f: string) => void;
  setStatusFilter: (f: string) => void;
  setProblemOnly: (v: boolean) => void;
  setSortField: (f: string) => void;
  expandDriver: (name: string) => Promise<void>;
  collapseDriver: () => void;
  getFilteredDrivers: () => DriverEntry[];
  getStats: () => { total: number; running: number; stopped: number; problems: number };
}

export const useDriversStore = create<DriversState>((set, get) => ({
  drivers: [],
  loading: true,
  searchQuery: '',
  typeFilter: 'all',
  statusFilter: 'all',
  problemOnly: false,
  expandedDriver: null,
  sortField: 'name',
  sortAsc: true,

  fetchDrivers: async () => {
    try {
      const drivers = await window.pchelper.getDrivers();
      set({ drivers, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setTypeFilter: (f) => set({ typeFilter: f }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  setProblemOnly: (v) => set({ problemOnly: v }),
  setSortField: (f) => set((s) => ({ sortField: f, sortAsc: s.sortField === f ? !s.sortAsc : true })),

  expandDriver: async (name) => {
    try {
      const detail = await window.pchelper.getDriverDetails(name);
      set({ expandedDriver: detail });
    } catch {
      // silent
    }
  },

  collapseDriver: () => set({ expandedDriver: null }),

  getFilteredDrivers: () => {
    const { drivers, searchQuery, typeFilter, statusFilter, problemOnly, sortField, sortAsc } = get();
    let filtered = drivers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.provider.toLowerCase().includes(q) ||
          d.deviceName.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    if (problemOnly) {
      filtered = filtered.filter((d) => d.status === 'error');
    }

    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField as keyof DriverEntry] ?? '');
      const bVal = String(b[sortField as keyof DriverEntry] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortAsc ? cmp : -cmp;
    });
  },

  getStats: () => {
    const { drivers } = get();
    return {
      total: drivers.length,
      running: drivers.filter((d) => d.status === 'running').length,
      stopped: drivers.filter((d) => d.status === 'stopped').length,
      problems: drivers.filter((d) => d.status === 'error').length,
    };
  },
}));
