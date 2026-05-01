import { create } from 'zustand';

interface FeaturesState {
  features: import('../../electron/features/manager').WindowsFeature[];
  categories: string[];
  installSize: { totalEnabledMB: number; totalAvailableMB: number; totalDisabledMB: number } | null;
  loading: boolean;

  fetchFeatures: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchInstallSize: () => Promise<void>;
  toggleFeature: (name: string, enable: boolean) => Promise<{ success: boolean; message: string; restartRequired: boolean }>;
  getFeatureDetails: (name: string) => Promise<import('../../electron/features/manager').WindowsFeature & {
    registryPath: string;
    imagePath: string;
    installDate: string | null;
    logPath: string;
    statusPaths: string[];
  } | null>;
  fetchAll: () => Promise<void>;
}

export const useFeaturesStore = create<FeaturesState>((set) => ({
  features: [],
  categories: [],
  installSize: null,
  loading: false,

  fetchFeatures: async () => {
    const features = await window.pchelper.getWindowsFeatures();
    set({ features });
  },

  fetchCategories: async () => {
    const categories = await window.pchelper.getFeatureCategories();
    set({ categories });
  },

  fetchInstallSize: async () => {
    const installSize = await window.pchelper.getFeatureInstallSize();
    set({ installSize });
  },

  toggleFeature: async (name: string, enable: boolean) => {
    return await window.pchelper.toggleFeature(name, enable);
  },

  getFeatureDetails: async (name: string) => {
    return await window.pchelper.getFeatureDetails(name);
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [features, categories, installSize] = await Promise.all([
        window.pchelper.getWindowsFeatures(),
        window.pchelper.getFeatureCategories(),
        window.pchelper.getFeatureInstallSize(),
      ]);
      set({ features, categories, installSize, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
