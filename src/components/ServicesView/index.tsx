import { useEffect, useCallback } from 'react';
import {
  Server, Search, Play, Square, RotateCw, AlertTriangle,
  CheckCircle, XCircle, PauseCircle, Loader2,
} from 'lucide-react';
import { useServicesStore } from '../../stores/servicesStore';
import type { ServiceEntry } from '../../../electron/services/manager';

function statusColor(status: string) {
  switch (status) {
    case 'running': return 'var(--green)';
    case 'stopped': return 'var(--text-secondary)';
    case 'paused': return 'var(--yellow)';
    default: return 'var(--orange)';
  }
}

function statusIcon(status: string) {
  switch (status) {
    case 'running': return <CheckCircle size={12} />;
    case 'stopped': return <XCircle size={12} />;
    case 'paused': return <PauseCircle size={12} />;
    default: return <Loader2 size={12} />;
  }
}

function startupBadge(type: string) {
  const label = type.replace(/_/g, ' ');
  return <span className="badge" style={{ fontSize: 11, textTransform: 'capitalize' }}>{label}</span>;
}

function sortArrow(field: string, currentField: string, asc: boolean) {
  if (field !== currentField) return '';
  return asc ? ' ▴' : ' ▾';
}

export default function ServicesView() {
  const services = useServicesStore((s) => s.services);
  const loading = useServicesStore((s) => s.loading);
  const searchQuery = useServicesStore((s) => s.searchQuery);
  const statusFilter = useServicesStore((s) => s.statusFilter);
  const startupFilter = useServicesStore((s) => s.startupFilter);
  const criticalOnly = useServicesStore((s) => s.criticalOnly);
  const thirdPartyOnly = useServicesStore((s) => s.thirdPartyOnly);
  const expandedService = useServicesStore((s) => s.expandedService);
  const selectedService = useServicesStore((s) => s.selectedService);
  const sortField = useServicesStore((s) => s.sortField);
  const sortAsc = useServicesStore((s) => s.sortAsc);
  const actionResult = useServicesStore((s) => s.actionResult);
  const fetchServices = useServicesStore((s) => s.fetchServices);
  const setSearchQuery = useServicesStore((s) => s.setSearchQuery);
  const setStatusFilter = useServicesStore((s) => s.setStatusFilter);
  const setStartupFilter = useServicesStore((s) => s.setStartupFilter);
  const setCriticalOnly = useServicesStore((s) => s.setCriticalOnly);
  const setThirdPartyOnly = useServicesStore((s) => s.setThirdPartyOnly);
  const setSortField = useServicesStore((s) => s.setSortField);
  const expandService = useServicesStore((s) => s.expandService);
  const collapseService = useServicesStore((s) => s.collapseService);
  const selectService = useServicesStore((s) => s.selectService);
  const startService = useServicesStore((s) => s.startService);
  const stopService = useServicesStore((s) => s.stopService);
  const restartService = useServicesStore((s) => s.restartService);
  const setStartupType = useServicesStore((s) => s.setStartupType);
  const clearActionResult = useServicesStore((s) => s.clearActionResult);
  const getFilteredServices = useServicesStore((s) => s.getFilteredServices);
  const getStats = useServicesStore((s) => s.getStats);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  useEffect(() => {
    if (actionResult) {
      const t = setTimeout(() => clearActionResult(), 4000);
      return () => clearTimeout(t);
    }
  }, [actionResult, clearActionResult]);

  const stats = getStats();
  const filtered = getFilteredServices();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleRowClick = (s: ServiceEntry) => {
    if (expandedService?.name === s.name) {
      collapseService();
    } else {
      expandService(s.name);
      selectService(s);
    }
  };

  const confirmAction = (action: string, svc: ServiceEntry) => {
    if (svc.isCritical) {
      const ok = window.confirm(
        `WARNING: "${svc.displayName}" is a critical system service. ${action} it may cause system instability. Continue?`
      );
      if (!ok) return false;
    }
    return true;
  };

  if (loading && services.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading services...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Services Manager</h2>
        <div className="flex items-center gap-2">
          <Server size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{stats.total} services</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Services</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Running</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{stats.running}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Stopped</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-secondary)' }}>{stats.stopped}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Paused</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--yellow)' }}>{stats.paused}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Critical</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{stats.critical}</div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ color: 'var(--text-secondary)', marginRight: 6 }} />
          <input placeholder="Search services..." value={searchQuery} onChange={handleSearch} style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="paused">Paused</option>
        </select>
        <select value={startupFilter} onChange={(e) => setStartupFilter(e.target.value)} className="filter-select">
          <option value="all">All Startup</option>
          <option value="automatic">Automatic</option>
          <option value="automatic_delayed">Delayed</option>
          <option value="manual">Manual</option>
          <option value="disabled">Disabled</option>
        </select>
        <label className="flex items-center gap-2" style={{ fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={criticalOnly} onChange={(e) => setCriticalOnly(e.target.checked)} />
          Critical Only
        </label>
        <label className="flex items-center gap-2" style={{ fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={thirdPartyOnly} onChange={(e) => setThirdPartyOnly(e.target.checked)} />
          Third-party Only
        </label>
      </div>

      {/* Action buttons */}
      {selectedService && (
        <div className="flex items-center gap-2 mb-3" style={{ padding: '8px 12px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 8 }}>{selectedService.displayName}:</span>
          {selectedService.status !== 'running' && (
            <button className="btn btn-sm" style={{ background: 'var(--green)', color: '#fff' }} onClick={() => startService(selectedService.name)}>
              <Play size={12} /> Start
            </button>
          )}
          {selectedService.status === 'running' && (
            <button className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => confirmAction('Stopping', selectedService) && stopService(selectedService.name)}>
              <Square size={12} /> Stop
            </button>
          )}
          {selectedService.status === 'running' && (
            <button className="btn btn-sm" style={{ background: 'var(--yellow)', color: '#000' }} onClick={() => confirmAction('Restarting', selectedService) && restartService(selectedService.name)}>
              <RotateCw size={12} /> Restart
            </button>
          )}
          <select
            className="filter-select"
            value={selectedService.startupType}
            onChange={(e) => setStartupType(selectedService.name, e.target.value as ServiceEntry['startupType'])}
          >
            <option value="automatic">Automatic</option>
            <option value="automatic_delayed">Automatic (Delayed)</option>
            <option value="manual">Manual</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      )}

      {/* Result toast */}
      {actionResult && (
        <div style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 12,
          background: actionResult.success ? 'var(--green-muted)' : 'var(--red-muted)',
          color: actionResult.success ? 'var(--green)' : 'var(--red)',
        }}>
          {actionResult.message}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortField('displayName')}>Display Name{sortArrow('displayName', sortField, sortAsc)}</th>
              <th>Status</th>
              <th>Startup Type</th>
              <th>Log On As</th>
              <th style={{ width: 60 }}>PID</th>
              <th>Process</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isExpanded = expandedService?.name === s.name;
              return (
                <tr key={s.name} onClick={() => handleRowClick(s)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{s.displayName}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.name}</div>
                  </td>
                  <td>
                    <span className="flex items-center gap-1" style={{ color: statusColor(s.status) }}>
                      {statusIcon(s.status)}
                      <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{s.status}</span>
                    </span>
                  </td>
                  <td>{startupBadge(s.startupType)}</td>
                  <td style={{ fontSize: 11 }}>{s.logOnAs}</td>
                  <td className="text-mono" style={{ fontSize: 11, color: s.pid > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.pid || '-'}</td>
                  <td style={{ fontSize: 12, color: s.processName ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.processName || '-'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>No services match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {expandedService && (
        <div className="card" style={{ marginTop: 12, padding: 16, maxHeight: 320, overflow: 'auto' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>{expandedService.displayName}</h3>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{expandedService.name}</div>
            </div>
            {expandedService.isCritical && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--red-muted)', color: 'var(--red)' }}>
                Critical
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{expandedService.description}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span style={{ color: statusColor(expandedService.status) }}>{expandedService.status}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Startup:</span> {expandedService.startupType.replace(/_/g, ' ')}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Log On:</span> {expandedService.logOnAs}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>PID:</span> <span className="text-mono">{expandedService.pid || '-'}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Type:</span> {expandedService.serviceType.replace(/_/g, ' ')}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Group:</span> {expandedService.group || '-'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Restarts:</span> {expandedService.restartCount}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Start Time:</span> {expandedService.startTime ? new Date(expandedService.startTime).toLocaleTimeString() : '-'}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
            Path: <span className="text-mono">{expandedService.path}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Registry: <span className="text-mono" style={{ fontSize: 10 }}>{expandedService.registryPath}</span>
          </div>
          {expandedService.dependencies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Dependencies:</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {expandedService.dependencies.map((dep) => (
                  <span key={dep} className="badge" style={{ fontSize: 11 }}>{dep}</span>
                ))}
              </div>
            </div>
          )}
          {expandedService.dependentServices.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Dependent Services:</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {expandedService.dependentServices.map((dep) => (
                  <span key={dep} className="badge" style={{ fontSize: 11 }}>{dep}</span>
                ))}
              </div>
            </div>
          )}
          {expandedService.flags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Flags:</div>
              {expandedService.flags.map((f) => (
                <span key={f} className="badge" style={{ fontSize: 10, marginRight: 4 }}>{f}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
