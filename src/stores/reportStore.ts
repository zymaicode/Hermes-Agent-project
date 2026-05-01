import { create } from 'zustand';
import type { ExportReport, ReportTemplate } from '../../electron/report/exporter';

interface ReportState {
  report: ExportReport | null;
  templates: ReportTemplate[];
  selectedTemplate: ReportTemplate | null;
  previewHtml: string;
  previewText: string;
  previewJson: string;
  loading: boolean;

  generateReport: (template?: ReportTemplate) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  setSelectedTemplate: (template: ReportTemplate) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  report: null,
  templates: [],
  selectedTemplate: null,
  previewHtml: '',
  previewText: '',
  previewJson: '',
  loading: false,

  generateReport: async (template?: ReportTemplate) => {
    set({ loading: true });
    try {
      const report = await window.pchelper.generateReport(template);
      const previewJson = await window.pchelper.exportReportJson(report);
      const previewText = await window.pchelper.exportReportText(report);
      const previewHtml = await window.pchelper.exportReportHtml(report);
      set({ report, previewJson, previewText, previewHtml, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchTemplates: async () => {
    try {
      const templates = await window.pchelper.getReportTemplates();
      set({ templates, selectedTemplate: templates[1] });
    } catch {}
  },

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));
