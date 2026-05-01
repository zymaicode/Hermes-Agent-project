import { useEffect, useState } from 'react';
import { AlertTriangle, Download, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useUpdateStore } from '../../stores/updateStore';
import type { UpdateInfo } from '../../utils/types';

function UpdateCard({ item }: { item: UpdateInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card"
      style={{
        marginBottom: 12,
        borderLeft: item.isCritical ? '3px solid var(--red)' : undefined,
      }}
    >
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius)',
              background: item.isCritical
                ? 'rgba(248, 81, 73, 0.12)'
                : 'rgba(210, 153, 34, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.isCritical ? 'var(--red)' : 'var(--yellow)',
            }}
          >
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.appName}</span>
              {item.isCritical && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--red)',
                    background: 'rgba(248, 81, 73, 0.12)',
                    padding: '1px 8px',
                    borderRadius: 10,
                  }}
                >
                  Critical
                </span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 2,
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                {item.currentVersion}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ color: 'var(--green)', fontWeight: 500 }}>
                {item.latestVersion}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: expanded ? 12 : 0, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>Released: {item.releaseDate}</span>
      </div>

      {expanded && (
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-muted)',
            borderRadius: 'var(--radius)',
            padding: 12,
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--text-primary)',
            lineHeight: 1.7,
          }}
        >
          {item.changelog}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setExpanded(!expanded)}
          style={{ gap: 4 }}
        >
          <ChevronDown
            size={14}
            style={{
              transform: expanded ? 'rotate(180deg)' : undefined,
              transition: 'transform 0.2s',
            }}
          />
          {expanded ? 'Hide' : 'Changelog'}
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => window.pchelper.openExternal(item.downloadUrl)}
          style={{ gap: 4 }}
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
}

export default function UpdateView() {
  const { scanResult, loading, scanning, scanForUpdates } = useUpdateStore();
  const [lastScan, setLastScan] = useState<string>('');

  useEffect(() => {
    scanForUpdates();
  }, [scanForUpdates]);

  useEffect(() => {
    if (scanResult?.timestamp) {
      setLastScan(new Date(scanResult.timestamp).toLocaleString());
    }
  }, [scanResult?.timestamp]);

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RefreshCw size={22} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Software Updates</h2>
        </div>
        <button
          className="btn btn-primary"
          onClick={scanForUpdates}
          disabled={scanning}
          style={{ gap: 6 }}
        >
          <RefreshCw
            size={14}
            style={scanning ? { animation: 'spin 1s linear infinite' } : undefined}
          />
          {scanning ? 'Checking...' : 'Check for Updates'}
        </button>
      </div>

      {/* Summary cards */}
      {scanResult && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value">{scanResult.totalApps}</div>
            <div className="stat-label">Apps Checked</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div
              className="stat-value"
              style={{
                color:
                  scanResult.updatesAvailable > 0
                    ? 'var(--yellow)'
                    : 'var(--green)',
              }}
            >
              {scanResult.updatesAvailable}
            </div>
            <div className="stat-label">Updates Available</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div
              className="stat-value"
              style={{
                color:
                  scanResult.criticalUpdates > 0
                    ? 'var(--red)'
                    : 'var(--text-secondary)',
              }}
            >
              {scanResult.criticalUpdates}
            </div>
            <div className="stat-label">Critical Updates</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 14 }}>
              {lastScan || '—'}
            </div>
            <div className="stat-label">Last Scan</div>
          </div>
        </div>
      )}

      {/* Update list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {scanning && !scanResult ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>Checking for updates...</div>
          </div>
        ) : scanResult && scanResult.updates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <CheckCircle size={48} style={{ marginBottom: 16, color: 'var(--green)', opacity: 0.7 }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--green)', marginBottom: 8 }}>
              All apps are up to date
            </div>
            <div style={{ fontSize: 12 }}>
              {scanResult.totalApps} apps checked — no updates needed
            </div>
          </div>
        ) : (
          scanResult?.updates.map((item) => (
            <UpdateCard key={item.appName} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
