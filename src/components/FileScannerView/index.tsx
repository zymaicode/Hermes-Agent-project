import { useEffect, useState } from 'react';
import {
  Search, X, FileText, FileImage, FileVideo, FileAudio,
  Archive, Download, Code, File, HardDrive, AlertTriangle,
  Trash2, ChevronDown, ChevronRight, RefreshCw, BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useFileScannerStore } from '../../stores/fileScannerStore';
import type { ScannedFile } from '../../../electron/files/scanner';

const TYPE_INFO: Record<string, { icon: typeof File; color: string; label: string }> = {
  document: { icon: FileText, color: 'var(--accent)', label: 'Documents' },
  image: { icon: FileImage, color: 'var(--purple)', label: 'Images' },
  video: { icon: FileVideo, color: '#f85149', label: 'Videos' },
  audio: { icon: FileAudio, color: 'var(--green)', label: 'Audio' },
  archive: { icon: Archive, color: 'var(--yellow)', label: 'Archives' },
  installer: { icon: Download, color: 'var(--orange)', label: 'Installers' },
  code: { icon: Code, color: 'var(--blue)', label: 'Code' },
  other: { icon: File, color: 'var(--text-secondary)', label: 'Other' },
};

const DIR_OPTIONS = ['Desktop', 'Downloads', 'Documents', 'Videos', 'Pictures', 'Music', 'AppData'];
const SIZE_OPTIONS = [10, 50, 100, 500, 1000];
const SIZE_LABELS: Record<number, string> = { 10: '10 MB', 50: '50 MB', 100: '100 MB', 500: '500 MB', 1000: '1 GB' };

function formatSize(mb: number): string {
  if (mb >= 1000000) return `${(mb / 1000000).toFixed(2)} TB`;
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  if (mb < 0.01) return `${(mb * 1000).toFixed(0)} KB`;
  if (mb < 1) return `${(mb * 1000).toFixed(0)} KB`;
  return `${mb} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const PIE_COLORS = ['var(--accent)', 'var(--purple)', '#f85149', 'var(--green)', 'var(--yellow)', 'var(--orange)', 'var(--blue)', 'var(--text-secondary)'];

export default function FileScannerView() {
  const files = useFileScannerStore((s) => s.files);
  const totalSizeMB = useFileScannerStore((s) => s.totalSizeMB);
  const totalFiles = useFileScannerStore((s) => s.totalFiles);
  const duplicates = useFileScannerStore((s) => s.duplicates);
  const categories = useFileScannerStore((s) => s.categories);
  const scanning = useFileScannerStore((s) => s.scanning);
  const scanProgress = useFileScannerStore((s) => s.scanProgress);
  const scanPhase = useFileScannerStore((s) => s.scanPhase);
  const scanFound = useFileScannerStore((s) => s.scanFound);
  const activeTab = useFileScannerStore((s) => s.activeTab);
  const setActiveTab = useFileScannerStore((s) => s.setActiveTab);
  const startScan = useFileScannerStore((s) => s.startScan);
  const cancelScan = useFileScannerStore((s) => s.cancelScan);
  const resetResults = useFileScannerStore((s) => s.resetResults);

  const [showConfig, setShowConfig] = useState(true);
  const [dirs, setDirs] = useState(['Downloads', 'Documents', 'Desktop', 'Videos']);
  const [minSize, setMinSize] = useState(50);
  const [findDuplicates, setFindDuplicates] = useState(true);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [sortField, setSortField] = useState<'sizeMB' | 'name' | 'lastModified'>('sizeMB');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [duplicateSelected, setDuplicateSelected] = useState<Set<string>>(new Set());

  const hasResults = files.length > 0;

  const handleScan = () => {
    resetResults();
    startScan({
      directories: dirs,
      minSizeMB: minSize,
      maxSizeMB: 1000000,
      fileTypes: [],
      includeSystem: false,
      includeHidden,
      findDuplicates,
    });
  };

  const sorted = [...files].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'sizeMB') return (a.sizeMB - b.sizeMB) * dir;
    if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
    return (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()) * dir;
  });

  const largeFiles = [...files].sort((a, b) => b.sizeMB - a.sizeMB).slice(0, 20);

  const duplicateGroups = new Map<string, ScannedFile[]>();
  for (const f of duplicates) {
    const key = f.duplicateGroup || 'unknown';
    if (!duplicateGroups.has(key)) duplicateGroups.set(key, []);
    duplicateGroups.get(key)!.push(f);
  }
  // Also include originals in their groups
  for (const f of files) {
    if (f.isDuplicate && f.duplicateGroup) {
      if (!duplicateGroups.has(f.duplicateGroup)) duplicateGroups.set(f.duplicateGroup, []);
      const group = duplicateGroups.get(f.duplicateGroup)!;
      if (!group.find((g) => g.path === f.path)) group.push(f);
    }
  }

  const duplicateWaste = duplicates.reduce((s, f) => s + f.sizeMB, 0);

  const pieData = Object.entries(categories).map(([type, data]) => ({
    name: TYPE_INFO[type]?.label || type,
    value: data.totalMB,
    color: TYPE_INFO[type]?.color || 'var(--text-secondary)',
  }));

  const barData = Object.entries(categories).map(([type, data]) => ({
    name: TYPE_INFO[type]?.label || type,
    size: Math.round(data.totalMB),
    count: data.count,
    fill: TYPE_INFO[type]?.color || 'var(--text-secondary)',
  }));

  const toggleAllDup = (paths: string[]) => {
    setDuplicateSelected((prev) => {
      const next = new Set(prev);
      const allSelected = paths.every((p) => next.has(p));
      for (const p of paths) {
        if (allSelected) next.delete(p);
        else next.add(p);
      }
      return next;
    });
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>File Scanner</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? <ChevronDown size={14} style={{ marginRight: 4 }} /> : <ChevronRight size={14} style={{ marginRight: 4 }} />}Config
          </button>
          {hasResults && <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={resetResults}><X size={14} style={{ marginRight: 4 }} />Clear</button>}
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="flex items-center gap-4 mb-3" style={{ flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Directories</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {DIR_OPTIONS.map((d) => (
                  <label key={d} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <input type="checkbox" checked={dirs.includes(d)} onChange={(e) => {
                      setDirs(e.target.checked ? [...dirs, d] : dirs.filter((x) => x !== d));
                    }} />{d}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3" style={{ flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Min Size</div>
              <select className="input" style={{ fontSize: 11, padding: '4px 8px' }} value={minSize} onChange={(e) => setMinSize(Number(e.target.value))}>
                {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Options</div>
              <div className="flex items-center gap-3">
                <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={findDuplicates} onChange={(e) => setFindDuplicates(e.target.checked)} />Find duplicates
                </label>
                <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeHidden} onChange={(e) => setIncludeHidden(e.target.checked)} />Include hidden
                </label>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600 }} onClick={handleScan} disabled={scanning || dirs.length === 0}>
            <Search size={16} style={{ marginRight: 6 }} />Start Scan
          </button>
        </div>
      )}

      {/* Scanning progress */}
      {scanning && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{scanPhase}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{scanFound} files found so far</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{scanProgress}%</div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${scanProgress}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <button className="btn" style={{ padding: '6px 16px', fontSize: 12, color: 'var(--red)' }} onClick={cancelScan}>
            <X size={14} style={{ marginRight: 4 }} />Cancel
          </button>
        </div>
      )}

      {/* Results */}
      {hasResults && !scanning && (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '8px 14px' }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Found</span>
              <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 6 }}>{totalFiles}</span>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>files</span>
            </div>
            <div className="card" style={{ padding: '8px 14px' }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 6, color: 'var(--accent)' }}>{formatSize(totalSizeMB)}</span>
            </div>
            {duplicates.length > 0 && (
              <div className="card" style={{ padding: '8px 14px' }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Duplicates</span>
                <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 6, color: 'var(--yellow)' }}>{duplicates.length}</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>({formatSize(duplicateWaste)} wasted)</span>
              </div>
            )}
          </div>

          {/* Category pie chart */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Files by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => formatSize(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-2">
            {(['all', 'large', 'duplicates', 'categories'] as const).map((tab) => (
              <button
                key={tab}
                className="btn"
                style={{
                  padding: '5px 14px', fontSize: 11, fontWeight: activeTab === tab ? 600 : 400,
                  background: activeTab === tab ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                  border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'All Files' : tab === 'large' ? 'Large Files' : tab === 'duplicates' ? 'Duplicates' : 'By Category'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="card" style={{ overflow: 'auto' }}>
            {activeTab === 'all' && (
              <>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 200px 100px 100px 140px',
                  padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
                  fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
                }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Name {sortField === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</span>
                  <span>Path</span>
                  <span style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('sizeMB')}>Size {sortField === 'sizeMB' && (sortDir === 'asc' ? '▲' : '▼')}</span>
                  <span>Type</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => handleSort('lastModified')}>Modified {sortField === 'lastModified' && (sortDir === 'asc' ? '▲' : '▼')}</span>
                </div>
                {sorted.map((f, i) => {
                  const info = TYPE_INFO[f.type] || TYPE_INFO.other;
                  const Icon = info.icon;
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1fr 200px 100px 100px 140px',
                      padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center',
                      opacity: f.isDuplicate ? 0.6 : 1,
                    }}>
                      <span className="flex items-center gap-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Icon size={14} style={{ color: info.color, flexShrink: 0 }} />
                        {f.name}
                        {f.isDuplicate && <span style={{ fontSize: 8, color: 'var(--yellow)' }}>DUP</span>}
                      </span>
                      <span className="text-mono" style={{ fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.path}</span>
                      <span className="text-mono" style={{ fontSize: 10, textAlign: 'right', fontWeight: 600 }}>{formatSize(f.sizeMB)}</span>
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 4, width: 'fit-content',
                        background: info.color + '22', color: info.color, fontWeight: 500,
                      }}>
                        {info.label}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{formatDate(f.lastModified)}</span>
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === 'large' && (
              <div style={{ padding: 8 }}>
                {largeFiles.map((f, i) => {
                  const pct = (f.sizeMB / (largeFiles[0]?.sizeMB || 1)) * 100;
                  const info = TYPE_INFO[f.type] || TYPE_INFO.other;
                  const Icon = info.icon;
                  return (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11 }}>
                      <Icon size={16} style={{ color: info.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                          <span className="text-mono" style={{ fontWeight: 600, fontSize: 11 }}>{formatSize(f.sizeMB)}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-hover)' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: info.color, borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }} className="text-mono">{f.path}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'duplicates' && (
              <div style={{ padding: 8 }}>
                {duplicateGroups.size === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No duplicate files found.</div>
                ) : (
                  <>
                    <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-secondary)' }}>
                      Found {duplicateGroups.size} duplicate groups wasting {formatSize(duplicateWaste)}
                    </div>
                    {[...duplicateGroups.entries()].map(([groupId, group]) => {
                      const allPaths = group.map((g) => g.path);
                      const selectedInGroup = allPaths.filter((p) => duplicateSelected.has(p));
                      return (
                        <div key={groupId} className="card" style={{ padding: 12, marginBottom: 8, background: 'var(--bg-hover)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span style={{ fontWeight: 600, fontSize: 12 }}>{group[0]?.name || 'Unknown'}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 8 }}>
                                {group.length} copies · {formatSize(group[0]?.sizeMB || 0)} each · {formatSize(group.reduce((s, f) => s + f.sizeMB, 0))} total
                              </span>
                            </div>
                            <button className="btn" style={{ padding: '3px 10px', fontSize: 10 }} onClick={() => toggleAllDup(allPaths)}>
                              {selectedInGroup.length === allPaths.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          {group.map((f) => (
                            <div key={f.path} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 10 }}>
                              <input type="checkbox" checked={duplicateSelected.has(f.path)} onChange={() => toggleAllDup([f.path])} />
                              <span className="text-mono" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.path}</span>
                              <span className="text-mono">{formatSize(f.sizeMB)}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{formatDate(f.lastModified)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    {duplicateSelected.size > 0 && (
                      <button className="btn" style={{ padding: '6px 14px', fontSize: 12, color: 'var(--red)', fontWeight: 600, marginTop: 8 }}>
                        <Trash2 size={14} style={{ marginRight: 4 }} />Delete {duplicateSelected.size} Selected
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div style={{ padding: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} tickFormatter={formatSize} />
                    <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={10} width={80} />
                    <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} formatter={(v: number, n: string) => n === 'size' ? formatSize(v) : v} />
                    <Bar dataKey="size" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
