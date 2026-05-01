import { create } from 'zustand';
import type { ProcessEntry } from '../../electron/process/monitor';

interface ProcessState {
  processes: ProcessEntry[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortAsc: boolean;
  expandedPid: number | null;
  expandedDetail: (ProcessEntry & { children: number[]; cpuHistory: number[]; memHistory: number[] }) | null;
  detailLoading: boolean;

  fetchProcesses: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: string) => void;
  setSortField: (f: string) => void;
  toggleSortDirection: () => void;
  expandProcess: (pid: number) => Promise<void>;
  collapseProcess: () => void;
  killProcess: (pid: number) => Promise<{ success: boolean; message: string }>;
  getFilteredProcesses: () => ProcessEntry[];
  getStats: () => { total: number; totalMemMB: number; topCpu: string; topMem: string };
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  processes: [],
  loading: true,
  searchQuery: '',
  statusFilter: 'all',
  sortField: 'name',
  sortAsc: true,
  expandedPid: null,
  expandedDetail: null,
  detailLoading: false,

  fetchProcesses: async () => {
    try {
      const processes = await window.pchelper.getProcesses();
      set({ processes, loading: false });
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

  expandProcess: async (pid: number) => {
    set({ expandedPid: pid, detailLoading: true });
    try {
      const detail = await window.pchelper.getProcessDetail(pid);
      set({ expandedDetail: detail ?? null, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },
  collapseProcess: () => set({ expandedPid: null, expandedDetail: null }),

  killProcess: async (pid: number) => {
    const result = await window.pchelper.killProcess(pid);
    if (result.success) {
      await get().fetchProcesses();
      set({ expandedPid: null, expandedDetail: null });
    }
    return result;
  },

  getFilteredProcesses: () => {
    const { processes, searchQuery, statusFilter, sortField, sortAsc } = get();
    let filtered = processes;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.pid).includes(q) ||
          p.user.toLowerCase().includes(q)
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
    const { processes } = get();
    const total = processes.length;
    const totalMemMB = processes.reduce((sum, p) => sum + p.memoryMB, 0);
    const sortedCpu = [...processes].sort((a, b) => b.cpuPercent - a.cpuPercent);
    const sortedMem = [...processes].sort((a, b) => b.memoryMB - a.memoryMB);
    return {
      total,
      totalMemMB,
      topCpu: sortedCpu[0]?.name ?? '-',
      topMem: sortedMem[0]?.name ?? '-',
    };
  },
}));
