import { create } from 'zustand';
import type { FileAssociation, ProtocolAssociation } from '../../electron/files/associations';

interface FileTypeState {
  associations: FileAssociation[];
  protocols: ProtocolAssociation[];
  categoryBreakdown: Record<string, number>;
  filter: string;
  categoryFilter: string;
  loading: boolean;

  fetchAssociations: () => Promise<void>;
  fetchProtocols: () => Promise<void>;
  fetchCategoryBreakdown: () => Promise<void>;
  setFilter: (filter: string) => void;
  setCategoryFilter: (cat: string) => void;
  setAssociation: (ext: string, program: string) => Promise<{ success: boolean; message: string }>;
}

export const useFileTypeStore = create<FileTypeState>((set) => ({
  associations: [],
  protocols: [],
  categoryBreakdown: {},
  filter: '',
  categoryFilter: 'all',
  loading: false,

  fetchAssociations: async () => {
    set({ loading: true });
    try {
      const associations = await window.pchelper.getFileAssociations();
      set({ associations, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchProtocols: async () => {
    try {
      const protocols = await window.pchelper.getProtocolAssociations();
      set({ protocols });
    } catch {}
  },

  fetchCategoryBreakdown: async () => {
    try {
      const categoryBreakdown = await window.pchelper.getCategoryBreakdown();
      set({ categoryBreakdown });
    } catch {}
  },

  setFilter: (filter) => set({ filter }),

  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  setAssociation: async (ext, program) => {
    const result = await window.pchelper.setFileAssociation(ext, program);
    return result;
  },
}));
