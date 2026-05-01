import { create } from 'zustand';
import type { FirewallRule } from '../../electron/firewall/reader';

interface FirewallState {
  rules: FirewallRule[];
  loading: boolean;
  searchQuery: string;
  directionFilter: string;
  actionFilter: string;
  protocolFilter: string;
  sortField: string;
  sortAsc: boolean;
  expandedRule: FirewallRule | null;
  toggleResult: { success: boolean; message: string } | null;

  fetchRules: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setDirectionFilter: (f: string) => void;
  setActionFilter: (f: string) => void;
  setProtocolFilter: (f: string) => void;
  setSortField: (f: string) => void;
  toggleSortDirection: () => void;
  expandRule: (rule: FirewallRule) => void;
  collapseRule: () => void;
  toggleRule: (name: string, enabled: boolean) => Promise<void>;
  clearToggleResult: () => void;
  getFilteredRules: () => FirewallRule[];
  getStats: () => { total: number; enabled: number; inbound: number; outbound: number };
}

export const useFirewallStore = create<FirewallState>((set, get) => ({
  rules: [],
  loading: true,
  searchQuery: '',
  directionFilter: 'all',
  actionFilter: 'all',
  protocolFilter: 'all',
  sortField: 'name',
  sortAsc: true,
  expandedRule: null,
  toggleResult: null,

  fetchRules: async () => {
    try {
      const rules = await window.pchelper.getFirewallRules();
      set({ rules, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setDirectionFilter: (f) => set({ directionFilter: f }),
  setActionFilter: (f) => set({ actionFilter: f }),
  setProtocolFilter: (f) => set({ protocolFilter: f }),

  setSortField: (f) => {
    const { sortField, toggleSortDirection } = get();
    if (f === sortField) {
      toggleSortDirection();
    } else {
      set({ sortField: f, sortAsc: true });
    }
  },

  toggleSortDirection: () => set((s) => ({ sortAsc: !s.sortAsc })),

  expandRule: (rule) => set({ expandedRule: rule }),
  collapseRule: () => set({ expandedRule: null }),

  toggleRule: async (name, enabled) => {
    try {
      const result = await window.pchelper.toggleFirewallRule(name, enabled);
      set((s) => ({
        toggleResult: result,
        rules: s.rules.map((r) => (r.name === name ? { ...r, enabled } : r)),
      }));
      setTimeout(() => set({ toggleResult: null }), 3000);
    } catch {
      set({ toggleResult: { success: false, message: 'Failed to toggle rule' } });
      setTimeout(() => set({ toggleResult: null }), 3000);
    }
  },

  clearToggleResult: () => set({ toggleResult: null }),

  getFilteredRules: () => {
    const { rules, searchQuery, directionFilter, actionFilter, protocolFilter, sortField, sortAsc } = get();
    let filtered = rules;
    if (directionFilter !== 'all') {
      filtered = filtered.filter((r) => r.direction === directionFilter);
    }
    if (actionFilter !== 'all') {
      filtered = filtered.filter((r) => r.action === actionFilter);
    }
    if (protocolFilter !== 'all') {
      filtered = filtered.filter((r) => r.protocol === protocolFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) => r.name.toLowerCase().includes(q) || r.program.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
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
    const { rules } = get();
    return {
      total: rules.length,
      enabled: rules.filter((r) => r.enabled).length,
      inbound: rules.filter((r) => r.direction === 'inbound').length,
      outbound: rules.filter((r) => r.direction === 'outbound').length,
    };
  },
}));
