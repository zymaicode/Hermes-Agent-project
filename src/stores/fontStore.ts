import { create } from 'zustand';

interface FontState {
  fonts: import('../../electron/fonts/manager').FontEntry[];
  grouped: Record<string, import('../../electron/fonts/manager').FontEntry[]>;
  recentFonts: string[];
  loading: boolean;

  fetchFonts: () => Promise<void>;
  fetchGrouped: () => Promise<void>;
  fetchRecentFonts: () => Promise<void>;
  getFontPreview: (name: string, text: string, size: number) => Promise<string>;
  getFontDetail: (name: string) => Promise<(import('../../electron/fonts/manager').FontEntry & {
    glyphCount: number;
    kerningPairs: number;
    panose: string;
    fsSelection: string;
    unicodeRanges: string[];
    embeddingRights: string;
    subfamily: string;
    fullName: string;
    postScriptName: string;
  }) | null>;
  fetchAll: () => Promise<void>;
}

export const useFontStore = create<FontState>((set) => ({
  fonts: [],
  grouped: {},
  recentFonts: [],
  loading: false,

  fetchFonts: async () => {
    const fonts = await window.pchelper.getFonts();
    set({ fonts });
  },

  fetchGrouped: async () => {
    const grouped = await window.pchelper.getFontsGrouped();
    set({ grouped });
  },

  fetchRecentFonts: async () => {
    const recentFonts = await window.pchelper.getRecentFonts();
    set({ recentFonts });
  },

  getFontPreview: async (name: string, text: string, size: number) => {
    return await window.pchelper.getFontPreview(name, text, size);
  },

  getFontDetail: async (name: string) => {
    return await window.pchelper.getFontDetail(name);
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [fonts, grouped, recentFonts] = await Promise.all([
        window.pchelper.getFonts(),
        window.pchelper.getFontsGrouped(),
        window.pchelper.getRecentFonts(),
      ]);
      set({ fonts, grouped, recentFonts, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
