import { create } from 'zustand';

export interface OverlayMetricsData {
  cpu: { usage: number; temp: number };
  memory: { used: number; total: number; usage: number };
  gpu: { usage: number; temp: number; memoryUsed: number; memoryTotal: number };
  fps: { current: number; min: number; max: number };
  network: { uploadSpeed: number; downloadSpeed: number };
  timestamp: number;
}

export interface OverlayConfig {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  opacity: number;
  metrics: {
    showCpu: boolean;
    showMemory: boolean;
    showGpu: boolean;
    showFps: boolean;
    showNetwork: boolean;
  };
  fontSize: number;
  refreshInterval: number;
  clickThrough: boolean;
  autoHide: boolean;
  accentColor: string;
}

interface OverlayState {
  active: boolean;
  config: OverlayConfig;
  currentMetrics: OverlayMetricsData | null;

  fetchStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  toggleOverlay: (enabled: boolean) => Promise<void>;
  updateConfig: (partial: Partial<OverlayConfig>) => Promise<void>;
  setConfigLocal: (partial: Partial<OverlayConfig>) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  active: false,
  config: {
    enabled: false,
    position: 'top-right',
    opacity: 0.7,
    metrics: {
      showCpu: true,
      showMemory: true,
      showGpu: true,
      showFps: true,
      showNetwork: true,
    },
    fontSize: 12,
    refreshInterval: 1000,
    clickThrough: true,
    autoHide: false,
    accentColor: '#4fc3f7',
  },
  currentMetrics: null,

  fetchStatus: async () => {
    try {
      const status = await window.pchelper.getOverlayStatus();
      set({ active: status.active, config: status.config });
    } catch {
      // bridge may not be available yet
    }
  },

  fetchMetrics: async () => {
    try {
      const metrics = await window.pchelper.getOverlayMetrics();
      if (metrics) set({ currentMetrics: metrics });
    } catch {
      // silent
    }
  },

  toggleOverlay: async (enabled: boolean) => {
    set((s) => ({ config: { ...s.config, enabled } }));
    try {
      await window.pchelper.togglePerfOverlay(enabled);
      set({ active: enabled });
    } catch {
      // silent
    }
  },

  updateConfig: async (partial: Partial<OverlayConfig>) => {
    set((s) => ({ config: { ...s.config, ...partial } }));
    try {
      await window.pchelper.updateOverlayConfig(partial);
    } catch {
      // silent
    }
  },

  setConfigLocal: (partial) => {
    set((s) => ({ config: { ...s.config, ...partial } }));
  },
}));
