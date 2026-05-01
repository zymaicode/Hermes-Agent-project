import { create } from 'zustand';
import type { PowerPlan, PowerReport } from '../../electron/power/manager';

interface PowerState {
  plans: PowerPlan[];
  report: PowerReport | null;
  loading: boolean;

  fetchPlans: () => Promise<void>;
  fetchReport: () => Promise<void>;
  setActivePlan: (guid: string) => Promise<{ success: boolean; message: string }>;
}

export const usePowerStore = create<PowerState>((set) => ({
  plans: [],
  report: null,
  loading: false,

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const plans = await window.pchelper.getPowerPlans();
      set({ plans, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchReport: async () => {
    try {
      const report = await window.pchelper.getPowerReport();
      set({ report });
    } catch {}
  },

  setActivePlan: async (guid) => {
    const result = await window.pchelper.setActivePlan(guid);
    return result;
  },
}));
