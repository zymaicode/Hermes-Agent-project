import { create } from 'zustand';
import type { Alert } from '../utils/types';

interface AlertState {
  activeAlerts: Alert[];
  alertHistory: Alert[];
  showAlertModal: boolean;
  currentModalAlert: Alert | null;

  fetchAlerts: () => Promise<void>;
  subscribeToAlerts: () => () => void;
  dismissAlert: (id: string) => Promise<void>;
  snoozeAlert: (id: string, minutes: number) => Promise<void>;
  dismissAllAlerts: () => Promise<void>;
  showAlert: (alert: Alert) => void;
  hideAlert: () => void;
  runAiAnalysis: () => Promise<void>;
  fetchAlertHistory: (limit?: number) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => {
  let unsubscribe: (() => void) | null = null;

  return {
    activeAlerts: [],
    alertHistory: [],
    showAlertModal: false,
    currentModalAlert: null,

    fetchAlerts: async () => {
      const alerts = await window.pchelper.getAlerts();
      set({ activeAlerts: alerts });
      if (alerts.length > 0) {
        set({ showAlertModal: true });
      }
    },

    subscribeToAlerts: () => {
      if (unsubscribe) return unsubscribe;
      unsubscribe = window.pchelper.onAlertUpdate((data: unknown) => {
        const alert = data as Alert;
        set((state) => {
          const exists = state.activeAlerts.find((a) => a.id === alert.id);
          if (exists) return state;
          return {
            activeAlerts: [...state.activeAlerts, alert],
            showAlertModal: true,
            currentModalAlert: alert,
          };
        });
      });
      return unsubscribe;
    },

    dismissAlert: async (id: string) => {
      await window.pchelper.dismissAlert(id);
      set((state) => ({
        activeAlerts: state.activeAlerts.filter((a) => a.id !== id),
        showAlertModal: state.activeAlerts.length > 1,
        currentModalAlert:
          state.currentModalAlert?.id === id ? null : state.currentModalAlert,
      }));
    },

    snoozeAlert: async (id: string, minutes: number) => {
      await window.pchelper.snoozeAlert(id, minutes);
      set((state) => ({
        activeAlerts: state.activeAlerts.filter((a) => a.id !== id),
        showAlertModal: state.activeAlerts.length > 1,
        currentModalAlert:
          state.currentModalAlert?.id === id ? null : state.currentModalAlert,
      }));
    },

    dismissAllAlerts: async () => {
      await window.pchelper.dismissAllAlerts();
      set({ activeAlerts: [], showAlertModal: false, currentModalAlert: null });
    },

    showAlert: (alert: Alert) => {
      set({ showAlertModal: true, currentModalAlert: alert });
    },

    hideAlert: () => {
      set({ showAlertModal: false, currentModalAlert: null });
    },

    runAiAnalysis: async () => {
      const alert = await window.pchelper.runAiAnalysis();
      if (alert) {
        set((state) => ({
          activeAlerts: [...state.activeAlerts, alert],
          showAlertModal: true,
          currentModalAlert: alert,
        }));
      }
    },

    fetchAlertHistory: async (limit?: number) => {
      const history = await window.pchelper.getAlertHistory(limit ?? 100);
      set({ alertHistory: history as Alert[] });
    },
  };
});
