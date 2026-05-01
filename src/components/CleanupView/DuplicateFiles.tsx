import { Loader2, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useCleanupStore } from '../../stores/cleanupStore';

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function DuplicateFiles() {
  const {
    duplicateGroups, duplicatesLoading, duplicatesProgress,
    expandedGroups,
    scanDuplicates, toggleExpandGroup, getDuplicateTotalWaste,
  } = useCleanupStore();

  const totalWaste = getDuplicateTotalWaste();
  const totalDupFiles = duplicateGroups.reduce((s, g) => s + g.count - 1, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Duplicate File Scanner</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Scans selected paths for duplicate files by content hash (SHA-256)
            </div>
          </div>
          <button
            className="btn btn-primary"
            disabled={duplicatesLoading}
            onClick={scanDuplicates}
          >
            {duplicatesLoading ? <><Loader2 size={14} className="spin" /> Scanning...</> : <><Copy size={14} /> Scan for Duplicates</>}
          </button>
        </div>

        {/* Progress */}
        {duplicatesLoading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Scanning for duplicates...</span>
              <span>{duplicatesProgress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${duplicatesProgress}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {duplicateGroups.length > 0 && (
        <div style={{
          display: 'flex', gap: 24, padding: '12px 16px', borderRadius: 'var(--radius)',
          background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>{duplicateGroups.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Duplicate Groups</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--yellow)' }}>{totalDupFiles}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Duplicate Files</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{formatBytes(totalWaste)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wasted Space</div>
          </div>
        </div>
      )}

      {/* Groups */}
      {duplicateGroups.map((group) => {
        const isExpanded = expandedGroups.includes(group.hash);
        const wasteSize = group.size * (group.count - 1);
        return (
          <div key={group.hash} className="card" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => toggleExpandGroup(group.hash)}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--text-primary)',
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{group.files[0]?.name ?? 'Unknown'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {group.count} copies &middot; {formatBytes(group.size)} each &middot; {formatBytes(wasteSize)} wasted
                </div>
              </div>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                color: 'var(--red)', background: 'rgba(248,81,73,0.12)',
              }}>
                {group.count - 1}x duplicate
              </span>
            </button>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border-muted)', padding: '8px 16px 12px' }}>
                {group.files.map((file, idx) => (
                  <div
                    key={file.path}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                      borderRadius: 4, fontSize: 12,
                      background: idx === 0 ? 'rgba(63,185,80,0.06)' : 'rgba(248,81,73,0.06)',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: idx === 0 ? 'var(--green)' : 'var(--red)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="truncate" style={{ maxWidth: 400 }} title={file.path}>{file.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }} className="truncate" title={file.path}>{file.path}</div>
                    </div>
                    <div className="text-mono" style={{ fontSize: 11, flexShrink: 0, width: 130, textAlign: 'right' }}>
                      {file.modified}
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
          <div>Click "Scan for Duplicates" to find duplicate files</div>
        </div>
      )}
    </div>
  );
}
