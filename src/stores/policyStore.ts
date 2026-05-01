import { create } from 'zustand';
import type { PolicyCategory, PolicyEntry } from '../../electron/policy/policyManager';

type StateFilter = 'all' | 'configured' | 'not_configured';

interface PolicyState {
  categories: PolicyCategory[];
  selectedCategoryId: string | null;
  policies: PolicyEntry[];
  selectedPolicyId: string | null;
  searchQuery: string;
  stateFilter: StateFilter;

  loadCategories: () => Promise<void>;
  selectCategory: (categoryId: string) => Promise<void>;
  selectPolicy: (policyId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStateFilter: (filter: StateFilter) => void;
}

export const usePolicyStore = create<PolicyState>((set, get) => ({
  categories: [],
  selectedCategoryId: null,
  policies: [],
  selectedPolicyId: null,
  searchQuery: '',
  stateFilter: 'all',

  loadCategories: async () => {
    const categories = await window.pchelper.getPolicyCategories();
    set({ categories });
  },

  selectCategory: async (categoryId: string) => {
    set({ selectedCategoryId: categoryId, selectedPolicyId: null });
    const policies = await window.pchelper.getPoliciesByCategory(categoryId);
    set({ policies });
  },

  selectPolicy: async (policyId: string) => {
    set({ selectedPolicyId: policyId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setStateFilter: (filter: StateFilter) => {
    set({ stateFilter: filter });
  },
}));

export type { StateFilter };
