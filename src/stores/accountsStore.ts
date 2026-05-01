import { create } from 'zustand';
import type { LocalUser, LocalGroup, UacSettings, CredentialEntry } from '../utils/types';

interface AccountsState {
  users: LocalUser[];
  groups: LocalGroup[];
  uacSettings: UacSettings | null;
  credentials: CredentialEntry[];
  selectedUser: LocalUser | null;
  selectedGroup: LocalGroup | null;
  loading: boolean;

  fetchUsers: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchUacSettings: () => Promise<void>;
  fetchCredentials: () => Promise<void>;
  fetchUserDetail: (name: string) => Promise<void>;
  fetchGroupDetail: (name: string) => Promise<void>;
  selectUser: (user: LocalUser | null) => void;
  selectGroup: (group: LocalGroup | null) => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  users: [],
  groups: [],
  uacSettings: null,
  credentials: [],
  selectedUser: null,
  selectedGroup: null,
  loading: true,

  fetchUsers: async () => {
    try {
      const users = await window.pchelper.listLocalUsers();
      set({ users });
    } catch {
      // silently fail
    }
  },

  fetchGroups: async () => {
    try {
      const groups = await window.pchelper.listLocalGroups();
      set({ groups });
    } catch {
      // silently fail
    }
  },

  fetchUacSettings: async () => {
    try {
      const uacSettings = await window.pchelper.getUacSettings();
      set({ uacSettings });
    } catch {
      // silently fail
    }
  },

  fetchCredentials: async () => {
    try {
      const credentials = await window.pchelper.listCredentials();
      set({ credentials });
    } catch {
      // silently fail
    }
  },

  fetchUserDetail: async (name: string) => {
    try {
      const user = await window.pchelper.getUserDetail(name);
      set({ selectedUser: user });
    } catch {
      // silently fail
    }
  },

  fetchGroupDetail: async (name: string) => {
    try {
      const group = await window.pchelper.getGroupDetail(name);
      set({ selectedGroup: group });
    } catch {
      // silently fail
    }
  },

  selectUser: (user) => set({ selectedUser: user }),
  selectGroup: (group) => set({ selectedGroup: group }),
}));
