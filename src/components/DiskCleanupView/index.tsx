import { useEffect } from 'react';
import { Trash2, HardDrive, Search, Check, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { useDiskCleanupStore } from '../../stores/diskCleanupStore';

const TYPE_COLORS: Record<string, string> = {
  System: 'var(--red)',
  ISO: 'var(--yellow)',
  'Disk Image': 'var(--accent)',
  Archive: 'var(--orange)',
  Driver: 'var(--text-secondary)',
  Application: 'var(--green)',
  Library: 'var(--purple)',
  Video: 'var(--accent)',
  Design: 'var(--purple)',
  Temp: 'var(--text-muted)',
  Installer: 'var(--yellow)',
  Database: 'var(--text-secondary)',
};

function formatSizeMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function formatSizeGB(gb: number): string {
  return `${gb.toFixed(1)} GB`;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function DiskCleanupView() {
  const {
    categories, largeFiles, tempFiles, selectedDrive, selectedCategory, selectedTempCategories,
    loading, cleaning, cleanResult, largeFileSort, largeFileSortAsc,
    fetchAll, setSelectedDrive, selectCategory, toggleTempCategory, selectAllSafeTemp,
    cleanSelected, setLargeFileSort, clearCleanResult,
    getSortedLargeFiles, getSelectedTempSize,
  } = useDiskCleanupStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (cleanResult) {
      const t = setTimeout(clearCleanResult, 5000);
      return () => clearTimeout(t);
    }
  }, [cleanResult, clearCleanResult]);

  const sortedLarge = getSortedLargeFiles();
  const selectedSize = getSelectedTempSize();

  if (loading && categories.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Analyzing disk usage...
      </div>
    );
  }

  const totalUsed = categories.filter((c) => c.name !== 'Free Space').reduce((s, c) => s + c.sizeGB, 0);
  const totalSize = totalUsed + (categories.find((c) => c.name === 'Free Space')?.sizeGB ?? 0);

  const sortArrow = (field: string) => {
    if (largeFileSort !== field) return null;
    return largeFileSortAsc ? ' ▲' : ' ▼';
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Disk Cleanup</h2>
        <div className="flex items-center gap-3">
          <select value={selectedDrive} onChange={(e) => { setSelectedDrive(e.target.value); setTimeout(fetchAll, 0); }} className="input" style={{ width: 100 }}>
            <option value="C:">C:</option>
            <option value="D:">D:</option>
          </select>
          <HardDrive size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{totalUsed.toFixed(0)} GB / {totalSize.toFixed(0)} GB</span>
        </div>
      </div>

      {/* Clean result toast */}
      {cleanResult && (
        <div style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 13,
          background: 'rgba(63,185,80,0.12)', color: 'var(--green)',
          border: '1px solid var(--green)',
        }}>
          Freed {formatSizeMB(cleanResult.freedMB)} successfully
          {cleanResult.errors.length > 0 && (
            <span style={{ color: 'var(--yellow)', marginLeft: 8 }}>
              ({cleanResult.errors.length} skipped)
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
        {/* Left: Space Distribution + Large Files + Temp */}
        <div style={{ flex: selectedCategory ? 0.55 : 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, transition: 'flex 0.2s' }}>
          {/* Donut-like space distribution */}
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Space Distribution</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Visual bar chart as bars */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categories.map((cat) => {
                  const pct = totalSize > 0 ? (cat.sizeGB / totalSize) * 100 : 0;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => selectCategory(cat.items ? cat : null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                        borderRadius: 4, cursor: cat.items ? 'pointer' : 'default',
                        background: selectedCategory?.name === cat.name ? 'var(--bg-hover)' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{
                        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        background: cat.color,
                      }} />
                      <span style={{ flex: 1, fontSize: 12 }}>{cat.name}</span>
                      <span className="text-mono" style={{ fontSize: 12 }}>{formatSizeGB(cat.sizeGB)}</span>
                      <span className="text-muted" style={{ fontSize: 10, width: 40, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
              {/* Visual bar */}
              <div style={{ width: 180, display: 'flex', borderRadius: 4, overflow: 'hidden', height: 14, alignSelf: 'center' }}>
                {categories.map((cat) => {
                  const pct = totalSize > 0 ? (cat.sizeGB / totalSize) * 100 : 0;
                  return pct > 0 ? (
                    <div key={cat.name} style={{
                      width: `${pct}%`, height: '100%', background: cat.color,
                      minWidth: pct > 1 ? 2 : 0,
                    }} title={`${cat.name}: ${formatSizeGB(cat.sizeGB)}`} />
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Large Files */}
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Largest Files</div>
            <table style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th onClick={() => setLargeFileSort('name')} style={{ cursor: 'pointer' }}>Name{sortArrow('name')}</th>
                  <th onClick={() => setLargeFileSort('sizeMB')} style={{ cursor: 'pointer', width: 80 }}>Size{sortArrow('sizeMB')}</th>
                  <th style={{ width: 80 }}>Type</th>
                  <th style={{ width: 160 }}>Path</th>
                  <th onClick={() => setLargeFileSort('lastModified')} style={{ cursor: 'pointer', width: 80 }}>Modified{sortArrow('lastModified')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedLarge.map((file) => (
                  <tr key={file.path}>
                    <td className="truncate" style={{ maxWidth: 180 }} title={file.name}>{file.name}</td>
                    <td className="text-mono" style={{ color: file.sizeMB > 1000 ? 'var(--red)' : file.sizeMB > 500 ? 'var(--yellow)' : undefined }}>
                      {formatSizeMB(file.sizeMB)}
                    </td>
                    <td>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 600,
                        color: TYPE_COLORS[file.type] || 'var(--text-secondary)',
                        background: `${TYPE_COLORS[file.type] || 'var(--text-secondary)'}20`,
                      }}>
                        {file.type}
                      </span>
                    </td>
                    <td className="truncate text-mono" style={{ maxWidth: 150, fontSize: 10, color: 'var(--text-muted)' }}>{file.path}</td>
                    <td className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{relativeTime(file.lastModified)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Temp Files */}
          <div className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="card-title">Temporary Files</div>
              <button className="btn btn-sm btn-ghost" onClick={selectAllSafeTemp}>Select All Safe</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tempFiles.map((cat) => {
                const checked = selectedTempCategories.includes(cat.name);
                return (
                  <label
                    key={cat.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 'var(--radius)', cursor: 'pointer',
                      background: checked ? 'var(--bg-hover)' : 'transparent',
                      border: '1px solid var(--border-muted)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTempCategory(cat.name)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cat.description}</div>
                    </div>
                    <div className="text-mono" style={{ fontSize: 12, marginRight: 12 }}>{formatSizeMB(cat.sizeMB)}</div>
                    <div className="text-muted" style={{ fontSize: 10, marginRight: 8 }}>{cat.fileCount.toLocaleString()} files</div>
                    {cat.safeToDelete ? (
                      <Check size={14} color="var(--green)" />
                    ) : (
                      <AlertTriangle size={14} color="var(--yellow)" />
                    )}
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {selectedTempCategories.length > 0
                  ? `Will free ~${formatSizeMB(selectedSize)}`
                  : 'Select categories to clean'}
              </div>
              <button
                className="btn btn-primary"
                disabled={selectedTempCategories.length === 0 || cleaning}
                onClick={cleanSelected}
              >
                {cleaning ? (
                  <><Loader2 size={14} className="spin" /> Cleaning...</>
                ) : (
                  <><Trash2 size={14} /> Clean Selected</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Category detail panel */}
        {selectedCategory && selectedCategory.items && (
          <div className="card" style={{ width: 320, padding: 16, overflow: 'auto', flexShrink: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontWeight: 600 }}>{selectedCategory.name}</div>
              <button className="btn btn-sm btn-ghost" onClick={() => selectCategory(null)}>Close</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {selectedCategory.items.length} items &middot; {formatSizeGB(selectedCategory.sizeGB)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedCategory.items.map((item) => (
                <div key={item.path} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-muted)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }} className="truncate">{item.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-mono truncate" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.path}</span>
                    <span className="text-mono" style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{formatSizeMB(item.sizeMB)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
