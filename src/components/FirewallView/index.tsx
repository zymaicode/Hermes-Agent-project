import { useEffect } from 'react';
import { Shield, Search, ChevronDown, ChevronUp, Check, X, Globe, Lock, Wifi } from 'lucide-react';
import { useFirewallStore } from '../../stores/firewallStore';

const PROFILE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  domain: Globe,
  private: Lock,
  public: Wifi,
};

const PROFILE_COLORS: Record<string, string> = {
  domain: 'var(--accent)',
  private: 'var(--green)',
  public: 'var(--yellow)',
};

export default function FirewallView() {
  const {
    rules, loading, searchQuery, directionFilter, actionFilter, protocolFilter,
    sortField, sortAsc, expandedRule, toggleResult,
    fetchRules, setSearchQuery, setDirectionFilter, setActionFilter, setProtocolFilter,
    setSortField, expandRule, collapseRule, toggleRule, clearToggleResult,
    getFilteredRules, getStats,
  } = useFirewallStore();

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (toggleResult) {
      const t = setTimeout(clearToggleResult, 3000);
      return () => clearTimeout(t);
    }
  }, [toggleResult, clearToggleResult]);

  const filtered = getFilteredRules();
  const stats = getStats();

  const sortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortAsc ? ' ▲' : ' ▼';
  };

  if (loading && filtered.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading firewall rules...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Firewall Rules</h2>
        <div className="flex items-center gap-2">
          <Shield size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">Windows Defender Firewall</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Total Rules</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Enabled</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>{stats.enabled}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Inbound</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>{stats.inbound}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Outbound</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--accent)' }}>{stats.outbound}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <select value={directionFilter} onChange={(e) => setDirectionFilter(e.target.value)} className="input" style={{ width: 110 }}>
          <option value="all">All Dir</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input" style={{ width: 100 }}>
          <option value="all">All Action</option>
          <option value="allow">Allow</option>
          <option value="block">Block</option>
        </select>
        <select value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)} className="input" style={{ width: 100 }}>
          <option value="all">All Proto</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="Any">Any</option>
        </select>
      </div>

      {/* Status */}
      <div className="text-sm text-muted mb-3">
        {filtered.length} rule{filtered.length !== 1 ? 's' : ''} active &mdash; {stats.inbound} inbound, {stats.outbound} outbound
      </div>

      {/* Result toast */}
      {toggleResult && (
        <div style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 13,
          background: toggleResult.success ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)',
          color: toggleResult.success ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${toggleResult.success ? 'var(--green)' : 'var(--red)'}`,
        }}>
          {toggleResult.message}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 280 }} onClick={() => setSortField('name')}>Name{sortArrow('name')}</th>
              <th style={{ width: 80 }} onClick={() => setSortField('direction')}>Direction{sortArrow('direction')}</th>
              <th style={{ width: 70 }} onClick={() => setSortField('action')}>Action{sortArrow('action')}</th>
              <th style={{ width: 70 }} onClick={() => setSortField('protocol')}>Protocol{sortArrow('protocol')}</th>
              <th style={{ width: 200 }}>Program</th>
              <th style={{ width: 120 }}>Profiles</th>
              <th style={{ width: 60 }}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rule) => {
              const isExpanded = expandedRule?.name === rule.name;
              return (
                <tr key={rule.name} className="table-row">
                  <td onClick={() => isExpanded ? collapseRule() : expandRule(rule)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />}
                      <Shield size={14} style={{ color: rule.enabled ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{rule.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      color: rule.direction === 'inbound' ? 'var(--green)' : 'var(--accent)',
                      background: rule.direction === 'inbound' ? 'rgba(63,185,80,0.12)' : 'rgba(88,166,255,0.12)',
                      textTransform: 'capitalize',
                    }}>
                      {rule.direction}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      {rule.action === 'allow' ? (
                        <Check size={14} color="var(--green)" />
                      ) : (
                        <X size={14} color="var(--red)" />
                      )}
                      <span style={{ color: rule.action === 'allow' ? 'var(--green)' : 'var(--red)', textTransform: 'capitalize' }}>
                        {rule.action}
                      </span>
                    </span>
                  </td>
                  <td className="text-mono" style={{ fontSize: 12 }}>{rule.protocol}</td>
                  <td className="truncate" style={{ maxWidth: 180, fontSize: 12, color: 'var(--text-secondary)' }} title={rule.program}>
                    {rule.program}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {rule.profiles.map((p) => {
                        const PIcon = PROFILE_ICONS[p];
                        return <PIcon key={p} size={14} style={{ color: PROFILE_COLORS[p] || 'var(--text-muted)' }} />;
                      })}
                    </div>
                  </td>
                  <td>
                    <label className="settings-toggle" style={{ width: 34, height: 18 }}>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => toggleRule(rule.name, e.target.checked)}
                      />
                      <span className="settings-toggle-slider" style={{ borderRadius: 18, '--toggle-size': '10px' } as React.CSSProperties} />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {expandedRule && (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 16, fontWeight: 600 }}>{expandedRule.name}</span>
            <button className="btn btn-sm btn-ghost" onClick={collapseRule}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="stat-label">Description</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{expandedRule.description}</div>
            </div>
            <div>
              <div className="stat-label">Program</div>
              <div className="text-mono" style={{ fontSize: 11 }}>{expandedRule.program}</div>
            </div>
            <div>
              <div className="stat-label">Local Ports</div>
              <div className="text-mono" style={{ fontSize: 12 }}>{expandedRule.localPorts}</div>
            </div>
            <div>
              <div className="stat-label">Remote Ports</div>
              <div className="text-mono" style={{ fontSize: 12 }}>{expandedRule.remotePorts}</div>
            </div>
            <div>
              <div className="stat-label">Local Addresses</div>
              <div className="text-mono" style={{ fontSize: 12 }}>{expandedRule.localAddresses}</div>
            </div>
            <div>
              <div className="stat-label">Remote Addresses</div>
              <div className="text-mono" style={{ fontSize: 12 }}>{expandedRule.remoteAddresses}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
