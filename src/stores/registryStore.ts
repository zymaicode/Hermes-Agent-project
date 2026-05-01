import { create } from 'zustand';
import type { RegistryKey, RegistrySearchResult } from '../../electron/registry/viewer';

interface RegistryState {
  roots: RegistryKey[];
  currentKey: RegistryKey | null;
  subkeys: string[];
  parent: string | null;
  currentPath: string;
  searchQuery: string;
  searchResults: RegistrySearchResult[];
  favorites: string[];
  loading: boolean;

  fetchRoots: () => Promise<void>;
  navigateTo: (path: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  setSearchQuery: (q: string) => void;
}

export const useRegistryStore = create<RegistryState>((set) => ({
  roots: [],
  currentKey: null,
  subkeys: [],
  parent: null,
  currentPath: '',
  searchQuery: '',
  searchResults: [],
  favorites: [],
  loading: false,

  fetchRoots: async () => {
    set({ loading: true });
    try {
      const roots = await window.pchelper.getRegistryRoots();
      set({ roots, loading: false });
    } catch { set({ loading: false }); }
  },

  navigateTo: async (path: string) => {
    set({ loading: true, currentPath: path });
    try {
      const result = await window.pchelper.navigateRegistry(path);
      set({
        currentKey: result.key,
        subkeys: result.subkeys,
        parent: result.parent,
        loading: false,
      });
    } catch { set({ loading: false }); }
  },

  search: async (query: string) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    try {
      const results = await window.pchelper.searchRegistry(query);
      set({ searchResults: results });
    } catch {}
  },

  fetchFavorites: async () => {
    try {
      const favorites = await window.pchelper.getRegistryFavorites();
      set({ favorites });
    } catch {}
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
}));
