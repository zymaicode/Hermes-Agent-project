import { create } from 'zustand';
import type { AiDiagnosticReport } from '../../electron/ai/types';

interface AiDiagnosticState {
  report: AiDiagnosticReport | null;
  loading: boolean;
  error: string | null;
  runDiagnostic: () => Promise<void>;
  clearReport: () => void;
}

export const useAiDiagnosticStore = create<AiDiagnosticState>((set) => ({
  report: null,
  loading: false,
  error: null,

  runDiagnostic: async () => {
    set({ loading: true, error: null });
    try {
      const report = await (window as any).pchelper.runAiDiagnostic();
      set({ report, loading: false });
    } catch (err: any) {
      set({ error: err.message || '诊断失败', loading: false });
    }
  },

  clearReport: () => set({ report: null, error: null }),
}));
