import { create } from 'zustand';
import type { RemoteConnection } from '../../electron/remote/manager';

interface RemoteState {
  connections: RemoteConnection[];
  groups: string[];
  loading: boolean;
  selectedGroup: string;
  searchQuery: string;

  fetchConnections: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  setSelectedGroup: (group: string) => void;
  setSearchQuery: (query: string) => void;
  connect: (id: string) => Promise<{ success: boolean; message: string; command?: string }>;
  testConnection: (id: string) => Promise<{ success: boolean; latency: number; message: string }>;
  addConnection: (conn: Omit<RemoteConnection, 'id' | 'lastConnected' | 'connectionCount'>) => Promise<RemoteConnection>;
  updateConnection: (id: string, updates: Partial<RemoteConnection>) => Promise<RemoteConnection>;
  deleteConnection: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  exportConnections: () => Promise<string>;
  importConnections: (path: string) => Promise<{ added: number; failed: number }>;
}

export const useRemoteStore = create<RemoteState>((set, get) => ({
  connections: [],
  groups: [],
  loading: false,
  selectedGroup: 'All',
  searchQuery: '',

  fetchConnections: async () => {
    set({ loading: true });
    try {
      const connections = await window.pchelper.getRemoteConnections();
      set({ connections, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchGroups: async () => {
    try {
      const groups = await window.pchelper.getRemoteGroups();
      set({ groups });
    } catch {}
  },

  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  connect: async (id) => {
    const result = await window.pchelper.connectRemote(id);
    return result;
  },

  testConnection: async (id) => {
    const result = await window.pchelper.testRemoteConnection(id);
    return result;
  },

  addConnection: async (conn) => {
    const result = await window.pchelper.addRemoteConnection(conn);
    await get().fetchConnections();
    return result;
  },

  updateConnection: async (id, updates) => {
    const result = await window.pchelper.updateRemoteConnection(id, updates);
    await get().fetchConnections();
    return result;
  },

  deleteConnection: async (id) => {
    await window.pchelper.deleteRemoteConnection(id);
    await get().fetchConnections();
  },

  toggleFavorite: async (id) => {
    await window.pchelper.toggleRemoteFavorite(id);
    await get().fetchConnections();
  },

  exportConnections: async () => {
    const result = await window.pchelper.exportRemoteConnections();
    return result;
  },

  importConnections: async (path) => {
    const result = await window.pchelper.importRemoteConnections(path);
    await get().fetchConnections();
    return result;
  },
}));
