import { create } from 'zustand';
import type { WidgetConfig, WidgetId, WidgetLayout } from '../../electron/widget/types';

interface WidgetState {
  layout: WidgetLayout | null;
  loading: boolean;
  dragWidgetId: WidgetId | null;

  loadLayout: () => Promise<void>;
  updateWidget: (id: WidgetId, partial: Partial<WidgetConfig>) => Promise<void>;
  reorderWidget: (fromIndex: number, toIndex: number) => Promise<void>;
  resetLayout: () => Promise<void>;
  setDragWidget: (id: WidgetId | null) => void;
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  layout: null,
  loading: true,
  dragWidgetId: null,

  loadLayout: async () => {
    try {
      const layout: WidgetLayout = await window.pchelper.getWidgetLayout();
      set({ layout, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateWidget: async (id, partial) => {
    const current = get().layout;
    if (!current) return;
    const widgets = current.widgets.map((w) => w.id === id ? { ...w, ...partial } : w);
    const next = { widgets };
    await window.pchelper.saveWidgetLayout(next);
    set({ layout: next });
  },

  reorderWidget: async (fromIndex, toIndex) => {
    const current = get().layout;
    if (!current) return;
    const widgets = [...current.widgets];
    const [moved] = widgets.splice(fromIndex, 1);
    widgets.splice(toIndex, 0, moved);
    const reordered = widgets.map((w, i) => ({ ...w, order: i }));
    const next = { widgets: reordered };
    await window.pchelper.saveWidgetLayout(next);
    set({ layout: next });
  },

  resetLayout: async () => {
    const defaults: WidgetLayout = await window.pchelper.getWidgetDefaults();
    await window.pchelper.saveWidgetLayout(defaults);
    set({ layout: defaults });
  },

  setDragWidget: (id) => set({ dragWidgetId: id }),
}));
