import { create } from 'zustand';

interface SoundState {
  currentScheme: import('../../electron/sounds/manager').SoundScheme | null;
  schemes: import('../../electron/sounds/manager').SoundScheme[];
  devices: import('../../electron/sounds/manager').AudioDevice[];
  loading: boolean;

  fetchCurrentScheme: () => Promise<void>;
  fetchSchemes: () => Promise<void>;
  fetchDevices: () => Promise<void>;
  setScheme: (name: string) => Promise<boolean>;
  setSoundEvent: (eventName: string, file: string | null) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  testSound: (eventName: string) => Promise<boolean>;
  playFile: (path: string) => Promise<boolean>;
  fetchAll: () => Promise<void>;
}

export const useSoundStore = create<SoundState>((set) => ({
  currentScheme: null,
  schemes: [],
  devices: [],
  loading: false,

  fetchCurrentScheme: async () => {
    const currentScheme = await window.pchelper.getSoundScheme();
    set({ currentScheme });
  },

  fetchSchemes: async () => {
    const schemes = await window.pchelper.getSoundSchemes();
    set({ schemes });
  },

  fetchDevices: async () => {
    const devices = await window.pchelper.getAudioDevices();
    set({ devices });
  },

  setScheme: async (name: string) => {
    const result = await window.pchelper.setSoundScheme(name);
    if (result.success) {
      const currentScheme = await window.pchelper.getSoundScheme();
      set({ currentScheme });
    }
    return result.success;
  },

  setSoundEvent: async (eventName: string, file: string | null) => {
    const result = await window.pchelper.setSoundEvent(eventName, file);
    if (result.success) {
      const currentScheme = await window.pchelper.getSoundScheme();
      set({ currentScheme });
    }
    return result.success;
  },

  resetToDefaults: async () => {
    const result = await window.pchelper.resetSoundDefaults();
    if (result.success) {
      const currentScheme = await window.pchelper.getSoundScheme();
      set({ currentScheme });
    }
    return result.success;
  },

  testSound: async (eventName: string) => {
    return (await window.pchelper.testSystemSound(eventName)).success;
  },

  playFile: async (path: string) => {
    return (await window.pchelper.playSoundFile(path)).success;
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [currentScheme, schemes, devices] = await Promise.all([
        window.pchelper.getSoundScheme(),
        window.pchelper.getSoundSchemes(),
        window.pchelper.getAudioDevices(),
      ]);
      set({ currentScheme, schemes, devices, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
