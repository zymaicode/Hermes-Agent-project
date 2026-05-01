import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  Search,
  BrainCircuit,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import type { AlertSeverity, AlertType } from '../../utils/types';

const severityConfig: Record<AlertSeverity, { color: string; bg: string; label: string }> = {
  info: { color: 'var(--accent)', bg: 'rgba(88, 166, 255, 0.12)', label: 'Info' },
  warning: { color: 'var(--yellow)', bg: 'rgba(210, 153, 34, 0.12)', label: 'Warning' },
  critical: { color: 'var(--red)', bg: 'rgba(248, 81, 73, 0.12)', label: 'Critical' },
};

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AlertHistoryView() {
  const alertHistory = useAlertStore((s) => s.alertHistory);
  const fetchAlertHistory = useAlertStore((s) => s.fetchAlertHistory);
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AlertType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchAlertHistory(200);
  }, [fetchAlertHistory]);

  let filtered = alertHistory.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

  filtered = [...filtered].sort((a, b) => {
    if (sortField === 'severity') {
      const diff = severityOrder[a.severity] - severityOrder[b.severity];
      return sortAsc ? -diff : diff;
    }
    const diff = a.timestamp - b.timestamp;
    return sortAsc ? -diff : diff;
  });

  const criticalCount = alertHistory.filter((a) => a.severity === 'critical').length;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>Alert History</h2>
          <p className="view-subtitle">
            {alertHistory.length} total alerts
            {criticalCount > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 8 }}>{criticalCount} critical</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Severity filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                background: severityFilter === sev ? 'var(--accent-muted)' : 'transparent',
                color: severityFilter === sev ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: severityFilter === sev ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {sev === 'all' ? 'All' : sev}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'local_rule', 'ai_analysis'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                background: typeFilter === type ? 'var(--accent-muted)' : 'transparent',
                color: typeFilter === type ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: typeFilter === type ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {type === 'ai_analysis' && <BrainCircuit size={12} />}
              {type === 'all' ? 'All Types' : type === 'local_rule' ? 'Local Rule' : 'AI Analysis'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => {
            if (sortField === 'timestamp') setSortAsc(!sortAsc);
            else {
              setSortField('timestamp');
              setSortAsc(false);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
            background: sortField === 'timestamp' ? 'var(--accent-muted)' : 'transparent',
            color: sortField === 'timestamp' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <ArrowUpDown size={12} />
          Date {sortField === 'timestamp' ? (sortAsc ? '↑' : '↓') : ''}
        </button>
        <button
          onClick={() => {
            if (sortField === 'severity') setSortAsc(!sortAsc);
            else {
              setSortField('severity');
              setSortAsc(false);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
            background: sortField === 'severity' ? 'var(--accent-muted)' : 'transparent',
            color: sortField === 'severity' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Severity {sortField === 'severity' ? (sortAsc ? '↑' : '↓') : ''}
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Filter size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ color: 'var(--text-secondary)' }}>No alerts match your filters</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflow: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <th style={thStyle}>Severity</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Message</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert) => {
                  const sev = severityConfig[alert.severity];
                  return (
                    <tr
                      key={alert.id}
                      style={{
                        borderBottom: '1px solid var(--border-muted)',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: sev.bg,
                            color: sev.color,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {alert.severity === 'critical' && <AlertCircle size={12} />}
                          {alert.severity === 'warning' && <AlertTriangle size={12} />}
                          {alert.severity === 'info' && <Info size={12} />}
                          {sev.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background:
                              alert.type === 'ai_analysis'
                                ? 'rgba(163, 113, 247, 0.1)'
                                : 'rgba(139, 148, 158, 0.1)',
                            color: alert.type === 'ai_analysis' ? 'var(--purple)' : 'var(--text-secondary)',
                            fontSize: 11,
                          }}
                        >
                          {alert.type === 'ai_analysis' && <BrainCircuit size={11} />}
                          {alert.type === 'local_rule' ? 'Local Rule' : 'AI Analysis'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {alert.title}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.message}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(alert.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border-muted)',
};
