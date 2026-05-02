import { create } from 'zustand';
import type { ThemeConfig } from '../../electron/theme/types';

interface ThemeState {
  config: ThemeConfig | null;
  cssVars: Record<string, string>;
  loading: boolean;

  loadTheme: () => Promise<void>;
  updateTheme: (partial: Partial<ThemeConfig>) => Promise<void>;
  resetTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  config: null,
  cssVars: {},
  loading: true,

  loadTheme: async () => {
    try {
      const config: ThemeConfig = await window.pchelper.getTheme();
      const cssVars: Record<string, string> = await window.pchelper.getThemeCSSVars(config.colorTheme);
      set({ config, cssVars, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateTheme: async (partial) => {
    const current = get().config;
    if (!current) return;
    const next = { ...current, ...partial };
    await window.pchelper.saveTheme(next);
    const cssVars = await window.pchelper.getThemeCSSVars(next.colorTheme);
    set({ config: next, cssVars });
  },

  resetTheme: async () => {
    const defaults: ThemeConfig = await window.pchelper.getThemeDefaults();
    const cssVars = await window.pchelper.getThemeCSSVars(defaults.colorTheme);
    set({ config: defaults, cssVars });
  },
}));
