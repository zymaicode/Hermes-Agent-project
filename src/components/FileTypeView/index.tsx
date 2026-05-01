import { useEffect, useState } from 'react';
import {
  File, FileText, FileCode, FileImage, FileAudio, FileVideo,
  Globe, ChevronDown, ChevronRight, Search, RefreshCw,
} from 'lucide-react';
import { useFileTypeStore } from '../../stores/fileTypeStore';

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  text: FileText, document: File, image: FileImage, audio: FileAudio,
  video: FileVideo, system: FileCode,
};

const TYPE_COLORS: Record<string, string> = {
  text: 'var(--blue)', document: 'var(--accent)', image: 'var(--purple)',
  audio: 'var(--green)', video: 'var(--orange)', system: 'var(--yellow)',
};

const CATEGORY_LABELS: Record<string, string> = {
  text: 'Text', document: 'Document', image: 'Image', audio: 'Audio',
  video: 'Video', system: 'System',
};

const COMMON_PROGRAMS = ['Notepad', 'Visual Studio Code', 'Microsoft Edge', 'Google Chrome', 'Microsoft Word', 'Microsoft Excel', 'Windows Media Player', 'VLC Media Player', 'Photos', 'Paint', 'File Explorer'];

export default function FileTypeView() {
  const associations = useFileTypeStore((s) => s.associations);
  const protocols = useFileTypeStore((s) => s.protocols);
  const categoryBreakdown = useFileTypeStore((s) => s.categoryBreakdown);
  const filter = useFileTypeStore((s) => s.filter);
  const categoryFilter = useFileTypeStore((s) => s.categoryFilter);
  const loading = useFileTypeStore((s) => s.loading);
  const fetchAssociations = useFileTypeStore((s) => s.fetchAssociations);
  const fetchProtocols = useFileTypeStore((s) => s.fetchProtocols);
  const fetchCategoryBreakdown = useFileTypeStore((s) => s.fetchCategoryBreakdown);
  const setFilter = useFileTypeStore((s) => s.setFilter);
  const setCategoryFilter = useFileTypeStore((s) => s.setCategoryFilter);
  const setAssociation = useFileTypeStore((s) => s.setAssociation);

  const [selectedExt, setSelectedExt] = useState<string | null>(null);
  const [showProtocols, setShowProtocols] = useState(false);
  const [changeProgram, setChangeProgram] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'extension' | 'program' | 'type'>('extension');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchAssociations();
    fetchProtocols();
    fetchCategoryBreakdown();
  }, [fetchAssociations, fetchProtocols, fetchCategoryBreakdown]);

  const filtered = associations
    .filter((a) => categoryFilter === 'all' || a.perceivedType === categoryFilter)
    .filter((a) => !filter || a.extension.toLowerCase().includes(filter.toLowerCase()) || a.defaultProgram.toLowerCase().includes(filter.toLowerCase()) || a.description.toLowerCase().includes(filter.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'extension') return a.extension.localeCompare(b.extension) * dir;
    if (sortField === 'program') return a.defaultProgram.localeCompare(b.defaultProgram) * dir;
    if (sortField === 'type') return a.perceivedType.localeCompare(b.perceivedType) * dir;
    return 0;
  });

  const selected = associations.find((a) => a.extension === selectedExt);
  const categories = Object.entries(categoryBreakdown).filter(([, count]) => count > 0);

  const handleSetProgram = async (program: string) => {
    if (!selectedExt) return;
    const result = await setAssociation(selectedExt, program);
    if (result.success) {
      fetchAssociations();
      setChangeProgram(null);
    }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>File Type Manager</h2>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { fetchAssociations(); fetchProtocols(); }}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
        </button>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '8px 14px' }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, marginLeft: 8 }}>{associations.length}</span>
        </div>
        {categories.map(([cat, count]) => {
          const Icon = TYPE_ICONS[cat] || File;
          return (
            <div key={cat} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: TYPE_COLORS[cat] || 'var(--text-secondary)', display: 'flex' }}><Icon size={14} /></span>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{CATEGORY_LABELS[cat] || cat}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: TYPE_COLORS[cat] || 'var(--text-primary)' }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 28, fontSize: 12, width: '100%' }}
            placeholder="Filter by extension, program, or description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          className="input"
          style={{ fontSize: 11, padding: '4px 8px', width: 130 }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(([cat]) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', gap: 1, overflow: 'hidden' }}>
        {/* Table */}
        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '90px 1fr 150px 140px 110px',
            padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
            fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
          }}>
            <span style={{ cursor: 'pointer' }} onClick={() => { setSortField('extension'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
              Extension {sortField === 'extension' && (sortDir === 'asc' ? '▲' : '▼')}
            </span>
            <span>Description</span>
            <span style={{ cursor: 'pointer' }} onClick={() => { setSortField('program'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
              Default Program {sortField === 'program' && (sortDir === 'asc' ? '▲' : '▼')}
            </span>
            <span>Content Type</span>
            <span style={{ cursor: 'pointer' }} onClick={() => { setSortField('type'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
              Category {sortField === 'type' && (sortDir === 'asc' ? '▲' : '▼')}
            </span>
          </div>
          {sorted.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 150px 140px 110px',
                padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center',
                cursor: 'pointer',
                background: selectedExt === a.extension ? 'var(--bg-hover)' : 'transparent',
              }}
              onClick={() => setSelectedExt(selectedExt === a.extension ? null : a.extension)}
            >
              <span className="text-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{a.extension}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.isRegistered ? a.defaultProgram : (
                  <span style={{ color: 'var(--red)' }}>Unregistered</span>
                )}
              </span>
              <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.contentType}</span>
              <span style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4, width: 'fit-content',
                background: (TYPE_COLORS[a.perceivedType] || 'var(--text-secondary)') + '22',
                color: TYPE_COLORS[a.perceivedType] || 'var(--text-secondary)',
                fontWeight: 500, textTransform: 'capitalize',
              }}>
                {a.perceivedType}
              </span>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ width: 280, minWidth: 240, padding: 14, overflow: 'auto' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{selected.extension}</h3>
            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Description:</span> {selected.description}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Content Type:</span> <span className="text-mono" style={{ fontSize: 10 }}>{selected.contentType}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>ProgId:</span> <span className="text-mono" style={{ fontSize: 10 }}>{selected.progId}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Default Program:</span> {selected.isRegistered ? selected.defaultProgram : <span style={{ color: 'var(--red)' }}>None</span>}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Icon Path:</span> <span className="text-mono" style={{ fontSize: 9 }}>{selected.iconPath}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Registered:</span> <span style={{ color: selected.isRegistered ? 'var(--green)' : 'var(--red)' }}>{selected.isRegistered ? 'Yes' : 'No'}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>User Choice:</span> {selected.hasUserChoice ? 'Custom' : 'System Default'}</div>
            </div>

            {/* Change default */}
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '6px 12px', fontSize: 11 }}
                onClick={() => setChangeProgram(changeProgram === selected.extension ? null : selected.extension)}
              >
                Change Default Program
              </button>
              {changeProgram === selected.extension && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {COMMON_PROGRAMS.map((p) => (
                    <button
                      key={p}
                      className="btn"
                      style={{
                        padding: '4px 10px', fontSize: 11, textAlign: 'left',
                        background: p === selected.defaultProgram ? 'var(--accent-muted)' : 'transparent',
                      }}
                      onClick={() => handleSetProgram(p)}
                    >
                      {p}
                      {p === selected.defaultProgram && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)' }}>(current)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!selected.isRegistered && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--red)' }}>
                No program registered for this file type
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protocol Associations */}
      <div style={{ marginTop: 2 }}>
        <button
          className="btn"
          style={{
            width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 600,
            justifyContent: 'flex-start', gap: 8,
            borderBottom: showProtocols ? 'none' : undefined,
          }}
          onClick={() => setShowProtocols(!showProtocols)}
        >
          {showProtocols ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Globe size={14} />
          Protocol Associations ({protocols.length})
        </button>
        {showProtocols && (
          <div className="card" style={{ overflow: 'auto', maxHeight: 200, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '120px 160px 1fr',
              padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
              fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
            }}>
              <span>Protocol</span>
              <span>Default Program</span>
              <span>Description</span>
            </div>
            {protocols.map((p) => (
              <div key={p.protocol} style={{
                display: 'grid', gridTemplateColumns: '120px 160px 1fr',
                padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center',
              }}>
                <span className="text-mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>{p.protocol}://</span>
                <span>{p.defaultProgram}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{p.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
