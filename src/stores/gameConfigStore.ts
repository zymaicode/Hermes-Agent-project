import { create } from 'zustand';
import type { GameOverlayConfig } from '../../electron/game/gameConfig';

interface GameConfigState {
  configs: GameOverlayConfig[];
  currentGame: string | null;
  editingConfig: GameOverlayConfig | null;
  loadConfigs: () => Promise<void>;
  loadGameConfig: (gameName: string) => Promise<void>;
  saveConfig: (config: GameOverlayConfig) => Promise<void>;
  deleteConfig: (gameName: string) => Promise<void>;
  setEditingConfig: (config: GameOverlayConfig | null) => void;
}

export const useGameConfigStore = create<GameConfigState>((set) => ({
  configs: [],
  currentGame: null,
  editingConfig: null,

  loadConfigs: async () => {
    const configs = await (window as any).pchelper.getAllGameConfigs();
    set({ configs: configs || [] });
  },

  loadGameConfig: async (gameName: string) => {
    const config = await (window as any).pchelper.getGameConfig(gameName);
    set({ currentGame: gameName, editingConfig: config });
  },

  saveConfig: async (config: GameOverlayConfig) => {
    await (window as any).pchelper.saveGameConfig(config);
    const configs = await (window as any).pchelper.getAllGameConfigs();
    set({ configs: configs || [] });
  },

  deleteConfig: async (gameName: string) => {
    await (window as any).pchelper.deleteGameConfig(gameName);
    const configs = await (window as any).pchelper.getAllGameConfigs();
    set({ configs: configs || [] });
  },

  setEditingConfig: (config) => set({ editingConfig: config }),
}));
