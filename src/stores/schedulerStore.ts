import { create } from 'zustand';
import type { ScheduledTask } from '../../electron/scheduler/reader';

interface SchedulerState {
  tasks: ScheduledTask[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortAsc: boolean;
  expandedTask: (ScheduledTask & { conditions: string[]; settings: string[] }) | null;
  detailLoading: boolean;

  fetchTasks: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: string) => void;
  setSortField: (f: string) => void;
  toggleSortDirection: () => void;
  expandTask: (name: string) => Promise<void>;
  collapseTask: () => void;
  getFilteredTasks: () => ScheduledTask[];
  getStats: () => { total: number; disabled: number; dueToday: number; failed: number };
}

export const useSchedulerStore = create<SchedulerState>((set, get) => ({
  tasks: [],
  loading: true,
  searchQuery: '',
  statusFilter: 'all',
  sortField: 'name',
  sortAsc: true,
  expandedTask: null,
  detailLoading: false,

  fetchTasks: async () => {
    try {
      const tasks = await window.pchelper.getScheduledTasks();
      set({ tasks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  setSortField: (f) => {
    const { sortField, toggleSortDirection } = get();
    if (f === sortField) {
      toggleSortDirection();
    } else {
      set({ sortField: f, sortAsc: true });
    }
  },
  toggleSortDirection: () => set((s) => ({ sortAsc: !s.sortAsc })),

  expandTask: async (name: string) => {
    set({ detailLoading: true });
    try {
      const detail = await window.pchelper.getTaskDetail(name);
      set({ expandedTask: detail ?? null, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },
  collapseTask: () => set({ expandedTask: null }),

  getFilteredTasks: () => {
    const { tasks, searchQuery, statusFilter, sortField, sortAsc } = get();
    let filtered = tasks;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(q) || t.path.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sortField] ?? '');
      const bVal = String((b as unknown as Record<string, unknown>)[sortField] ?? '');
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  },

  getStats: () => {
    const { tasks } = get();
    const total = tasks.length;
    const disabled = tasks.filter((t) => t.status === 'disabled').length;
    const dueToday = tasks.filter((t) => {
      if (!t.nextRun) return false;
      const today = new Date().toISOString().split('T')[0];
      return t.nextRun.startsWith(today);
    }).length;
    const failed = tasks.filter((t) => t.lastResult === 'failure').length;
    return { total, disabled, dueToday, failed };
  },
}));
