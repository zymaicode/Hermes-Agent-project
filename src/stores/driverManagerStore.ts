import { create } from 'zustand';
import type { DriverEntry, DriverBackup, DriverVersionDiff } from '../../electron/driver/driverManager';

interface DriverManagerState {
  drivers: DriverEntry[];
  backups: DriverBackup[];
  loading: boolean;
  searchQuery: string;
  classFilter: string;
  statusFilter: string;
  thirdPartyOnly: boolean;
  expandedDriver: DriverEntry | null;
  sortField: string;
  sortAsc: boolean;
  selectedDriverIds: string[];
  activeTab: 'list' | 'backup' | 'compare';
  backupLoading: boolean;
  diffResult: DriverVersionDiff[] | null;
  diffLoading: boolean;

  fetchDrivers: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setClassFilter: (f: string) => void;
  setStatusFilter: (f: string) => void;
  setThirdPartyOnly: (v: boolean) => void;
  setSortField: (f: string) => void;
  expandDriver: (hardwareId: string) => void;
  collapseDriver: () => void;
  toggleSelectDriver: (name: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setActiveTab: (tab: 'list' | 'backup' | 'compare') => void;

  fetchBackups: () => Promise<void>;
  createBackup: (name: string, driverIds?: string[]) => Promise<void>;
  restoreBackup: (backupId: string) => Promise<{ success: boolean; message: string; restoredCount: number }>;
  deleteBackup: (backupId: string) => Promise<boolean>;
  getVersionDiff: (backupId: string) => Promise<void>;

  getFilteredDrivers: () => DriverEntry[];
  getStats: () => { total: number; running: number; stopped: number; errors: number; thirdParty: number };
  getClassList: () => string[];
}

export const useDriverManagerStore = create<DriverManagerState>((set, get) => ({
  drivers: [],
  backups: [],
  loading: true,
  searchQuery: '',
  classFilter: 'all',
  statusFilter: 'all',
  thirdPartyOnly: false,
  expandedDriver: null,
  sortField: 'name',
  sortAsc: true,
  selectedDriverIds: [],
  activeTab: 'list',
  backupLoading: false,
  diffResult: null,
  diffLoading: false,

  fetchDrivers: async () => {
    try {
      const drivers = await window.pchelper.listDrivers();
      set({ drivers, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setClassFilter: (f) => set({ classFilter: f }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  setThirdPartyOnly: (v) => set({ thirdPartyOnly: v }),
  setSortField: (f) => set((s) => ({ sortField: f, sortAsc: s.sortField === f ? !s.sortAsc : true })),

  expandDriver: (hardwareId) => {
    const driver = get().drivers.find((d) => d.hardwareId === hardwareId) || null;
    set({ expandedDriver: driver });
  },
  collapseDriver: () => set({ expandedDriver: null }),

  toggleSelectDriver: (name) =>
    set((s) => ({
      selectedDriverIds: s.selectedDriverIds.includes(name)
        ? s.selectedDriverIds.filter((n) => n !== name)
        : [...s.selectedDriverIds, name],
    })),

  selectAll: () => set({ selectedDriverIds: get().getFilteredDrivers().map((d) => d.name) }),
  deselectAll: () => set({ selectedDriverIds: [] }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchBackups: async () => {
    set({ backupLoading: true });
    try {
      const backups = await window.pchelper.listDriverBackups();
      set({ backups, backupLoading: false });
    } catch {
      set({ backupLoading: false });
    }
  },

  createBackup: async (name, driverIds) => {
    try {
      await window.pchelper.createDriverBackup(name, driverIds);
      await get().fetchBackups();
    } catch {
      // silent
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const result = await window.pchelper.restoreDriverBackup(backupId);
      return result;
    } catch {
      return { success: false, message: '还原失败', restoredCount: 0 };
    }
  },

  deleteBackup: async (backupId) => {
    try {
      const result = await window.pchelper.deleteDriverBackup(backupId);
      await get().fetchBackups();
      return result;
    } catch {
      return false;
    }
  },

  getVersionDiff: async (backupId) => {
    set({ diffLoading: true, diffResult: null });
    try {
      const result = await window.pchelper.getDriverVersionDiff(backupId);
      set({ diffResult: result, diffLoading: false });
    } catch {
      set({ diffLoading: false });
    }
  },

  getFilteredDrivers: () => {
    const { drivers, searchQuery, classFilter, statusFilter, thirdPartyOnly, sortField, sortAsc } = get();
    let filtered = drivers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.provider.toLowerCase().includes(q) ||
          d.className.toLowerCase().includes(q) ||
          d.hardwareId.toLowerCase().includes(q)
      );
    }
    if (classFilter !== 'all') {
      filtered = filtered.filter((d) => d.className === classFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    if (thirdPartyOnly) {
      filtered = filtered.filter((d) => d.isThirdParty);
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
      errors: drivers.filter((d) => d.status === 'error').length,
      thirdParty: drivers.filter((d) => d.isThirdParty).length,
    };
  },

  getClassList: () => {
    const classes = new Set(get().drivers.map((d) => d.className));
    return [...classes].sort();
  },
}));
