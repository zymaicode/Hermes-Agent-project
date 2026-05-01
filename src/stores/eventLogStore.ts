import { create } from 'zustand';
import type { EventLogEntry } from '../../electron/events/reader';

interface EventLogState {
  events: EventLogEntry[];
  logCounts: Record<string, Record<string, number>>;
  loading: boolean;
  logFilter: string;
  levelFilter: string[];
  searchQuery: string;
  expandedEvent: EventLogEntry | null;
  autoRefresh: boolean;

  fetchEvents: () => Promise<void>;
  fetchCounts: () => Promise<void>;
  setLogFilter: (f: string) => void;
  toggleLevelFilter: (level: string) => void;
  setSearchQuery: (q: string) => void;
  expandEvent: (e: EventLogEntry) => void;
  collapseEvent: () => void;
  setAutoRefresh: (v: boolean) => void;
}

export const useEventLogStore = create<EventLogState>((set, get) => ({
  events: [],
  logCounts: {},
  loading: true,
  logFilter: 'All Logs',
  levelFilter: ['critical', 'error', 'warning', 'information'],
  searchQuery: '',
  expandedEvent: null,
  autoRefresh: false,

  fetchEvents: async () => {
    try {
      const { logFilter, levelFilter, searchQuery } = get();
      const level = levelFilter.length === 4 ? undefined : levelFilter.join(',');
      const events = await window.pchelper.getEvents(
        logFilter === 'All Logs' ? undefined : logFilter,
        level,
        200,
        searchQuery || undefined
      );
      set({ events, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCounts: async () => {
    try {
      const logCounts = await window.pchelper.getEventCounts();
      set({ logCounts });
    } catch {
      // silent
    }
  },

  setLogFilter: (f) => {
    set({ logFilter: f, loading: true });
    get().fetchEvents();
  },

  toggleLevelFilter: (level) => {
    set((s) => {
      const has = s.levelFilter.includes(level);
      const next = has ? s.levelFilter.filter((l) => l !== level) : [...s.levelFilter, level];
      return { levelFilter: next, loading: true };
    });
    get().fetchEvents();
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  expandEvent: (e) => set({ expandedEvent: e }),
  collapseEvent: () => set({ expandedEvent: null }),
  setAutoRefresh: (v) => set({ autoRefresh: v }),
}));
