import { useEffect, useState } from 'react';
import {
  FileText, FileCode, FileType, Table, Download, Copy,
  Printer, Mail, Eye, RefreshCw, ChevronDown, ChevronRight,
  Settings,
} from 'lucide-react';
import { useReportStore } from '../../stores/reportStore';
import type { ReportTemplate } from '../../../electron/report/exporter';

const TEMPLATE_ICONS: Record<string, typeof FileText> = {
  'Quick Summary': FileText,
  'Full Report': FileCode,
  'Hardware Specs': FileType,
  'Software Inventory': Table,
};

export default function ReportView() {
  const report = useReportStore((s) => s.report);
  const templates = useReportStore((s) => s.templates);
  const selectedTemplate = useReportStore((s) => s.selectedTemplate);
  const previewHtml = useReportStore((s) => s.previewHtml);
  const previewText = useReportStore((s) => s.previewText);
  const previewJson = useReportStore((s) => s.previewJson);
  const loading = useReportStore((s) => s.loading);
  const generateReport = useReportStore((s) => s.generateReport);
  const fetchTemplates = useReportStore((s) => s.fetchTemplates);
  const setSelectedTemplate = useReportStore((s) => s.setSelectedTemplate);

  const [activeFormat, setActiveFormat] = useState<'html' | 'text' | 'json'>('html');
  const [showRaw, setShowRaw] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [sections, setSections] = useState<ReportTemplate['sections'][number][]>(['full']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecs, setIncludeRecs] = useState(true);
  const [showPastReports, setShowPastReports] = useState(false);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const SECTION_OPTIONS: { key: ReportTemplate['sections'][number]; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    { key: 'hardware', label: 'Hardware' },
    { key: 'software', label: 'Software' },
    { key: 'health', label: 'Health' },
    { key: 'performance', label: 'Benchmark' },
    { key: 'full', label: 'Full Report (All)' },
  ];

  const toggleSection = (s: ReportTemplate['sections'][number]) => {
    setSections((prev) => {
      if (s === 'full') return ['full'];
      const withoutFull = prev.filter((x) => x !== 'full');
      if (withoutFull.includes(s)) return withoutFull.filter((x) => x !== s);
      return [...withoutFull, s];
    });
  };

  const handleGenerate = () => {
    const template: ReportTemplate = {
      name: 'Custom',
      sections: sections.length > 0 ? sections : ['full'],
      format: activeFormat === 'json' ? 'json' : activeFormat === 'text' ? 'text' : 'html',
      includeCharts,
      includeRecommendations: includeRecs,
    };
    generateReport(template);
  };

  const handleQuickAction = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setSelectedTemplate(template);
      setActiveFormat(template.format as 'html' | 'text' | 'json');
      generateReport(template);
    }
  };

  const handleCopy = () => {
    const text = activeFormat === 'html' ? previewHtml : activeFormat === 'json' ? previewJson : previewText;
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = activeFormat === 'html' ? previewHtml : activeFormat === 'json' ? previewJson : previewText;
    const ext = activeFormat === 'html' ? 'html' : activeFormat === 'json' ? 'json' : 'txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pchelper_report_${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (activeFormat === 'html') {
      const w = window.open('', '_blank');
      if (w) { w.document.write(previewHtml); w.document.close(); w.print(); }
    } else {
      window.print();
    }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Hardware Report</h2>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchTemplates}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {templates.map((t) => {
          const Icon = TEMPLATE_ICONS[t.name] || FileText;
          return (
            <button
              key={t.name}
              className="btn"
              style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500 }}
              onClick={() => handleQuickAction(t.name)}
            >
              <Icon size={14} style={{ marginRight: 6 }} />
              {t.name}
              <span style={{ fontSize: 9, color: 'var(--text-secondary)', marginLeft: 6, textTransform: 'uppercase' }}>
                {t.format}
              </span>
            </button>
          );
        })}
      </div>

      {/* Report builder */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <button
          className="btn"
          style={{ width: '100%', padding: '8px 12px', justifyContent: 'flex-start', gap: 8, fontWeight: 600, fontSize: 12, marginBottom: showSections ? 8 : 0 }}
          onClick={() => setShowSections(!showSections)}
        >
          <Settings size={14} />Report Builder {showSections ? <ChevronDown size={14} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
        </button>
        {showSections && (
          <div>
            <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Sections</div>
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  {SECTION_OPTIONS.map((s) => (
                    <label key={s.key} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sections.includes(s.key)}
                        onChange={() => toggleSection(s.key)}
                      />{s.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3" style={{ flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Format</div>
                <div className="flex items-center gap-1">
                  {(['html', 'json', 'text'] as const).map((f) => (
                    <button
                      key={f}
                      className="btn"
                      style={{
                        padding: '4px 12px', fontSize: 11,
                        background: activeFormat === f ? 'var(--accent)' : 'var(--bg-hover)',
                        color: activeFormat === f ? '#fff' : 'var(--text-secondary)',
                        fontWeight: activeFormat === f ? 600 : 400,
                      }}
                      onClick={() => setActiveFormat(f)}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />Include charts
              </label>
              <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={includeRecs} onChange={(e) => setIncludeRecs(e.target.checked)} />Include recommendations
              </label>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600 }} onClick={handleGenerate} disabled={loading}>
              <Eye size={14} style={{ marginRight: 6 }} />{loading ? 'Generating...' : 'Generate & Preview'}
            </button>
          </div>
        )}
      </div>

      {/* Report preview */}
      {report && (
        <>
          {/* Header */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{report.systemInfo.hostname} — System Report</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                Generated {new Date(report.generatedAt).toLocaleString()} · {report.health.score} Health Score · {report.performance.benchmarkScore} Benchmark
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setShowRaw(!showRaw)}>
                {showRaw ? <Eye size={12} style={{ marginRight: 3 }} /> : <FileCode size={12} style={{ marginRight: 3 }} />}
                {showRaw ? 'Formatted' : 'Raw'}
              </button>
            </div>
          </div>

          {/* Preview content */}
          <div className="card" style={{ flex: 1, overflow: 'auto', marginBottom: 12 }}>
            {showRaw ? (
              <pre style={{
                margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                color: 'var(--text-primary)', background: 'transparent',
              }}>
                {activeFormat === 'html' ? previewHtml : activeFormat === 'json' ? previewJson : previewText}
              </pre>
            ) : (
              activeFormat === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} style={{ padding: 16 }} />
              ) : activeFormat === 'json' ? (
                <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                  {previewJson}
                </pre>
              ) : (
                <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                  {previewText}
                </pre>
              )
            )}
          </div>

          {/* Export actions */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleDownload}>
              <Download size={14} style={{ marginRight: 4 }} />Save as file
            </button>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleCopy}>
              <Copy size={14} style={{ marginRight: 4 }} />Copy to clipboard
            </button>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handlePrint}>
              <Printer size={14} style={{ marginRight: 4 }} />Print
            </button>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
              <Mail size={14} style={{ marginRight: 4 }} />Email Report
            </button>
          </div>
        </>
      )}

      {/* Past reports */}
      <div style={{ marginTop: 16 }}>
        <button
          className="btn"
          style={{ width: '100%', padding: '8px 12px', justifyContent: 'flex-start', gap: 8, fontWeight: 600, fontSize: 12 }}
          onClick={() => setShowPastReports(!showPastReports)}
        >
          {showPastReports ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Past Reports
        </button>
        {showPastReports && (
          <div className="card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>
              No past reports saved yet. Generate and export reports to see them here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
