import { create } from 'zustand';
import type { LockedFile } from '../../electron/filetools/lockManager';
import type { BatchRenameFile, RenameRule, RenamePreview } from '../../electron/filetools/batchRename';

interface FileToolsState {
  // Lock Manager
  lockedFiles: LockedFile[];
  lockLoading: boolean;

  // Batch Rename
  renameFiles: BatchRenameFile[];
  renamePreview: RenamePreview[];
  renameLoading: boolean;

  // Actions
  loadLockedFiles: () => Promise<void>;
  unlockFile: (filePath: string) => Promise<{ success: boolean; message: string }>;
  unlockSelected: (paths: string[]) => Promise<{ unlocked: number; failed: number; errors: string[] }>;
  loadRenameFiles: () => Promise<void>;
  toggleRenameFile: (fullPath: string) => void;
  toggleAllRenameFiles: (selected: boolean) => void;
  previewRename: (rule: RenameRule) => Promise<void>;
  applyRename: (rule: RenameRule) => Promise<{ renamed: number; failed: number; errors: string[] }>;
}

export const useFileToolsStore = create<FileToolsState>((set, get) => ({
  lockedFiles: [],
  lockLoading: false,

  renameFiles: [],
  renamePreview: [],
  renameLoading: false,

  loadLockedFiles: async () => {
    set({ lockLoading: true });
    const files: LockedFile[] = await window.pchelper.getLockedFiles();
    set({ lockedFiles: files, lockLoading: false });
  },

  unlockFile: async (filePath) => {
    const result = await window.pchelper.unlockFile(filePath);
    get().loadLockedFiles();
    return result;
  },

  unlockSelected: async (paths) => {
    const result = await window.pchelper.unlockSelected(paths);
    get().loadLockedFiles();
    return result;
  },

  loadRenameFiles: async () => {
    set({ renameLoading: true });
    const files: BatchRenameFile[] = await window.pchelper.getRenameFiles();
    set({ renameFiles: files, renameLoading: false });
  },

  toggleRenameFile: (fullPath) => {
    set({ renameFiles: get().renameFiles.map(f => f.fullPath === fullPath ? { ...f, selected: !f.selected } : f) });
  },

  toggleAllRenameFiles: (selected) => {
    set({ renameFiles: get().renameFiles.map(f => ({ ...f, selected })) });
  },

  previewRename: async (rule) => {
    const files = get().renameFiles;
    const preview: RenamePreview[] = await window.pchelper.previewRename(files, rule);
    set({ renamePreview: preview });
  },

  applyRename: async (rule) => {
    const files = get().renameFiles;
    const result = await window.pchelper.applyRename(files, rule);
    const updatedFiles: BatchRenameFile[] = await window.pchelper.getRenameFiles();
    set({ renameFiles: updatedFiles, renamePreview: [] });
    return result;
  },
}));
