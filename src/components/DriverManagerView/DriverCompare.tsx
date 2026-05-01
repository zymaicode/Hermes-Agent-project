import { useState } from 'react';
import { GitCompare, RefreshCw } from 'lucide-react';
import { useDriverManagerStore } from '../../stores/driverManagerStore';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  same: { label: '相同', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  newer: { label: '可更新', color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)' },
  older: { label: '较旧', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
  missing_in_backup: { label: '不在备份中', color: 'var(--text-muted)', bg: 'rgba(136,136,136,0.12)' },
  new_in_backup: { label: '新增', color: 'var(--yellow)', bg: 'rgba(234,179,8,0.12)' },
};

export default function DriverCompare() {
  const backups = useDriverManagerStore((s) => s.backups);
  const diffResult = useDriverManagerStore((s) => s.diffResult);
  const diffLoading = useDriverManagerStore((s) => s.diffLoading);
  const getVersionDiff = useDriverManagerStore((s) => s.getVersionDiff);

  const [selectedBackupId, setSelectedBackupId] = useState('');

  const handleCompare = () => {
    if (selectedBackupId) getVersionDiff(selectedBackupId);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select
          value={selectedBackupId}
          onChange={(e) => setSelectedBackupId(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
            minWidth: 280,
          }}
        >
          <option value="">选择备份进行对比...</option>
          {backups.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({new Date(b.date).toLocaleDateString('zh-CN')}, {b.driverCount}个驱动)
            </option>
          ))}
        </select>

        <button
          onClick={handleCompare}
          disabled={!selectedBackupId || diffLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: selectedBackupId ? 'var(--accent)' : 'var(--bg-hover)',
            border: `1px solid ${selectedBackupId ? 'var(--accent)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius)',
            color: selectedBackupId ? '#fff' : 'var(--text-muted)',
            cursor: selectedBackupId ? 'pointer' : 'not-allowed',
            fontSize: 12,
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
        >
          <GitCompare size={14} />
          开始对比
        </button>

        {diffResult && (
          <button
            onClick={handleCompare}
            disabled={!selectedBackupId || diffLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
              opacity: !selectedBackupId || diffLoading ? 0.5 : 1,
            }}
          >
            <RefreshCw size={14} /> 刷新
          </button>
        )}
      </div>

      {diffLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>对比中...</div>
      ) : diffResult ? (
        <div>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = diffResult.filter((d) => d.status === key).length;
              if (count === 0) return null;
              return (
                <div
                  key={key}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius)',
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}`,
                    fontSize: 11,
                    color: cfg.color,
                  }}
                >
                  {cfg.label}: {count}
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>驱动名称</th>
                  <th style={thStyle}>当前版本</th>
                  <th style={thStyle}>备份版本</th>
                  <th style={thStyle}>更新版本</th>
                  <th style={thStyle}>状态</th>
                </tr>
              </thead>
              <tbody>
                {diffResult.map((d) => {
                  const cfg = STATUS_CONFIG[d.status];
                  return (
                    <tr key={d.name}>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)' }}>{d.name}</span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{d.currentVersion}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: d.backupVersion ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {d.backupVersion || '—'}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: d.newerVersion ? 'var(--blue)' : 'var(--text-muted)' }}>
                        {d.newerVersion || '—'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 500,
                          color: cfg.color,
                          background: cfg.bg,
                        }}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <GitCompare size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            选择一个备份与当前驱动进行版本对比
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-color)',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 12px',
  fontSize: 12,
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-muted)',
};
