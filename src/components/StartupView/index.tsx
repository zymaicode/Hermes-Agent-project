import { useState, useEffect, useMemo } from 'react';
import { Zap, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useStartupStore } from '../../stores/startupStore';
import { EmptyState } from '../common/LoadingState';

const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  registry: { bg: 'rgba(88,166,255,0.12)', color: 'var(--accent)' },
  startup_folder: { bg: 'rgba(163,113,247,0.12)', color: 'var(--purple)' },
  service: { bg: 'rgba(63,185,80,0.12)', color: 'var(--green)' },
  scheduled_task: { bg: 'rgba(210,153,34,0.12)', color: 'var(--yellow)' },
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--yellow)',
  low: 'var(--green)',
};

const TYPE_FILTERS = ['All', 'Registry', 'Startup Folder', 'Service', 'Scheduled Task'] as const;

const maxBarSeconds = 3;

export default function StartupView() {
  const { startupApps, loading, impact, fetchStartupApps, toggleApp, disableSelected, fetchImpact } = useStartupStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    fetchStartupApps();
    fetchImpact();
  }, [fetchStartupApps, fetchImpact]);

  const filtered = useMemo(() => {
    let apps = startupApps;
    if (typeFilter !== 'All') {
      const key = typeFilter.toLowerCase().replace(' ', '_') as string;
      apps = apps.filter((a) => a.type === key);
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter((a) => a.name.toLowerCase().includes(q) || a.publisher.toLowerCase().includes(q));
    }
    return apps;
  }, [startupApps, search, typeFilter]);

  const toggleSelect = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.name)));
    }
  };

  const handleDisableSelected = async () => {
    if (selected.size === 0) return;
    const result = await disableSelected([...selected]);
    setSelected(new Set());
    setResultMsg(`Disabled ${result.success} apps${result.failed > 0 ? `, ${result.failed} failed` : ''}`);
    setTimeout(() => setResultMsg(''), 3000);
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Startup Manager</h2>
        {resultMsg && <span style={{ fontSize: 12, color: 'var(--green)' }}>{resultMsg}</span>}
      </div>

      {/* Boot Impact Card */}
      {impact && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4 }}>Boot Impact</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="stat-value">{impact.bootTime}</span>
                <span className="stat-unit">seconds</span>
              </div>
              <div className="stat-label">from {startupApps.filter((a) => a.enabled).length} enabled startup apps</div>
            </div>
            <div style={{ flex: 1, maxWidth: 320 }}>
              {impact.impactSources.slice(0, 5).map((src) => (
                <div key={src.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="text-sm truncate" style={{ flex: 1, maxWidth: 160 }}>{src.name}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (src.seconds / maxBarSeconds) * 100)}%`, borderRadius: 3, background: 'var(--accent)' }} />
                  </div>
                  <span className="text-sm text-mono" style={{ width: 36, textAlign: 'right' }}>{src.seconds.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search apps..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 30 }} />
        </div>
        <div className="tabs" style={{ borderBottom: 'none' }}>
          {TYPE_FILTERS.map((t) => (
            <button key={t} className={`tab${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)} style={{ padding: '4px 10px', fontSize: 12 }}>{t}</button>
          ))}
        </div>
        <button className="btn btn-sm" onClick={handleDisableSelected} disabled={selected.size === 0}
          style={{ marginLeft: 'auto', opacity: selected.size === 0 ? 0.5 : 1 }}>
          <Trash2 size={14} /> Disable Selected ({selected.size})
        </button>
      </div>

      {/* Table */}
      <div className="table-container card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={selectAll} />
              </th>
              <th>Name</th>
              <th>Type</th>
              <th>Publisher</th>
              <th>Impact</th>
              <th style={{ width: 80 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => {
              const badge = TYPE_BADGE_COLORS[app.type] || { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
              return (
                <tr key={app.name}>
                  <td>
                    <input type="checkbox" checked={selected.has(app.name)} onChange={() => toggleSelect(app.name)} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.name}</div>
                    <div className="text-sm text-muted">{app.description}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      background: badge.bg, color: badge.color, textTransform: 'capitalize',
                    }}>
                      {app.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{app.publisher}</td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, color: IMPACT_COLORS[app.startupImpact], textTransform: 'capitalize' }}>
                      {app.startupImpact}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleApp(app.name, !app.enabled)}
                      style={{ color: app.enabled ? 'var(--green)' : 'var(--text-muted)' }}>
                      {app.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState icon={<Zap size={48} />} title="No startup apps found" />
        )}
      </div>
    </div>
  );
}
