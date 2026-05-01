import { create } from 'zustand';

interface MemoryState {
  modules: import('../../electron/memory/analyzer').MemoryModule[];
  allocation: import('../../electron/memory/analyzer').MemoryAllocation[];
  timings: import('../../electron/memory/analyzer').MemoryTiming | null;
  health: import('../../electron/memory/analyzer').MemoryHealth | null;
  pageFile: import('../../electron/memory/analyzer').PageFileInfo | null;
  loading: boolean;

  fetchModules: () => Promise<void>;
  fetchAllocation: () => Promise<void>;
  fetchTimings: () => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchPageFile: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  modules: [],
  allocation: [],
  timings: null,
  health: null,
  pageFile: null,
  loading: false,

  fetchModules: async () => {
    const modules = await window.pchelper.getMemoryModules();
    set({ modules });
  },

  fetchAllocation: async () => {
    const allocation = await window.pchelper.getMemoryAllocation();
    set({ allocation });
  },

  fetchTimings: async () => {
    const timings = await window.pchelper.getMemoryTimings();
    set({ timings });
  },

  fetchHealth: async () => {
    const health = await window.pchelper.getMemoryHealth();
    set({ health });
  },

  fetchPageFile: async () => {
    const pageFile = await window.pchelper.getPageFile();
    set({ pageFile });
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [modules, allocation, timings, health, pageFile] = await Promise.all([
        window.pchelper.getMemoryModules(),
        window.pchelper.getMemoryAllocation(),
        window.pchelper.getMemoryTimings(),
        window.pchelper.getMemoryHealth(),
        window.pchelper.getPageFile(),
      ]);
      set({ modules, allocation, timings, health, pageFile, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
