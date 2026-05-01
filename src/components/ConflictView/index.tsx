import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, FileWarning, Zap, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useConflictStore } from '../../stores/conflictStore';
import type { ConflictItem, ConflictType, ConflictSeverity } from '../../utils/types';

const typeTabs: { key: ConflictType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'install_conflict', label: 'Install' },
  { key: 'residual_files', label: 'Residual' },
  { key: 'residual_registry', label: 'Registry' },
  { key: 'process_conflict', label: 'Process' },
];

const severityConfig: Record<ConflictSeverity, { color: string; bg: string; label: string }> = {
  high: { color: 'var(--red)', bg: 'rgba(248, 81, 73, 0.12)', label: 'High' },
  medium: { color: 'var(--yellow)', bg: 'rgba(210, 153, 34, 0.12)', label: 'Medium' },
  low: { color: 'var(--text-secondary)', bg: 'rgba(139, 148, 158, 0.1)', label: 'Low' },
};

const typeConfig: Record<ConflictType, { icon: React.ComponentType<{ size?: number }>; label: string }> = {
  install_conflict: { icon: Shield, label: 'Install Conflict' },
  residual_files: { icon: FileWarning, label: 'Residual Files' },
  residual_registry: { icon: FileWarning, label: 'Residual Registry' },
  process_conflict: { icon: Zap, label: 'Process Conflict' },
};

function ConflictCard({ item, onDismiss }: { item: ConflictItem; onDismiss: () => void }) {
  const sev = severityConfig[item.severity];
  const type = typeConfig[item.type];
  const TypeIcon = type.icon;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius)',
              background: sev.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: sev.color,
            }}
          >
            <TypeIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: sev.color,
                  background: sev.bg,
                  padding: '1px 8px',
                  borderRadius: 10,
                }}
              >
                {sev.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {type.label}
              </span>
            </div>
          </div>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={onDismiss}
          title="Dismiss"
        >
          <EyeOff size={14} />
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        {item.description}
      </p>

      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Details
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {item.details.map((d, i) => (
            <li key={i} style={{ marginBottom: 2 }}>{d}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          borderLeft: `3px solid var(--accent)`,
          padding: '8px 12px',
          background: 'var(--accent-muted)',
          borderRadius: '0 var(--radius) var(--radius) 0',
          fontSize: 12,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Resolution: </span>
        {item.resolution}
      </div>
    </div>
  );
}

export default function ConflictView() {
  const { report, loading, scanning, scanConflicts, dismissConflict } = useConflictStore();
  const [activeTab, setActiveTab] = useState<ConflictType | 'all'>('all');

  useEffect(() => {
    scanConflicts();
  }, [scanConflicts]);

  const filtered =
    activeTab === 'all'
      ? report?.conflicts ?? []
      : (report?.conflicts ?? []).filter((c) => c.type === activeTab);

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={22} style={{ color: 'var(--yellow)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Conflict Detection</h2>
        </div>
        <button
          className="btn btn-primary"
          onClick={scanConflicts}
          disabled={scanning}
          style={{ gap: 6 }}
        >
          <RefreshCw size={14} style={scanning ? { animation: 'spin 1s linear infinite' } : undefined} />
          {scanning ? 'Scanning...' : 'Rescan'}
        </button>
      </div>

      {/* Summary cards */}
      {report && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value">{report.summary.total}</div>
            <div className="stat-label">Total Conflicts</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{report.summary.high}</div>
            <div className="stat-label">High Severity</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{report.summary.medium}</div>
            <div className="stat-label">Medium Severity</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{report.summary.low}</div>
            <div className="stat-label">Low Severity</div>
          </div>
        </div>
      )}

      {/* Type tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conflict list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {scanning && !report ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>Scanning for conflicts...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <CheckCircle size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>
              {activeTab === 'all'
                ? 'No conflicts detected.'
                : `No ${typeTabs.find((t) => t.key === activeTab)?.label} conflicts.`}
            </div>
          </div>
        ) : (
          filtered.map((item) => (
            <ConflictCard
              key={item.id}
              item={item}
              onDismiss={() => dismissConflict(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
