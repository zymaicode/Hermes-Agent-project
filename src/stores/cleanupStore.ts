import { create } from 'zustand';
import type { TempFileCategory, CleanupResult } from '../../electron/cleanup/tempCleaner';
import type { BrowserCacheInfo } from '../../electron/cleanup/browserCleaner';
import type { SystemCleanupCategory } from '../../electron/cleanup/systemCleaner';
import type { LargeFileEntry } from '../../electron/cleanup/largeFileScanner';
import type { DuplicateGroup } from '../../electron/cleanup/duplicateFinder';

interface CleanupState {
  tab: 'quick' | 'large' | 'duplicates';

  // Quick Clean
  tempCategories: TempFileCategory[];
  browserCaches: BrowserCacheInfo[];
  systemCategories: SystemCleanupCategory[];
  quickLoading: boolean;
  quickCleaning: boolean;
  selectedTempIds: string[];
  selectedBrowserIds: string[];
  selectedSystemIds: string[];
  quickCleanResults: CleanupResult[] | null;

  // Large Files
  largeFiles: LargeFileEntry[];
  largeFilesLoading: boolean;
  largeFilesProgress: number;
  largeFilesCurrent: string;
  largeFilesMinSizeMB: number;
  largeFilesScanPath: string;
  largeFileSort: keyof LargeFileEntry;
  largeFileSortAsc: boolean;
  largeFileFilter: string;

  // Duplicates
  duplicateGroups: DuplicateGroup[];
  duplicatesLoading: boolean;
  duplicatesProgress: number;
  expandedGroups: string[];

  // Actions
  setTab: (t: 'quick' | 'large' | 'duplicates') => void;

  // Quick Clean actions
  scanAllQuick: () => Promise<void>;
  toggleTempId: (id: string) => void;
  toggleBrowserId: (id: string) => void;
  toggleSystemId: (id: string) => void;
  cleanSelected: () => Promise<void>;
  clearQuickResults: () => void;
  getQuickTotalSelectedSize: () => number;

  // Large Files actions
  scanLargeFiles: () => Promise<void>;
  setLargeFileMinSize: (mb: number) => void;
  setLargeFileScanPath: (p: string) => void;
  setLargeFileSort: (field: keyof LargeFileEntry) => void;
  setLargeFileFilter: (ext: string) => void;
  getFilteredLargeFiles: () => LargeFileEntry[];

  // Duplicates actions
  scanDuplicates: () => Promise<void>;
  toggleExpandGroup: (hash: string) => void;
  getDuplicateTotalWaste: () => number;
}

export const useCleanupStore = create<CleanupState>((set, get) => ({
  tab: 'quick',
  tempCategories: [],
  browserCaches: [],
  systemCategories: [],
  quickLoading: false,
  quickCleaning: false,
  selectedTempIds: [],
  selectedBrowserIds: [],
  selectedSystemIds: [],
  quickCleanResults: null,
  largeFiles: [],
  largeFilesLoading: false,
  largeFilesProgress: 0,
  largeFilesCurrent: '',
  largeFilesMinSizeMB: 100,
  largeFilesScanPath: 'C:',
  largeFileSort: 'size',
  largeFileSortAsc: false,
  largeFileFilter: '',
  duplicateGroups: [],
  duplicatesLoading: false,
  duplicatesProgress: 0,
  expandedGroups: [],

  setTab: (t) => set({ tab: t }),

  scanAllQuick: async () => {
    set({ quickLoading: true });
    try {
      const [tempCategories, browserCaches, systemCategories] = await Promise.all([
        window.pchelper.scanTempFiles(),
        window.pchelper.scanBrowserCaches(),
        window.pchelper.scanSystemCleanup(),
      ]);
      set({
        tempCategories,
        browserCaches,
        systemCategories,
        quickLoading: false,
        selectedTempIds: [],
        selectedBrowserIds: [],
        selectedSystemIds: [],
        quickCleanResults: null,
      });
    } catch {
      set({ quickLoading: false });
    }
  },

  toggleTempId: (id) =>
    set((s) => ({
      selectedTempIds: s.selectedTempIds.includes(id)
        ? s.selectedTempIds.filter((n) => n !== id)
        : [...s.selectedTempIds, id],
    })),

  toggleBrowserId: (id) =>
    set((s) => ({
      selectedBrowserIds: s.selectedBrowserIds.includes(id)
        ? s.selectedBrowserIds.filter((n) => n !== id)
        : [...s.selectedBrowserIds, id],
    })),

  toggleSystemId: (id) =>
    set((s) => ({
      selectedSystemIds: s.selectedSystemIds.includes(id)
        ? s.selectedSystemIds.filter((n) => n !== id)
        : [...s.selectedSystemIds, id],
    })),

  cleanSelected: async () => {
    const { selectedTempIds, selectedBrowserIds, selectedSystemIds } = get();
    set({ quickCleaning: true, quickCleanResults: null });
    try {
      const results: CleanupResult[] = [];
      if (selectedTempIds.length > 0) {
        const r = await window.pchelper.cleanTempFilesAdv(selectedTempIds);
        results.push(...r);
      }
      for (const browser of selectedBrowserIds) {
        const r = await window.pchelper.cleanBrowserCache(browser);
        results.push({ category: browser, filesDeleted: 0, spaceFreed: r.size, errors: [] });
      }
      if (selectedSystemIds.length > 0) {
        const r = await window.pchelper.cleanSystem(selectedSystemIds);
        results.push(...r);
      }
      set({ quickCleaning: false, quickCleanResults: results, selectedTempIds: [], selectedBrowserIds: [], selectedSystemIds: [] });
      get().scanAllQuick();
    } catch {
      set({ quickCleaning: false });
    }
  },

  clearQuickResults: () => set({ quickCleanResults: null }),

  getQuickTotalSelectedSize: () => {
    const { tempCategories, selectedTempIds, browserCaches, selectedBrowserIds, systemCategories, selectedSystemIds } = get();
    let total = 0;
    total += tempCategories.filter((c) => selectedTempIds.includes(c.id)).reduce((s, c) => s + c.size, 0);
    total += browserCaches.filter((b) => selectedBrowserIds.includes(b.browser)).reduce((s, b) => s + b.cacheSize, 0);
    total += systemCategories.filter((c) => selectedSystemIds.includes(c.id)).reduce((s, c) => s + c.size, 0);
    return total;
  },

  scanLargeFiles: async () => {
    const { largeFilesMinSizeMB, largeFilesScanPath } = get();
    set({ largeFilesLoading: true, largeFilesProgress: 0, largeFilesCurrent: '' });

    const unsubscribe = window.pchelper.onLargeFilesProgress((data) => {
      set({ largeFilesProgress: data.pct, largeFilesCurrent: data.current });
    });

    try {
      const files = await window.pchelper.scanLargeFiles(largeFilesMinSizeMB, largeFilesScanPath);
      set({ largeFiles: files, largeFilesLoading: false });
    } catch {
      set({ largeFilesLoading: false });
    } finally {
      unsubscribe();
    }
  },

  setLargeFileMinSize: (mb) => set({ largeFilesMinSizeMB: mb }),
  setLargeFileScanPath: (p) => set({ largeFilesScanPath: p }),

  setLargeFileSort: (field) => {
    const { largeFileSort, largeFileSortAsc } = get();
    if (field === largeFileSort) {
      set({ largeFileSortAsc: !largeFileSortAsc });
    } else {
      set({ largeFileSort: field, largeFileSortAsc: field === 'size' ? false : true });
    }
  },

  setLargeFileFilter: (ext) => set({ largeFileFilter: ext }),

  getFilteredLargeFiles: () => {
    const { largeFiles, largeFileSort, largeFileSortAsc, largeFileFilter } = get();
    let list = largeFileFilter
      ? largeFiles.filter((f) => f.extension.toLowerCase().includes(largeFileFilter.toLowerCase()))
      : [...largeFiles];
    list.sort((a, b) => {
      let cmp: number;
      if (largeFileSort === 'size') {
        cmp = a.size - b.size;
      } else if (largeFileSort === 'modified') {
        cmp = a.modified.localeCompare(b.modified);
      } else if (largeFileSort === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (largeFileSort === 'path') {
        cmp = a.path.localeCompare(b.path);
      } else {
        cmp = a.extension.localeCompare(b.extension);
      }
      return largeFileSortAsc ? cmp : -cmp;
    });
    return list;
  },

  scanDuplicates: async () => {
    set({ duplicatesLoading: true, duplicatesProgress: 0 });

    const unsubscribe = window.pchelper.onDuplicatesProgress((data) => {
      set({ duplicatesProgress: data.pct });
    });

    try {
      const groups = await window.pchelper.scanDuplicates();
      set({ duplicateGroups: groups, duplicatesLoading: false, expandedGroups: [] });
    } catch {
      set({ duplicatesLoading: false });
    } finally {
      unsubscribe();
    }
  },

  toggleExpandGroup: (hash) =>
    set((s) => ({
      expandedGroups: s.expandedGroups.includes(hash)
        ? s.expandedGroups.filter((h) => h !== hash)
        : [...s.expandedGroups, hash],
    })),

  getDuplicateTotalWaste: () => {
    const { duplicateGroups } = get();
    return duplicateGroups.reduce((sum, g) => sum + g.size * (g.count - 1), 0);
  },
}));
