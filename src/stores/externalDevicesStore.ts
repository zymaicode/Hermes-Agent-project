import { create } from 'zustand';
import type {
  MonitorInfo,
  AudioDeviceInfo,
  BluetoothDeviceEntry,
  PrinterEntry,
  GameControllerEntry,
} from '../../electron/external/deviceManager';

interface ExternalDevicesState {
  monitors: MonitorInfo[];
  audioDevices: AudioDeviceInfo[];
  bluetoothDevices: BluetoothDeviceEntry[];
  printers: PrinterEntry[];
  gameControllers: GameControllerEntry[];
  loading: boolean;

  fetchMonitors: () => Promise<void>;
  fetchAudioDevices: () => Promise<void>;
  fetchBluetoothDevices: () => Promise<void>;
  fetchPrinters: () => Promise<void>;
  fetchGameControllers: () => Promise<void>;
  refreshAll: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useExternalDevicesStore = create<ExternalDevicesState>((set) => ({
  monitors: [],
  audioDevices: [],
  bluetoothDevices: [],
  printers: [],
  gameControllers: [],
  loading: false,

  fetchMonitors: async () => {
    const monitors = await window.pchelper.getMonitors();
    set({ monitors });
  },

  fetchAudioDevices: async () => {
    const audioDevices = await window.pchelper.getExternalAudioDevices();
    set({ audioDevices });
  },

  fetchBluetoothDevices: async () => {
    const bluetoothDevices = await window.pchelper.getBluetoothDevices();
    set({ bluetoothDevices });
  },

  fetchPrinters: async () => {
    const printers = await window.pchelper.getPrinters();
    set({ printers });
  },

  fetchGameControllers: async () => {
    const gameControllers = await window.pchelper.getGameControllers();
    set({ gameControllers });
  },

  refreshAll: async () => {
    await window.pchelper.refreshDevices();
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [monitors, audioDevices, bluetoothDevices, printers, gameControllers] =
        await Promise.all([
          window.pchelper.getMonitors(),
          window.pchelper.getExternalAudioDevices(),
          window.pchelper.getBluetoothDevices(),
          window.pchelper.getPrinters(),
          window.pchelper.getGameControllers(),
        ]);
      set({ monitors, audioDevices, bluetoothDevices, printers, gameControllers, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
