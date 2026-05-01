import { create } from 'zustand';
import type { SoftwareEntry } from '../utils/types';

interface SoftwareState {
  apps: SoftwareEntry[];
  searchQuery: string;
  sortField: keyof SoftwareEntry;
  sortDirection: 'asc' | 'desc';

  fetchApps: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortField: (field: keyof SoftwareEntry) => void;
  toggleSortDirection: () => void;
  filteredApps: () => SoftwareEntry[];
}

export const useSoftwareStore = create<SoftwareState>((set, get) => ({
  apps: [],
  searchQuery: '',
  sortField: 'name',
  sortDirection: 'asc',

  fetchApps: async () => {
    const apps = await window.pchelper.getInstalledApps();
    set({ apps: apps as SoftwareEntry[] });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortField: (field) => {
    const { sortField, sortDirection } = get();
    if (sortField === field) {
      set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortDirection: 'asc' });
    }
  },

  toggleSortDirection: () => {
    const { sortDirection } = get();
    set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
  },

  filteredApps: () => {
    const { apps, searchQuery, sortField, sortDirection } = get();
    let filtered = apps;

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filtered = apps.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          a.publisher.toLowerCase().includes(lower)
      );
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc'
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  },
}));
