import { useEffect, useCallback } from 'react';
import {
  Cpu, Search, Filter, ChevronDown, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Clock, FileWarning,
} from 'lucide-react';
import { useDriversStore } from '../../stores/driversStore';

const TYPE_COLORS: Record<string, string> = {
  kernel: 'var(--blue)',
  file_system: 'var(--purple)',
  filter: 'var(--teal)',
  display: 'var(--green)',
  network: 'var(--cyan)',
  audio: 'var(--pink)',
  usb: 'var(--orange)',
  other: 'var(--text-secondary)',
};

function statusDot(status: string) {
  if (status === 'running') return <CheckCircle size={12} style={{ color: 'var(--green)' }} />;
  if (status === 'stopped') return <Clock size={12} style={{ color: 'var(--text-secondary)' }} />;
  return <XCircle size={12} style={{ color: 'var(--red)' }} />;
}

function sortArrow(field: string, currentField: string, asc: boolean) {
  if (field !== currentField) return '';
  return asc ? ' ▴' : ' ▾';
}

export default function DriversView() {
  const drivers = useDriversStore((s) => s.drivers);
  const loading = useDriversStore((s) => s.loading);
  const searchQuery = useDriversStore((s) => s.searchQuery);
  const typeFilter = useDriversStore((s) => s.typeFilter);
  const statusFilter = useDriversStore((s) => s.statusFilter);
  const problemOnly = useDriversStore((s) => s.problemOnly);
  const expandedDriver = useDriversStore((s) => s.expandedDriver);
  const sortField = useDriversStore((s) => s.sortField);
  const sortAsc = useDriversStore((s) => s.sortAsc);
  const fetchDrivers = useDriversStore((s) => s.fetchDrivers);
  const setSearchQuery = useDriversStore((s) => s.setSearchQuery);
  const setTypeFilter = useDriversStore((s) => s.setTypeFilter);
  const setStatusFilter = useDriversStore((s) => s.setStatusFilter);
  const setProblemOnly = useDriversStore((s) => s.setProblemOnly);
  const setSortField = useDriversStore((s) => s.setSortField);
  const expandDriver = useDriversStore((s) => s.expandDriver);
  const collapseDriver = useDriversStore((s) => s.collapseDriver);
  const getFilteredDrivers = useDriversStore((s) => s.getFilteredDrivers);
  const getStats = useDriversStore((s) => s.getStats);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const stats = getStats();
  const filtered = getFilteredDrivers();
  const problems = drivers.filter((d) => d.status === 'error');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  if (loading && drivers.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading drivers...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Driver Manager</h2>
        <div className="flex items-center gap-2">
          <Cpu size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{stats.total} drivers</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Drivers</div>
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
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Problems</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: stats.problems > 0 ? 'var(--red)' : 'var(--green)' }}>{stats.problems}</div>
        </div>
      </div>

      {/* Problem drivers alert */}
      {problems.length > 0 && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
            <FileWarning size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {problems.length} Problem Driver{problems.length > 1 ? 's' : ''} Detected
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {problems.map((d) => (
              <div key={d.name} className="card" style={{ padding: 12, borderLeft: '3px solid var(--red)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.deviceName} &middot; {d.provider}</div>
                <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>Status: {d.status}</div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Search size={14} style={{ color: 'var(--text-secondary)', marginRight: 6 }} />
          <input placeholder="Search drivers..." value={searchQuery} onChange={handleSearch} style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
          <option value="all">All Types</option>
          <option value="kernel">Kernel</option>
          <option value="file_system">File System</option>
          <option value="filter">Filter</option>
          <option value="display">Display</option>
          <option value="network">Network</option>
          <option value="audio">Audio</option>
          <option value="usb">USB</option>
          <option value="other">Other</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="error">Error</option>
        </select>
        <label className="flex items-center gap-2" style={{ fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={problemOnly} onChange={(e) => setProblemOnly(e.target.checked)} />
          Problems Only
        </label>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortField('name')}>Name{sortArrow('name', sortField, sortAsc)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortField('provider')}>Provider{sortArrow('provider', sortField, sortAsc)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortField('version')}>Version{sortArrow('version', sortField, sortAsc)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortField('date')}>Date{sortArrow('date', sortField, sortAsc)}</th>
              <th>Status</th>
              <th>Type</th>
              <th style={{ width: 60, textAlign: 'center' }}>Signed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d.name}
                onClick={() => expandedDriver?.name === d.name ? collapseDriver() : expandDriver(d.name)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.provider}</td>
                <td className="text-mono" style={{ fontSize: 12 }}>{d.version}</td>
                <td style={{ fontSize: 12 }}>{d.date}</td>
                <td>
                  <span className="flex items-center gap-1">
                    {statusDot(d.status)}
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{d.status}</span>
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: TYPE_COLORS[d.type] + '22', color: TYPE_COLORS[d.type],
                    textTransform: 'capitalize',
                  }}>
                    {d.type.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {d.signed
                    ? <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                    : <XCircle size={14} style={{ color: 'var(--red)' }} />
                  }
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>No drivers match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {expandedDriver && (
        <div className="card" style={{ marginTop: 12, padding: 16, maxHeight: 280, overflow: 'auto' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>{expandedDriver.name}</h3>
            <button onClick={collapseDriver} className="btn-icon" style={{ color: 'var(--text-secondary)' }}><XCircle size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Device:</span> {expandedDriver.deviceName}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Class:</span> {expandedDriver.deviceClass}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>INF File:</span> <span className="text-mono">{expandedDriver.infFile}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Base Address:</span> <span className="text-mono">{expandedDriver.baseAddress}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Size:</span> {expandedDriver.sizeKB.toLocaleString()} KB</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Signed:</span> {expandedDriver.signed ? 'Yes' : 'No'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>PnP ID:</span> <span className="text-mono" style={{ fontSize: 10 }}>{expandedDriver.pnpId}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Registry:</span> <span className="text-mono" style={{ fontSize: 10 }}>{expandedDriver.registryPath}</span></div>
          </div>
          {expandedDriver.dependencies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Dependencies:</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {expandedDriver.dependencies.map((dep) => (
                  <span key={dep} className="badge" style={{ fontSize: 11 }}>{dep}</span>
                ))}
              </div>
            </div>
          )}
          {expandedDriver.dependentDrivers.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Dependent Drivers:</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {expandedDriver.dependentDrivers.map((dep) => (
                  <span key={dep} className="badge" style={{ fontSize: 11 }}>{dep}</span>
                ))}
              </div>
            </div>
          )}
          {expandedDriver.hardwareIds.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Hardware IDs:</div>
              {expandedDriver.hardwareIds.map((id) => (
                <div key={id} className="text-mono" style={{ fontSize: 10, marginLeft: 8 }}>{id}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
