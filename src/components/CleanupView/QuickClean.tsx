import { Loader2, Trash2, Check, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useCleanupStore } from '../../stores/cleanupStore';
import { useEffect } from 'react';

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RISK_CONFIG: Record<string, { color: string; icon: React.ComponentType<any> }> = {
  safe: { color: 'var(--green)', icon: ShieldCheck },
  moderate: { color: 'var(--yellow)', icon: AlertTriangle },
  warning: { color: 'var(--red)', icon: ShieldAlert },
};

export default function QuickClean() {
  const {
    tempCategories, browserCaches, systemCategories,
    quickLoading, quickCleaning, selectedTempIds, selectedBrowserIds, selectedSystemIds,
    quickCleanResults,
    toggleTempId, toggleBrowserId, toggleSystemId,
    cleanSelected, clearQuickResults, getQuickTotalSelectedSize, scanAllQuick,
  } = useCleanupStore();

  useEffect(() => {
    if (quickCleanResults) {
      const t = setTimeout(clearQuickResults, 8000);
      return () => clearTimeout(t);
    }
  }, [quickCleanResults, clearQuickResults]);

  const totalSelected = getQuickTotalSelectedSize();
  const hasSelection = selectedTempIds.length + selectedBrowserIds.length + selectedSystemIds.length > 0;

  if (quickLoading && tempCategories.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 200, color: 'var(--text-secondary)' }}>
        <Loader2 size={20} className="spin" />
        <span style={{ marginLeft: 8 }}>Scanning system...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Clean results toast */}
      {quickCleanResults && quickCleanResults.length > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius)',
          background: 'rgba(63,185,80,0.12)', color: 'var(--green)',
          border: '1px solid var(--green)', fontSize: 13,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Cleanup Complete</div>
          {quickCleanResults.map((r) => (
            <div key={r.category} style={{ fontSize: 12, opacity: 0.9 }}>
              {r.category}: {formatBytes(r.spaceFreed)} freed
              {r.errors.length > 0 && <span style={{ color: 'var(--yellow)', marginLeft: 8 }}>({r.errors.length} skipped)</span>}
            </div>
          ))}
          <div style={{ marginTop: 6, fontWeight: 600 }}>
            Total freed: {formatBytes(quickCleanResults.reduce((s, r) => s + r.spaceFreed, 0))}
          </div>
        </div>
      )}

      {/* Temp Files */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Temporary Files</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tempCategories.map((cat) => {
            const checked = selectedTempIds.includes(cat.id);
            return (
              <label
                key={cat.id}
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
                  onChange={() => toggleTempId(cat.id)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cat.description}</div>
                </div>
                <div className="text-mono" style={{ fontSize: 12, marginRight: 12 }}>{formatBytes(cat.size)}</div>
                <div className="text-muted" style={{ fontSize: 10, marginRight: 8 }}>{cat.fileCount.toLocaleString()} files</div>
                {cat.canClean ? (
                  <Check size={14} style={{ color: 'var(--green)' }} />
                ) : (
                  <AlertTriangle size={14} style={{ color: 'var(--yellow)' }} />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Browser Caches */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Browser Caches</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {browserCaches.map((b) => {
            const checked = selectedBrowserIds.includes(b.browser);
            return (
              <label
                key={b.browser}
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
                  onChange={() => toggleBrowserId(b.browser)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{b.browser}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {b.cookieCount.toLocaleString()} cookies &middot; Last cleared: {b.lastCleared}
                  </div>
                </div>
                <div className="text-mono" style={{ fontSize: 12, marginRight: 12 }}>{formatBytes(b.cacheSize)}</div>
                <div className="text-muted" style={{ fontSize: 10 }}>{formatBytes(b.historySize)} history</div>
              </label>
            );
          })}
        </div>
      </div>

      {/* System Cleanup */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>System Cleanup</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {systemCategories.map((cat) => {
            const checked = selectedSystemIds.includes(cat.id);
            const riskCfg = RISK_CONFIG[cat.risk];
            const RiskIcon = riskCfg.icon;
            return (
              <label
                key={cat.id}
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
                  onChange={() => toggleSystemId(cat.id)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cat.description}</div>
                </div>
                <RiskIcon size={14} style={{ color: riskCfg.color, marginRight: 12 }} />
                <div className="text-mono" style={{ fontSize: 12, marginRight: 12 }}>{formatBytes(cat.size)}</div>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 600,
                  color: riskCfg.color, background: `${riskCfg.color}20`,
                }}>
                  {cat.risk === 'safe' ? 'Safe' : cat.risk === 'moderate' ? 'Moderate' : 'Warning'}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: 'var(--radius)',
        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
        position: 'sticky', bottom: 0,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {hasSelection
            ? <span>Will free approximately <strong style={{ color: 'var(--green)' }}>{formatBytes(totalSelected)}</strong></span>
            : <span>Select items above to clean</span>}
        </div>
        <button
          className="btn btn-primary"
          disabled={!hasSelection || quickCleaning}
          onClick={cleanSelected}
        >
          {quickCleaning ? (
            <><Loader2 size={14} className="spin" /> Cleaning...</>
          ) : (
            <><Trash2 size={14} /> Clean Selected</>
          )}
        </button>
      </div>
    </div>
  );
}
