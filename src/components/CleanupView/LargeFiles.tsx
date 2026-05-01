import { Loader2, HardDrive } from 'lucide-react';
import { useCleanupStore } from '../../stores/cleanupStore';

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

const MIN_SIZE_OPTIONS = [
  { value: 50, label: '> 50 MB' },
  { value: 100, label: '> 100 MB' },
  { value: 500, label: '> 500 MB' },
  { value: 1024, label: '> 1 GB' },
];

const DRIVES = ['C:', 'D:', 'All Drives'];

export default function LargeFiles() {
  const {
    largeFiles, largeFilesLoading, largeFilesProgress, largeFilesCurrent,
    largeFilesMinSizeMB, largeFilesScanPath,
    largeFileSort, largeFileSortAsc, largeFileFilter,
    scanLargeFiles, setLargeFileMinSize, setLargeFileScanPath,
    setLargeFileSort, setLargeFileFilter, getFilteredLargeFiles,
  } = useCleanupStore();

  const filtered = getFilteredLargeFiles();

  const sortArrow = (field: string) => {
    if (largeFileSort !== field) return null;
    return largeFileSortAsc ? ' ▲' : ' ▼';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={largeFilesScanPath}
              onChange={(e) => setLargeFileScanPath(e.target.value)}
              className="input"
              style={{ width: 120 }}
            >
              {DRIVES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Min size:</span>
            <select
              value={largeFilesMinSizeMB}
              onChange={(e) => setLargeFileMinSize(Number(e.target.value))}
              className="input"
              style={{ width: 110 }}
            >
              {MIN_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Filter ext:</span>
            <input
              type="text"
              value={largeFileFilter}
              onChange={(e) => setLargeFileFilter(e.target.value)}
              placeholder="e.g. .iso, .mp4"
              className="input"
              style={{ width: 130 }}
            />
            {largeFileFilter && (
              <button className="btn btn-sm btn-ghost" onClick={() => setLargeFileFilter('')}>Clear</button>
            )}
          </div>

          <button
            className="btn btn-primary btn-sm"
            disabled={largeFilesLoading}
            onClick={scanLargeFiles}
          >
            {largeFilesLoading ? <><Loader2 size={14} className="spin" /> Scanning...</> : <><HardDrive size={14} /> Scan</>}
          </button>
        </div>

        {/* Progress */}
        {largeFilesLoading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Scanning files...</span>
              <span>{largeFilesProgress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${largeFilesProgress}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
            </div>
            {largeFilesCurrent && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }} className="truncate">{largeFilesCurrent}</div>
            )}
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="card" style={{ padding: 16, overflow: 'auto' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          {filtered.length} files found
          {filtered.length > 0 && ` (${formatBytes(filtered.reduce((s, f) => s + f.size, 0))} total)`}
        </div>
        <table style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th onClick={() => setLargeFileSort('name')} style={{ cursor: 'pointer' }}>Name{sortArrow('name')}</th>
              <th style={{ width: 80 }}>Type</th>
              <th onClick={() => setLargeFileSort('extension')} style={{ cursor: 'pointer', width: 70 }}>Ext{sortArrow('extension')}</th>
              <th onClick={() => setLargeFileSort('size')} style={{ cursor: 'pointer', width: 90 }}>Size{sortArrow('size')}</th>
              <th onClick={() => setLargeFileSort('path')} style={{ cursor: 'pointer', width: 220 }}>Path{sortArrow('path')}</th>
              <th onClick={() => setLargeFileSort('modified')} style={{ cursor: 'pointer', width: 130 }}>Modified{sortArrow('modified')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((file) => (
              <tr key={file.path}>
                <td className="truncate" style={{ maxWidth: 200 }} title={file.name}>{file.name}</td>
                <td>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 600,
                    color: colorForType(file.type), background: `${colorForType(file.type)}20`,
                  }}>
                    {file.type}
                  </span>
                </td>
                <td className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{file.extension}</td>
                <td className="text-mono" style={{ color: file.size > 1_073_741_824 ? 'var(--red)' : file.size > 524_288_000 ? 'var(--yellow)' : undefined }}>
                  {formatBytes(file.size)}
                </td>
                <td className="truncate text-mono" style={{ maxWidth: 200, fontSize: 10, color: 'var(--text-muted)' }} title={file.path}>{file.path}</td>
                <td className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{file.modified}</td>
              </tr>
            ))}
            {filtered.length === 0 && !largeFilesLoading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No files found matching criteria</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function colorForType(type: string): string {
  const map: Record<string, string> = {
    Video: 'var(--accent)',
    ISO: 'var(--yellow)',
    'VM Disk': 'var(--red)',
    Archive: 'var(--orange)',
    Model: 'var(--purple)',
    Data: 'var(--green)',
    Installer: 'var(--yellow)',
    Design: 'var(--purple)',
    Audio: 'var(--accent)',
    Database: 'var(--text-secondary)',
    Project: 'var(--text-secondary)',
    Package: 'var(--text-secondary)',
  };
  return map[type] || 'var(--text-secondary)';
}
