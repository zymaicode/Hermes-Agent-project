import { create } from 'zustand';
import type { ClipboardEntry } from '../../electron/clipboard/history';

interface ClipboardState {
  entries: ClipboardEntry[];
  loading: boolean;
  searchQuery: string;
  typeFilter: string;
  expandedId: string | null;

  fetchHistory: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (f: string) => void;
  expandEntry: (id: string) => void;
  collapseEntry: () => void;
  removeEntry: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getFilteredEntries: () => ClipboardEntry[];
  getStats: () => { total: number; text: number; link: number; file: number; oldestMinutes: number };
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  entries: [],
  loading: true,
  searchQuery: '',
  typeFilter: 'all',
  expandedId: null,

  fetchHistory: async () => {
    try {
      const entries = await window.pchelper.getClipboardHistory();
      set({ entries, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setTypeFilter: (f) => set({ typeFilter: f }),

  expandEntry: (id) => set((s) => ({ expandedId: s.expandedId === id ? null : id })),
  collapseEntry: () => set({ expandedId: null }),

  removeEntry: async (id) => {
    try {
      await window.pchelper.removeClipboardEntry(id);
      set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    } catch {
      // silent
    }
  },

  togglePin: async (id) => {
    try {
      await window.pchelper.toggleClipboardPin(id);
      set((s) => ({
        entries: s.entries.map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e)),
      }));
    } catch {
      // silent
    }
  },

  clearAll: async () => {
    try {
      await window.pchelper.clearClipboardHistory();
      set({ entries: [] });
    } catch {
      // silent
    }
  },

  getFilteredEntries: () => {
    const { entries, searchQuery, typeFilter } = get();
    let filtered = entries;
    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.content.toLowerCase().includes(q));
    }
    return filtered;
  },

  getStats: () => {
    const { entries } = get();
    const now = Date.now();
    const oldest = entries.length > 0
      ? Math.floor((now - Math.min(...entries.map((e) => e.timestamp))) / 60000)
      : 0;
    return {
      total: entries.length,
      text: entries.filter((e) => e.type === 'text').length,
      link: entries.filter((e) => e.type === 'link').length,
      file: entries.filter((e) => e.type === 'file').length,
      oldestMinutes: oldest,
    };
  },
}));
