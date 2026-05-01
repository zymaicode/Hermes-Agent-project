import { useEffect, useState, useMemo } from 'react';
import {
  Type, Search, RefreshCw, Download, X, ChevronRight,
  Monitor, Clock, FileText, Hash,
} from 'lucide-react';
import { useFontStore } from '../../stores/fontStore';
import { Badge } from '../common/Badge';
import type { FontEntry } from '../../../electron/fonts/manager';

const typeLabels: Record<string, string> = {
  'sans-serif': 'Sans-Serif',
  'serif': 'Serif',
  'monospace': 'Monospace',
  'display': 'Display',
  'handwriting': 'Handwriting',
  'symbol': 'Symbol',
};

const typeBadge: Record<string, 'blue' | 'purple' | 'green' | 'orange' | 'yellow' | 'red'> = {
  'sans-serif': 'blue',
  'serif': 'purple',
  'monospace': 'green',
  'display': 'orange',
  'handwriting': 'yellow',
  'symbol': 'red',
};

const typeColor: Record<string, string> = {
  'sans-serif': 'var(--accent)',
  'serif': 'var(--purple)',
  'monospace': 'var(--green)',
  'display': 'var(--orange)',
  'handwriting': 'var(--yellow)',
  'symbol': 'var(--red)',
};

const defaultPreviewTexts = [
  'The quick brown fox jumps over the lazy dog',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789 !@#$%^&*()',
];

function FontCard({
  font,
  onClick,
}: {
  font: FontEntry;
  onClick: () => void;
}) {
  const isMono = font.type === 'monospace';
  return (
    <div
      className="card animate-fadeIn"
      style={{ padding: 16, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: isMono ? 15 : 16,
            fontWeight: 600,
            fontFamily: isMono ? 'var(--font-mono)' : `"${font.name}", sans-serif`,
            marginBottom: 2,
          }} className="truncate">
            {font.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{font.family}</div>
        </div>
        {font.isSystemFont && (
          <span title="System font" style={{ color: 'var(--text-secondary)', flexShrink: 0, display: 'inline-flex' }}>
            <Monitor size={14} />
          </span>
        )}
      </div>

      <div style={{
        fontSize: 18,
        fontFamily: isMono ? 'var(--font-mono)' : `"${font.name}", sans-serif`,
        color: 'var(--text-primary)',
        marginBottom: 8,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.3,
      }}>
        {font.sampleText.slice(0, 30)}
      </div>

      <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
        <Badge variant={typeBadge[font.type] || 'gray'}>{typeLabels[font.type] || font.type}</Badge>
        {font.styles.slice(0, 3).map((s) => (
          <span key={s} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{s}</span>
        ))}
        {font.styles.length > 3 && (
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{font.styles.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        <span>{font.format.toUpperCase()}</span>
        <span>{font.fileSizeKB} KB</span>
        {font.isVariable && <Badge variant="purple">Variable</Badge>}
      </div>
    </div>
  );
}

export default function FontView() {
  const fonts = useFontStore((s) => s.fonts);
  const grouped = useFontStore((s) => s.grouped);
  const recentFonts = useFontStore((s) => s.recentFonts);
  const loading = useFontStore((s) => s.loading);
  const fetchAll = useFontStore((s) => s.fetchAll);
  const getFontDetail = useFontStore((s) => s.getFontDetail);
  const getFontPreview = useFontStore((s) => s.getFontPreview);

  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedFont, setSelectedFont] = useState<FontEntry | null>(null);
  const [detailData, setDetailData] = useState<Awaited<ReturnType<typeof getFontDetail>>>(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [previewSvg, setPreviewSvg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filteredFonts = useMemo(() => {
    let list = fonts;
    if (activeType !== 'All') list = list.filter((f) => f.type === activeType);
    if (search) list = list.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [fonts, activeType, search]);

  const types = useMemo(() => Object.keys(grouped), [grouped]);
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: fonts.length };
    for (const [type, items] of Object.entries(grouped)) counts[type] = items.length;
    return counts;
  }, [grouped, fonts]);

  const stats = useMemo(() => {
    const totalStyles = fonts.reduce((s, f) => s + f.styles.length, 0);
    const variableCount = fonts.filter((f) => f.isVariable).length;
    const avgSize = fonts.length > 0 ? Math.round(fonts.reduce((s, f) => s + f.fileSizeKB, 0) / fonts.length) : 0;
    return { totalStyles, variableCount, avgSize };
  }, [fonts]);

  const recentFontEntries = useMemo(() => {
    return fonts.filter((f) => recentFonts.includes(f.name));
  }, [fonts, recentFonts]);

  const handleSelect = async (font: FontEntry) => {
    setSelectedFont(font);
    const detail = await getFontDetail(font.name);
    setDetailData(detail);
    try {
      const svg = await getFontPreview(font.name, previewText, 48);
      setPreviewSvg(svg);
    } catch { setPreviewSvg(''); }
  };

  const updatePreview = async (text: string) => {
    setPreviewText(text);
    if (selectedFont) {
      try {
        const svg = await getFontPreview(selectedFont.name, text, 48);
        setPreviewSvg(svg);
      } catch { setPreviewSvg(''); }
    }
  };

  if (loading && fonts.length === 0) {
    return (
      <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Font Manager</h2>
        </div>
        <div className="empty-state"><div className="empty-state-title">Loading fonts...</div></div>
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Font Manager</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchAll}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
          <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }}>
            <Download size={14} style={{ marginRight: 4 }} />Install Font
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <select
          className="input"
          style={{ width: 160 }}
          value={activeType}
          onChange={(e) => setActiveType(e.target.value)}
        >
          <option value="All">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{typeLabels[t] || t}</option>
          ))}
        </select>
      </div>

      {/* Type Tabs */}
      <div className="tabs mb-3">
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            className={`tab ${activeType === type ? 'active' : ''}`}
            onClick={() => setActiveType(type)}
            style={{ fontSize: 12 }}
          >
            {type === 'All' ? 'All' : typeLabels[type] || type} ({count})
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Font Grid */}
        <div style={{ flex: selectedFont ? 1 : 1, overflow: 'auto' }}>
          {filteredFonts.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-title">No fonts found</div>
              <div className="empty-state-desc">Try adjusting your search or filter</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
                {filteredFonts.map((f) => (
                  <FontCard key={f.name} font={f} onClick={() => handleSelect(f)} />
                ))}
              </div>

              {/* Recent Fonts */}
              {recentFontEntries.length > 0 && !search && activeType === 'All' && (
                <div style={{ marginBottom: 16 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Recently Viewed</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 8 }}>
                    {recentFontEntries.map((f) => (
                      <div
                        key={f.name}
                        className="card"
                        style={{ padding: '10px 14px', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => handleSelect(f)}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: f.type === 'monospace' ? 'var(--font-mono)' : 'inherit' }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{f.styles.length} styles</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Footer */}
              <div className="card" style={{ padding: 12 }}>
                <div className="flex items-center gap-4" style={{ flexWrap: 'wrap', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1"><Type size={12} /><span>{fonts.length} fonts</span></div>
                  <div className="flex items-center gap-1"><Hash size={12} /><span>{stats.totalStyles} total styles</span></div>
                  <div className="flex items-center gap-1"><FileText size={12} /><span>{stats.variableCount} variable fonts</span></div>
                  <div className="flex items-center gap-1"><Clock size={12} /><span>Avg {stats.avgSize} KB</span></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selectedFont && detailData && (
          <div className="card animate-slideLeft" style={{ width: 400, flexShrink: 0, padding: 20, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: selectedFont.type === 'monospace' ? 'var(--font-mono)' : `"${selectedFont.name}", sans-serif`,
                }}>
                  {selectedFont.name}
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedFont.family}</div>
              </div>
              <button className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }} onClick={() => setSelectedFont(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Preview SVG */}
            {previewSvg && (
              <div className="card" style={{ padding: 12, marginBottom: 12, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                <img src={previewSvg} alt="Font preview" style={{ width: '100%', height: 'auto' }} />
              </div>
            )}

            {/* Custom Preview Input */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Preview Text</div>
              <input
                className="input"
                value={previewText}
                onChange={(e) => updatePreview(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>

            {/* Sample sizes */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Sample Sizes</div>
              {[12, 24, 36, 48, 72].map((size) => (
                <div
                  key={size}
                  style={{
                    fontSize: size,
                    fontFamily: selectedFont.type === 'monospace' ? 'var(--font-mono)' : `"${selectedFont.name}", sans-serif`,
                    lineHeight: 1.2,
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {size}px — {previewText.slice(0, 30)}
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <Badge variant={typeBadge[selectedFont.type] || 'gray'}>{typeLabels[selectedFont.type] || selectedFont.type}</Badge>
              <Badge variant="blue">{selectedFont.format.toUpperCase()}</Badge>
              {selectedFont.isVariable && <Badge variant="purple">Variable</Badge>}
              {selectedFont.isSystemFont && <Badge variant="green">System</Badge>}
            </div>

            {/* Styles */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Styles ({selectedFont.styles.length})</div>
              <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                {selectedFont.styles.map((s) => (
                  <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-tertiary)', color: typeColor[selectedFont.type] || 'var(--text-secondary)' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Details</div>
              <table className="compact">
                <tbody>
                  <tr><td style={{ color: 'var(--text-muted)', width: 100 }}>Version</td><td>{selectedFont.version}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Designer</td><td>{selectedFont.designer}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Foundry</td><td>{selectedFont.foundry}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>License</td><td>{selectedFont.license}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Format</td><td>{selectedFont.format.toUpperCase()}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Size</td><td>{selectedFont.fileSizeKB} KB</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Installed</td><td>{selectedFont.installed}</td></tr>
                  <tr><td style={{ color: 'var(--text-muted)' }}>Weight</td><td>{selectedFont.weight}</td></tr>
                  {detailData && (
                    <>
                      <tr><td style={{ color: 'var(--text-muted)' }}>Glyphs</td><td>{detailData.glyphCount.toLocaleString()}</td></tr>
                      <tr><td style={{ color: 'var(--text-muted)' }}>Kerning Pairs</td><td>{detailData.kerningPairs.toLocaleString()}</td></tr>
                      <tr><td style={{ color: 'var(--text-muted)' }}>Embedding</td><td>{detailData.embeddingRights}</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Scripts */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Scripts</div>
              <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                {selectedFont.supportedScripts.map((s) => (
                  <Badge key={s} variant="gray">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Pangrams */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Pangrams</div>
              {defaultPreviewTexts.map((text) => (
                <div
                  key={text}
                  style={{
                    fontSize: 14,
                    fontFamily: selectedFont.type === 'monospace' ? 'var(--font-mono)' : `"${selectedFont.name}", sans-serif`,
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text}
                </div>
              ))}
            </div>

            {/* File Path */}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {selectedFont.filePath}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
