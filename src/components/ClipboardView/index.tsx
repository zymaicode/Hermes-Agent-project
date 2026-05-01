import { useEffect } from 'react';
import { ClipboardList, FileText, Link, Paperclip, Pin, X, Search, Trash2, Circle } from 'lucide-react';
import { useClipboardStore } from '../../stores/clipboardStore';

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  text: FileText,
  link: Link,
  file: Paperclip,
  image: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  text: 'var(--text-secondary)',
  link: 'var(--accent)',
  file: 'var(--yellow)',
  image: 'var(--purple)',
};

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (sec < 60) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function ClipboardView() {
  const {
    entries, loading, searchQuery, typeFilter, expandedId,
    fetchHistory, setSearchQuery, setTypeFilter, expandEntry,
    removeEntry, togglePin, clearAll, getFilteredEntries, getStats,
  } = useClipboardStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = getFilteredEntries();
  const stats = getStats();
  const pinned = filtered.filter((e) => e.isPinned);
  const unpinned = filtered.filter((e) => !e.isPinned);

  if (loading && entries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading clipboard history...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Clipboard History</h2>
        <div className="flex items-center gap-2">
          <ClipboardList size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{stats.total} entries</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 mb-3">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Circle size={8} fill="var(--green)" color="var(--green)" />
          <span style={{ color: 'var(--text-secondary)' }}>Clipboard monitoring: <span style={{ color: 'var(--green)' }}>Active</span></span>
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            placeholder="Search clipboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input" style={{ width: 100 }}>
          <option value="all">All</option>
          <option value="text">Text</option>
          <option value="link">Links</option>
          <option value="file">Files</option>
        </select>
        <button className="btn btn-sm" onClick={clearAll} style={{ color: 'var(--red)' }}>
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      {/* Entries list */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pinned.length > 0 && (
          <>
            {pinned.map((entry) => {
              const Icon = TYPE_ICONS[entry.type] || FileText;
              const isExpanded = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="card"
                  style={{ padding: 10, cursor: 'pointer' }}
                  onClick={() => expandEntry(entry.id)}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: TYPE_COLORS[entry.type] || 'var(--text-secondary)', flexShrink: 0, display: 'flex' }}><Icon size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontSize: 13 }}>{entry.content}</div>
                      {isExpanded && entry.fullContent && (
                        <div style={{
                          marginTop: 6, padding: 8, borderRadius: 'var(--radius)',
                          background: 'var(--bg-primary)', fontSize: 12,
                          fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap',
                          color: 'var(--text-primary)', maxHeight: 200, overflow: 'auto',
                        }}>
                          {entry.fullContent}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-muted" style={{ fontSize: 10 }}>{formatTimestamp(entry.timestamp)}</span>
                        <span className="text-muted" style={{ fontSize: 10 }}>{entry.source}</span>
                        <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatSize(entry.size)}</span>
                      </div>
                    </div>
                    <Pin size={14} fill="var(--accent)" color="var(--accent)" style={{ flexShrink: 0 }} />
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {unpinned.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            )}
          </>
        )}

        {unpinned.map((entry) => {
          const Icon = TYPE_ICONS[entry.type] || FileText;
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              className="card"
              style={{ padding: 10, cursor: 'pointer' }}
              onClick={() => expandEntry(entry.id)}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: TYPE_COLORS[entry.type] || 'var(--text-secondary)', flexShrink: 0, display: 'flex' }}><Icon size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 13 }}>{entry.content}</div>
                  {isExpanded && entry.fullContent && (
                    <div style={{
                      marginTop: 6, padding: 8, borderRadius: 'var(--radius)',
                      background: 'var(--bg-primary)', fontSize: 12,
                      fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap',
                      color: 'var(--text-primary)', maxHeight: 200, overflow: 'auto',
                    }}>
                      {entry.fullContent}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-muted" style={{ fontSize: 10 }}>{formatTimestamp(entry.timestamp)}</span>
                    <span className="text-muted" style={{ fontSize: 10 }}>{entry.source}</span>
                    <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatSize(entry.size)}</span>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); togglePin(entry.id); }}
                  title={entry.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin size={14} style={{ color: entry.isPinned ? 'var(--accent)' : 'var(--text-muted)' }} />
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            No clipboard entries found
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div style={{
        marginTop: 12, padding: '8px 12px', borderRadius: 'var(--radius)',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)',
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 11,
        color: 'var(--text-secondary)',
      }}>
        <span>{stats.total} total</span>
        <span>{stats.text} text</span>
        <span>{stats.link} links</span>
        <span>{stats.file} files</span>
        <span style={{ marginLeft: 'auto' }}>Oldest: {stats.oldestMinutes}m ago</span>
      </div>
    </div>
  );
}
