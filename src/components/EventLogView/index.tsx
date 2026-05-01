import { useEffect, useCallback, useRef } from 'react';
import {
  ScrollText, Search, RefreshCw, Copy, ChevronDown,
  XCircle, AlertTriangle, Info, Skull,
} from 'lucide-react';
import { useEventLogStore } from '../../stores/eventLogStore';

const LOG_COLORS: Record<string, string> = {
  System: 'var(--blue)',
  Application: 'var(--green)',
  Security: 'var(--purple)',
  Setup: 'var(--orange)',
};

function levelIcon(level: string) {
  switch (level) {
    case 'critical': return <Skull size={12} style={{ color: 'var(--red)' }} />;
    case 'error': return <XCircle size={12} style={{ color: 'var(--red)' }} />;
    case 'warning': return <AlertTriangle size={12} style={{ color: 'var(--yellow)' }} />;
    case 'information': return <Info size={12} style={{ color: 'var(--blue)' }} />;
    default: return <Info size={12} style={{ color: 'var(--text-secondary)' }} />;
  }
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function EventLogView() {
  const events = useEventLogStore((s) => s.events);
  const logCounts = useEventLogStore((s) => s.logCounts);
  const loading = useEventLogStore((s) => s.loading);
  const logFilter = useEventLogStore((s) => s.logFilter);
  const levelFilter = useEventLogStore((s) => s.levelFilter);
  const searchQuery = useEventLogStore((s) => s.searchQuery);
  const expandedEvent = useEventLogStore((s) => s.expandedEvent);
  const autoRefresh = useEventLogStore((s) => s.autoRefresh);
  const fetchEvents = useEventLogStore((s) => s.fetchEvents);
  const fetchCounts = useEventLogStore((s) => s.fetchCounts);
  const setLogFilter = useEventLogStore((s) => s.setLogFilter);
  const toggleLevelFilter = useEventLogStore((s) => s.toggleLevelFilter);
  const setSearchQuery = useEventLogStore((s) => s.setSearchQuery);
  const expandEvent = useEventLogStore((s) => s.expandEvent);
  const collapseEvent = useEventLogStore((s) => s.collapseEvent);
  const setAutoRefresh = useEventLogStore((s) => s.setAutoRefresh);

  useEffect(() => { fetchEvents(); fetchCounts(); }, [fetchEvents, fetchCounts]);

  // Auto-refresh every 10s
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchEvents();
        fetchCounts();
      }, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchEvents, fetchCounts]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleSearchKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchEvents();
  }, [fetchEvents]);

  const logNames = ['System', 'Application', 'Security', 'Setup'];
  const totalCounts: Record<string, number> = { critical: 0, error: 0, warning: 0, information: 0 };
  for (const logName of logNames) {
    if (logCounts[logName]) {
      for (const lvl of Object.keys(totalCounts)) {
        totalCounts[lvl] += logCounts[logName][lvl] || 0;
      }
    }
  }

  if (loading && events.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading events...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Event Log Viewer</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2" style={{ fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh (10s)
          </label>
          <button className="btn btn-sm" onClick={() => { fetchEvents(); fetchCounts(); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row: summary cards per log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {logNames.map((logName) => {
          const counts = logCounts[logName] || { error: 0, warning: 0, information: 0 };
          return (
            <div
              key={logName}
              className="card"
              style={{ padding: 12, cursor: 'pointer', borderLeft: `3px solid ${LOG_COLORS[logName]}`, opacity: logFilter === logName ? 1 : 0.7 }}
              onClick={() => setLogFilter(logFilter === logName ? 'All Logs' : logName)}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{logName}</div>
              <div className="flex items-center gap-3" style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--red)' }}>{counts.error || 0} err</span>
                <span style={{ color: 'var(--yellow)' }}>{counts.warning || 0} warn</span>
                <span style={{ color: 'var(--blue)' }}>{counts.information || 0} info</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                {(counts.error || 0) + (counts.warning || 0) + (counts.information || 0)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} className="filter-select">
          <option value="All Logs">All Logs</option>
          {logNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="flex items-center gap-2">
          {['critical', 'error', 'warning', 'information'].map((lvl) => (
            <label key={lvl} className="flex items-center gap-1" style={{ fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={levelFilter.includes(lvl)} onChange={() => toggleLevelFilter(lvl)} />
              {levelIcon(lvl)} {lvl}
            </label>
          ))}
        </div>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ color: 'var(--text-secondary)', marginRight: 6 }} />
          <input
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchKey}
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
          />
        </div>
      </div>

      {/* Event list */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th style={{ width: 100 }}>Time</th>
              <th>Source</th>
              <th style={{ width: 70 }}>Event ID</th>
              <th>Message</th>
              <th style={{ width: 90 }}>Log</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr
                key={e.id}
                onClick={() => expandedEvent?.id === e.id ? collapseEvent() : expandEvent(e)}
                style={{ cursor: 'pointer' }}
              >
                <td>{levelIcon(e.level)}</td>
                <td className="text-mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{relativeTime(e.timeCreated)}</td>
                <td style={{ fontSize: 12 }}>{e.source}</td>
                <td className="text-mono" style={{ fontSize: 11 }}>{e.eventId}</td>
                <td style={{ fontSize: 12, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message}</td>
                <td>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: (LOG_COLORS[e.logName] || 'var(--bg-hover)') + '33', color: LOG_COLORS[e.logName] || 'var(--text-secondary)' }}>
                    {e.logName}
                  </span>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>No events match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {expandedEvent && (
        <div className="card" style={{ marginTop: 12, padding: 16, maxHeight: 350, overflow: 'auto' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {levelIcon(expandedEvent.level)}
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{expandedEvent.level}</h3>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: (LOG_COLORS[expandedEvent.logName] || 'var(--bg-hover)') + '33', color: LOG_COLORS[expandedEvent.logName] || 'var(--text-secondary)' }}>
                {expandedEvent.logName}
              </span>
            </div>
            <button className="btn-icon" onClick={() => {
              navigator.clipboard.writeText(expandedEvent.message);
            }} style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              <Copy size={14} /> Copy
            </button>
          </div>

          <div style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{expandedEvent.message}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', fontSize: 11, marginBottom: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Source:</span> {expandedEvent.source}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Event ID:</span> <span className="text-mono">{expandedEvent.eventId}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Log:</span> {expandedEvent.logName}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>User:</span> {expandedEvent.user}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Computer:</span> {expandedEvent.computer}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Task Category:</span> {expandedEvent.taskCategory}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Time:</span> <span className="text-mono">{new Date(expandedEvent.timeCreated).toLocaleString()}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Relative:</span> {relativeTime(expandedEvent.timeCreated)}</div>
          </div>

          {Object.keys(expandedEvent.details).length > 0 && (
            <details open style={{ marginBottom: 12 }}>
              <summary style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>Event Details</summary>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', fontSize: 11 }}>
                {Object.entries(expandedEvent.details).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}:</span> <span className="text-mono">{v}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          <details>
            <summary style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>Raw XML</summary>
            <pre className="text-mono" style={{ fontSize: 10, background: 'var(--bg-hover)', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap' }}>
              {expandedEvent.xml}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
