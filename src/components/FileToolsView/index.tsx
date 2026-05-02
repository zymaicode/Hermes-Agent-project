import { useEffect, useState, useMemo } from 'react';
import {
  Search, Copy, Lock, FileEdit, HardDrive, Trash2, Loader2,
  AlertTriangle, CheckCircle, XCircle, RotateCcw,
} from 'lucide-react';
import { useCleanupStore } from '../../stores/cleanupStore';
import { useFileToolsStore } from '../../stores/fileToolsStore';
import type { RenameRule } from '../../../electron/filetools/batchRename';
import './FileTools.css';

type TabId = 'largeFiles' | 'duplicates' | 'fileLocks' | 'batchRename';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'largeFiles', label: 'Large Files', icon: HardDrive },
  { id: 'duplicates', label: 'Duplicates', icon: Copy },
  { id: 'fileLocks', label: 'File Locks', icon: Lock },
  { id: 'batchRename', label: 'Batch Rename', icon: FileEdit },
];

function formatFileSize(kb: number): string {
  if (kb >= 1_048_576) return `${(kb / 1_048_576).toFixed(2)} GB`;
  if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
  return `${kb.toFixed(0)} KB`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

/* ───────── Tab 1: Large Files ───────── */
function LargeFilesTab() {
  const {
    largeFiles, largeFilesLoading, largeFilesProgress,
    largeFilesMinSizeMB, largeFileFilter,
    scanLargeFiles, setLargeFileMinSize, setLargeFileFilter,
  } = useCleanupStore();

  const filtered = useMemo(() => {
    if (!largeFileFilter) return largeFiles;
    return largeFiles.filter(f => f.name.toLowerCase().includes(largeFileFilter.toLowerCase()) || f.extension.toLowerCase().includes(largeFileFilter.toLowerCase()));
  }, [largeFiles, largeFileFilter]);

  const maxSize = useMemo(() => {
    if (filtered.length === 0) return 1;
    return Math.max(...filtered.map(f => f.size));
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Min size:</span>
            <select
              value={largeFilesMinSizeMB}
              onChange={(e) => setLargeFileMinSize(Number(e.target.value))}
              className="input"
              style={{ width: 110 }}
            >
              <option value={50}>{'> 50 MB'}</option>
              <option value={100}>{'> 100 MB'}</option>
              <option value={500}>{'> 500 MB'}</option>
              <option value={1024}>{'> 1 GB'}</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Filter:</span>
            <input
              type="text"
              value={largeFileFilter}
              onChange={(e) => setLargeFileFilter(e.target.value)}
              placeholder="name or ext..."
              className="input"
              style={{ width: 140 }}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={largeFilesLoading}
            onClick={() => scanLargeFiles()}
          >
            {largeFilesLoading ? <><Loader2 size={14} className="spin" /> Scanning...</> : <><HardDrive size={14} /> Scan</>}
          </button>
        </div>
        {largeFilesLoading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Scanning...</span>
              <span>{largeFilesProgress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${largeFilesProgress}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="card" style={{ padding: 16, overflow: 'auto' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          {filtered.length} files found
          {filtered.length > 0 && ` (${formatBytes(filtered.reduce((s, f) => s + f.size, 0))} total)`}
        </div>
        <table className="ft-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 70 }}>Type</th>
              <th style={{ width: 80 }}>Size</th>
              <th style={{ width: 200 }}>Path</th>
              <th style={{ width: 120 }}>Modified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((file) => (
              <tr key={file.path}>
                <td className="truncate" style={{ maxWidth: 180 }} title={file.name}>{file.name}</td>
                <td>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 8,
                    color: 'var(--text-secondary)', background: 'var(--bg-hover)',
                  }}>{file.type}</span>
                </td>
                <td>
                  <div className="ft-size-bar">
                    <div className="ft-size-fill" style={{
                      width: `${Math.min(100, (file.size / maxSize) * 100)}%`,
                      background: file.size > 1_073_741_824 ? 'var(--red)' : file.size > 524_288_000 ? 'var(--yellow)' : 'var(--accent)',
                      maxWidth: 60,
                    }} />
                    <span style={{ fontSize: 11, color: file.size > 1_073_741_824 ? 'var(--red)' : undefined }}>
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </td>
                <td className="truncate" style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 200 }} title={file.path}>{file.path}</td>
                <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{file.modified}</td>
              </tr>
            ))}
            {filtered.length === 0 && !largeFilesLoading && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Click "Scan" to find large files</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────── Tab 2: Duplicates ───────── */
function DuplicatesTab() {
  const {
    duplicateGroups, duplicatesLoading, duplicatesProgress,
    expandedGroups, scanDuplicates, toggleExpandGroup,
  } = useCleanupStore();

  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());

  const totalWaste = useMemo(() => {
    return duplicateGroups.reduce((s, g) => s + g.size * (g.count - 1), 0);
  }, [duplicateGroups]);

  const totalDupFiles = duplicateGroups.reduce((s, g) => s + g.count - 1, 0);

  const toggleFile = (path: string) => {
    setSelectedForDelete(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleGroup = (paths: string[]) => {
    const allSelected = paths.every(p => selectedForDelete.has(p));
    setSelectedForDelete(prev => {
      const next = new Set(prev);
      for (const p of paths) {
        if (allSelected) next.delete(p);
        else next.add(p);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Duplicate File Finder</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Scan for duplicate files by content hash
            </div>
          </div>
          <button className="btn btn-primary btn-sm" disabled={duplicatesLoading} onClick={scanDuplicates}>
            {duplicatesLoading ? <><Loader2 size={14} className="spin" /> Scanning...</> : <><Copy size={14} /> Scan</>}
          </button>
        </div>
        {duplicatesLoading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Scanning...</span>
              <span style={{ color: 'var(--text-secondary)' }}>{duplicatesProgress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${duplicatesProgress}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
            </div>
          </div>
        )}
      </div>

      {duplicateGroups.length > 0 && (
        <div style={{
          display: 'flex', gap: 24, padding: '12px 16px', borderRadius: 'var(--radius)',
          background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>{duplicateGroups.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Groups</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--yellow)' }}>{totalDupFiles}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Duplicates</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{formatBytes(totalWaste)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wasted</div>
          </div>
        </div>
      )}

      {duplicateGroups.map((group) => {
        const isExpanded = expandedGroups.includes(group.hash);
        const groupPaths = group.files.map(f => f.path);
        const allSelected = groupPaths.every(p => selectedForDelete.has(p));
        return (
          <div key={group.hash} className="card" style={{ overflow: 'hidden' }}>
            <div className="ft-dup-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleGroup(groupPaths.slice(1))}
                  title="Select all duplicates (keep original)"
                />
                <button
                  onClick={() => toggleExpandGroup(group.hash)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}
                >
                  {group.files[0]?.name ?? 'Unknown'}
                </button>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {group.count} copies · {formatBytes(group.size)} each
              </span>
            </div>
            {isExpanded && (
              <div className="ft-dup-files">
                {group.files.map((file, idx) => (
                  <div key={file.path} className="ft-dup-file">
                    {idx > 0 ? (
                      <input
                        type="checkbox"
                        checked={selectedForDelete.has(file.path)}
                        onChange={() => toggleFile(file.path)}
                      />
                    ) : (
                      <span style={{ width: 16 }} />
                    )}
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: idx === 0 ? 'var(--green)' : 'var(--red)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="truncate" style={{ maxWidth: 400, fontSize: 12 }} title={file.path}>{file.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }} className="truncate">{file.path}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 8,
                      color: idx === 0 ? 'var(--green)' : 'var(--yellow)',
                      background: idx === 0 ? 'rgba(63,185,80,0.12)' : 'rgba(210,153,34,0.12)',
                      flexShrink: 0,
                    }}>
                      {idx === 0 ? 'Original' : 'Duplicate'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {duplicateGroups.length === 0 && !duplicatesLoading && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Copy size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Click "Scan" to find duplicate files</div>
        </div>
      )}
    </div>
  );
}

/* ───────── Tab 3: File Locks ───────── */
function FileLocksTab() {
  const { lockedFiles, lockLoading, loadLockedFiles, unlockFile, unlockSelected } = useFileToolsStore();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ success?: boolean; message: string } | null>(null);

  useEffect(() => {
    loadLockedFiles();
  }, [loadLockedFiles]);

  const toggleSelect = (path: string) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleUnlock = async (filePath: string) => {
    const r = await unlockFile(filePath);
    setResult(r);
    setTimeout(() => setResult(null), 3000);
  };

  const handleUnlockSelected = async () => {
    const r = await unlockSelected(Array.from(selectedPaths));
    setResult({ success: r.unlocked > 0, message: `Unlocked: ${r.unlocked}, Failed: ${r.failed}` });
    setSelectedPaths(new Set());
    setTimeout(() => setResult(null), 3000);
  };

  if (lockLoading) {
    return <div className="ft-empty"><Loader2 size={24} className="spin" /> Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Locked File Manager</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              View and release file locks held by processes
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={loadLockedFiles}>
              <RotateCcw size={14} /> Refresh
            </button>
            <button
              className="btn btn-sm btn-primary"
              disabled={selectedPaths.size === 0}
              onClick={handleUnlockSelected}
            >
              <Lock size={14} /> Unlock Selected ({selectedPaths.size})
            </button>
          </div>
        </div>
        {result && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 4, fontSize: 12,
            background: result.success ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
            color: result.success ? 'var(--green)' : 'var(--red)',
          }}>
            {result.success ? <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} /> : <XCircle size={14} style={{ display: 'inline', marginRight: 4 }} />}
            {result.message}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="ft-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th>File Name</th>
              <th>Size</th>
              <th>Locked By</th>
              <th>PID</th>
              <th>Locked Since</th>
              <th style={{ width: 100 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lockedFiles.map((file) => {
              const isCritical = ['pagefile.sys', 'SAM', 'SYSTEM', 'MsMpEng.exe'].includes(file.name);
              return (
                <tr key={file.path}>
                  <td>
                    {isCritical ? (
                      <AlertTriangle size={14} className="ft-warning-icon" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedPaths.has(file.path)}
                        onChange={() => toggleSelect(file.path)}
                        disabled={isCritical}
                      />
                    )}
                  </td>
                  <td className="truncate" style={{ maxWidth: 300 }} title={file.path}>{file.name}</td>
                  <td className="text-mono" style={{ fontSize: 11 }}>{formatFileSize(file.sizeKB)}</td>
                  <td><span style={{ fontSize: 12 }}>{file.lockedBy}</span></td>
                  <td className="text-mono" style={{ fontSize: 11 }}>{file.pid}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(file.lockedSince).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      disabled={isCritical}
                      onClick={() => handleUnlock(file.path)}
                      style={{ fontSize: 11 }}
                    >
                      {isCritical ? 'Protected' : 'Unlock'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {lockedFiles.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No locked files found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────── Tab 4: Batch Rename ───────── */
function BatchRenameTab() {
  const {
    renameFiles, renamePreview, renameLoading,
    loadRenameFiles, toggleRenameFile, toggleAllRenameFiles,
    previewRename, applyRename,
  } = useFileToolsStore();

  const [rule, setRule] = useState<RenameRule>({ type: 'prefix', value: '' });
  const [result, setResult] = useState<{ renamed: number; failed: number; errors: string[] } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadRenameFiles();
  }, [loadRenameFiles]);

  const selectedCount = renameFiles.filter(f => f.selected).length;

  const handlePreview = () => {
    if (!rule.value && rule.type !== 'case') return;
    previewRename(rule);
  };

  const handleApply = async () => {
    setApplying(true);
    const r = await applyRename(rule);
    setResult(r);
    setApplying(false);
    setTimeout(() => setResult(null), 5000);
  };

  const allSelected = renameFiles.length > 0 && renameFiles.every(f => f.selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* File list */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Batch File Rename</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {renameFiles.length} files loaded · {selectedCount} selected
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={allSelected} onChange={() => toggleAllRenameFiles(!allSelected)} />
            Select All
          </label>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--card-border)', borderRadius: 4 }}>
          {renameFiles.map((f) => (
            <div
              key={f.fullPath}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                borderBottom: '1px solid var(--card-border)', fontSize: 12,
                cursor: 'pointer',
              }}
              onClick={() => toggleRenameFile(f.fullPath)}
            >
              <input type="checkbox" checked={f.selected} readOnly />
              <span style={{ flex: 1 }} className="truncate">{f.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 50 }}>{f.extension}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 70, textAlign: 'right' }}>{formatFileSize(f.sizeKB)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rename rules */}
      <div className="card" style={{ padding: 16 }}>
        <div className="ft-rename-controls">
          <select
            className="ft-rename-select"
            value={rule.type}
            onChange={(e) => setRule({ ...rule, type: e.target.value as RenameRule['type'] })}
          >
            <option value="prefix">Add Prefix</option>
            <option value="suffix">Add Suffix</option>
            <option value="replace">Find & Replace</option>
            <option value="number">Numbered</option>
            <option value="case">Change Case</option>
          </select>

          {rule.type !== 'case' && (
            <input
              className="ft-rename-input"
              type="text"
              placeholder={rule.type === 'number' ? 'Base name (e.g. "photo")' : rule.type === 'replace' ? 'Search text' : 'Enter text...'}
              value={rule.value}
              onChange={(e) => setRule({ ...rule, value: e.target.value })}
            />
          )}

          {rule.type === 'replace' && (
            <input
              className="ft-rename-input"
              type="text"
              placeholder="Replace with..."
              value={rule.replaceWith ?? ''}
              onChange={(e) => setRule({ ...rule, replaceWith: e.target.value })}
            />
          )}

          {rule.type === 'number' && (
            <>
              <input
                className="ft-rename-input"
                type="number"
                placeholder="Start"
                value={rule.numberStart ?? 1}
                onChange={(e) => setRule({ ...rule, numberStart: parseInt(e.target.value) || 1 })}
                style={{ width: 70 }}
              />
              <input
                className="ft-rename-input"
                type="number"
                placeholder="Digits"
                value={rule.numberDigits ?? 3}
                onChange={(e) => setRule({ ...rule, numberDigits: parseInt(e.target.value) || 3 })}
                style={{ width: 70 }}
              />
            </>
          )}

          {rule.type === 'case' && (
            <select
              className="ft-rename-select"
              value={rule.caseTarget}
              onChange={(e) => setRule({ ...rule, caseTarget: e.target.value as 'upper' | 'lower' | 'title' })}
            >
              <option value="lower">Lowercase</option>
              <option value="upper">UPPERCASE</option>
              <option value="title">Title Case</option>
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={handlePreview} disabled={!rule.value && rule.type !== 'case'}>
            <Search size={14} /> Preview
          </button>
          <button
            className="btn btn-sm"
            onClick={handleApply}
            disabled={renamePreview.length === 0 || applying || renamePreview.every(p => !p.valid)}
          >
            {applying ? <><Loader2 size={14} className="spin" /> Applying...</> : <><FileEdit size={14} /> Apply Rename</>}
          </button>
        </div>

        {/* Result message */}
        {result && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 4, fontSize: 12,
            background: result.failed === 0 ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
            color: result.failed === 0 ? 'var(--green)' : 'var(--red)',
          }}>
            Renamed: {result.renamed}, Failed: {result.failed}
            {result.errors.length > 0 && <div style={{ fontSize: 11, marginTop: 4 }}>{result.errors.join(', ')}</div>}
          </div>
        )}

        {/* Preview */}
        {renamePreview.length > 0 && (
          <div className="ft-preview" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Preview ({renamePreview.filter(p => p.valid).length} valid, {renamePreview.filter(p => !p.valid).length} conflicts)
            </div>
            {renamePreview.map((p, i) => (
              <div key={i} className="ft-preview-row">
                <span style={{ flex: 1 }} className="truncate">{p.original}</span>
                <span className="ft-preview-arrow">→</span>
                <span style={{ flex: 1, fontWeight: p.valid ? 500 : undefined }} className="truncate">{p.newName}</span>
                {p.valid ? (
                  <span className="ft-preview-valid"><CheckCircle size={12} /> Valid</span>
                ) : (
                  <span className="ft-preview-error"><XCircle size={12} /> {p.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── Main View ───────── */
export default function FileToolsView() {
  const [activeTab, setActiveTab] = useState<TabId>('largeFiles');

  return (
    <div className="filetools-page">
      <div className="filetools-header">
        <div className="filetools-title">File Tools</div>
      </div>

      <div className="filetools-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`filetools-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'largeFiles' && <LargeFilesTab />}
      {activeTab === 'duplicates' && <DuplicatesTab />}
      {activeTab === 'fileLocks' && <FileLocksTab />}
      {activeTab === 'batchRename' && <BatchRenameTab />}
    </div>
  );
}
