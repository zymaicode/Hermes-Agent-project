import { create } from 'zustand';
import type { NavPage } from '../utils/types';

interface AppState {
  currentPage: NavPage;
  chatPanelOpen: boolean;

  setPage: (page: NavPage) => void;
  toggleChatPanel: () => void;
  setChatPanelOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  chatPanelOpen: false,

  setPage: (page) => set({ currentPage: page }),
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
}));
