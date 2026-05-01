import { create } from 'zustand';
import type { DiskCategory, LargeFile, TempFileCategory } from '../../electron/disk/analyzer';

interface DiskCleanupState {
  categories: DiskCategory[];
  largeFiles: LargeFile[];
  tempFiles: TempFileCategory[];
  selectedDrive: string;
  selectedCategory: DiskCategory | null;
  selectedTempCategories: string[];
  loading: boolean;
  cleaning: boolean;
  cleanResult: { freedMB: number; errors: string[] } | null;
  largeFileSort: 'sizeMB' | 'name' | 'lastModified';
  largeFileSortAsc: boolean;

  fetchAll: () => Promise<void>;
  setSelectedDrive: (d: string) => void;
  selectCategory: (c: DiskCategory | null) => void;
  toggleTempCategory: (name: string) => void;
  selectAllSafeTemp: () => void;
  cleanSelected: () => Promise<void>;
  setLargeFileSort: (f: 'sizeMB' | 'name' | 'lastModified') => void;
  clearCleanResult: () => void;
  getSortedLargeFiles: () => LargeFile[];
  getSelectedTempSize: () => number;
}

export const useDiskCleanupStore = create<DiskCleanupState>((set, get) => ({
  categories: [],
  largeFiles: [],
  tempFiles: [],
  selectedDrive: 'C:',
  selectedCategory: null,
  selectedTempCategories: [],
  loading: true,
  cleaning: false,
  cleanResult: null,
  largeFileSort: 'sizeMB',
  largeFileSortAsc: false,

  fetchAll: async () => {
    const drive = get().selectedDrive;
    try {
      const [categories, largeFiles, tempFiles] = await Promise.all([
        window.pchelper.getDiskSpace(drive),
        window.pchelper.getLargeFiles(drive),
        window.pchelper.getTempFiles(),
      ]);
      set({ categories, largeFiles, tempFiles, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSelectedDrive: (d) => set({ selectedDrive: d }),

  selectCategory: (c) => set({ selectedCategory: c }),

  toggleTempCategory: (name) =>
    set((s) => ({
      selectedTempCategories: s.selectedTempCategories.includes(name)
        ? s.selectedTempCategories.filter((n) => n !== name)
        : [...s.selectedTempCategories, name],
    })),

  selectAllSafeTemp: () => {
    const safe = get().tempFiles.filter((t) => t.safeToDelete).map((t) => t.name);
    set({ selectedTempCategories: safe });
  },

  cleanSelected: async () => {
    set({ cleaning: true });
    try {
      const result = await window.pchelper.cleanTempFiles(get().selectedTempCategories);
      set({ cleanResult: result, cleaning: false, selectedTempCategories: [] });
      get().fetchAll();
    } catch {
      set({ cleaning: false });
    }
  },

  setLargeFileSort: (f) => {
    const { largeFileSort, largeFileSortAsc } = get();
    if (f === largeFileSort) {
      set({ largeFileSortAsc: !largeFileSortAsc });
    } else {
      set({ largeFileSort: f, largeFileSortAsc: f === 'sizeMB' ? false : true });
    }
  },

  clearCleanResult: () => set({ cleanResult: null }),

  getSortedLargeFiles: () => {
    const { largeFiles, largeFileSort, largeFileSortAsc } = get();
    return [...largeFiles].sort((a, b) => {
      let cmp: number;
      if (largeFileSort === 'sizeMB') {
        cmp = a.sizeMB - b.sizeMB;
      } else if (largeFileSort === 'lastModified') {
        cmp = a.lastModified.localeCompare(b.lastModified);
      } else {
        cmp = a.name.localeCompare(b.name);
      }
      return largeFileSortAsc ? cmp : -cmp;
    });
  },

  getSelectedTempSize: () => {
    const { tempFiles, selectedTempCategories } = get();
    return tempFiles
      .filter((t) => selectedTempCategories.includes(t.name))
      .reduce((sum, t) => sum + t.sizeMB, 0);
  },
}));
