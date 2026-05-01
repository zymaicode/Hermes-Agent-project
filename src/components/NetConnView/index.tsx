import { useEffect, useState, useRef } from 'react';
import {
  Wifi, Server, Globe, Shield, AlertTriangle, RefreshCw,
  ChevronDown, ExternalLink, ArrowDown, ArrowUp,
} from 'lucide-react';
import { useNetConnStore } from '../../stores/netConnStore';

const STATE_COLORS: Record<string, string> = {
  established: 'var(--green)',
  listen: 'var(--blue)',
  time_wait: 'var(--text-secondary)',
  close_wait: 'var(--yellow)',
  syn_sent: 'var(--orange)',
  syn_received: 'var(--purple)',
  fin_wait1: 'var(--orange)',
  fin_wait2: 'var(--orange)',
  closed: 'var(--red)',
  bound: 'var(--teal)',
  unknown: 'var(--text-secondary)',
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  JP: '🇯🇵',
  KR: '🇰🇷',
  CN: '🇨🇳',
  SG: '🇸🇬',
  NL: '🇳🇱',
  FR: '🇫🇷',
  CA: '🇨🇦',
};

function stateBadge(state: string) {
  const c = STATE_COLORS[state] || STATE_COLORS.unknown;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
      background: c + '22', color: c, textTransform: 'capitalize',
    }}>
      {state.replace('_', ' ')}
    </span>
  );
}

function protocolBadge(p: string) {
  const color = p.includes('UDP') ? 'var(--orange)' : 'var(--accent)';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: color + '22', color, fontFamily: 'monospace',
    }}>
      {p}
    </span>
  );
}

export default function NetConnView() {
  const connections = useNetConnStore((s) => s.connections);
  const listeningPorts = useNetConnStore((s) => s.listeningPorts);
  const stats = useNetConnStore((s) => s.stats);
  const tab = useNetConnStore((s) => s.tab);
  const protocolFilter = useNetConnStore((s) => s.protocolFilter);
  const stateFilter = useNetConnStore((s) => s.stateFilter);
  const search = useNetConnStore((s) => s.search);
  const geoCache = useNetConnStore((s) => s.geoCache);
  const loading = useNetConnStore((s) => s.loading);
  const fetchConnections = useNetConnStore((s) => s.fetchConnections);
  const fetchListeningPorts = useNetConnStore((s) => s.fetchListeningPorts);
  const fetchStats = useNetConnStore((s) => s.fetchStats);
  const setTab = useNetConnStore((s) => s.setTab);
  const setProtocolFilter = useNetConnStore((s) => s.setProtocolFilter);
  const setStateFilter = useNetConnStore((s) => s.setStateFilter);
  const setSearch = useNetConnStore((s) => s.setSearch);
  const getGeoInfo = useNetConnStore((s) => s.getGeoInfo);

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('port');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [geoHover, setGeoHover] = useState<{ x: number; y: number; info: { country: string; city: string; isp: string } } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fetchAll = () => {
    fetchConnections();
    fetchListeningPorts();
    fetchStats();
  };

  const filteredConns = connections
    .filter((c) => protocolFilter === 'all' || c.protocol === protocolFilter)
    .filter((c) => stateFilter === 'all' || c.state === stateFilter)
    .filter((c) => !search || c.processName.toLowerCase().includes(search.toLowerCase()) || c.remoteAddress.includes(search) || c.localAddress.includes(search));

  const sortedPorts = [...listeningPorts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'port') return (a.port - b.port) * dir;
    if (sortField === 'name') return a.processName.localeCompare(b.processName) * dir;
    return 0;
  });

  const dangerPorts = [22, 3389, 21, 23, 445];

  const handleRemoteHover = async (e: React.MouseEvent, ip: string) => {
    if (ip === '0.0.0.0' || ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) return;
    const info = await getGeoInfo(ip);
    if (info) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setGeoHover({ x: rect.left, y: rect.bottom + 4, info });
    }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Network Connections</h2>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchAll}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          className="btn"
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: tab === 'connections' ? 600 : 400,
            borderBottom: tab === 'connections' ? '2px solid var(--accent)' : '2px solid transparent',
            borderRadius: 0, background: 'transparent',
            color: tab === 'connections' ? 'var(--accent)' : 'var(--text-secondary)',
          }}
          onClick={() => setTab('connections')}
        >
          Active Connections ({connections.length})
        </button>
        <button
          className="btn"
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: tab === 'listening' ? 600 : 400,
            borderBottom: tab === 'listening' ? '2px solid var(--accent)' : '2px solid transparent',
            borderRadius: 0, background: 'transparent',
            color: tab === 'listening' ? 'var(--accent)' : 'var(--text-secondary)',
          }}
          onClick={() => setTab('listening')}
        >
          Listening Ports ({listeningPorts.length})
        </button>
      </div>

      {/* Stats row */}
      {stats && tab === 'connections' && (
        <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, icon: Wifi, color: 'var(--text-primary)' },
            { label: 'Established', value: stats.established, icon: Globe, color: 'var(--green)' },
            { label: 'Listening', value: stats.listening, icon: Server, color: 'var(--blue)' },
            { label: 'Time Wait', value: stats.timeWait, icon: Shield, color: 'var(--text-secondary)' },
            { label: 'Processes', value: stats.pidCount, icon: Server, color: 'var(--accent)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <s.icon size={14} style={{ color: s.color }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats row for listening */}
      {tab === 'listening' && (
        <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
          {[
            { label: 'Total Ports', value: listeningPorts.length, color: 'var(--accent)' },
            { label: 'TCP', value: listeningPorts.filter((p) => p.protocol === 'TCP').length, color: 'var(--green)' },
            { label: 'UDP', value: listeningPorts.filter((p) => p.protocol === 'UDP').length, color: 'var(--orange)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters (connections tab) */}
      {tab === 'connections' && (
        <div className="flex items-center gap-2 mb-3">
          <select
            className="input"
            style={{ fontSize: 11, padding: '4px 8px', width: 100 }}
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
          >
            <option value="all">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
          </select>
          <select
            className="input"
            style={{ fontSize: 11, padding: '4px 8px', width: 130 }}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="all">All States</option>
            <option value="established">Established</option>
            <option value="listen">Listen</option>
            <option value="time_wait">Time Wait</option>
            <option value="close_wait">Close Wait</option>
          </select>
          <input
            className="input"
            style={{ flex: 1, fontSize: 11, padding: '4px 8px' }}
            placeholder="Filter by process name or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Active Connections tab */}
      {tab === 'connections' && (
        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '70px 1fr 1fr 100px 130px 60px',
            padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
            fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
          }}>
            <span>Proto</span>
            <span>Local</span>
            <span>Remote</span>
            <span>State</span>
            <span>Process</span>
            <span>PID</span>
          </div>
          {filteredConns.map((conn, i) => (
            <div key={i}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr 1fr 100px 130px 60px',
                  padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center',
                  cursor: 'pointer',
                  background: expandedRow === i ? 'var(--bg-hover)' : 'transparent',
                }}
                onClick={() => setExpandedRow(expandedRow === i ? null : i)}
              >
                <span>{protocolBadge(conn.protocol)}</span>
                <span className="text-mono" style={{ fontSize: 10 }}>{conn.localAddress}:{conn.localPort}</span>
                <span
                  className="text-mono"
                  style={{ fontSize: 10, position: 'relative' }}
                  onMouseEnter={(e) => handleRemoteHover(e, conn.remoteAddress)}
                  onMouseLeave={() => setGeoHover(null)}
                >
                  {conn.state === 'listen' ? '*' : `${conn.remoteAddress}:${conn.remotePort}`}
                  {geoCache[conn.remoteAddress] && (
                    <span style={{ marginLeft: 4 }}>{COUNTRY_FLAGS[geoCache[conn.remoteAddress].country] || '🌐'}</span>
                  )}
                </span>
                <span>{stateBadge(conn.state)}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conn.processName}</span>
                <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{conn.processId}</span>
              </div>
              {expandedRow === i && (
                <div className="card" style={{ margin: '4px 12px', padding: 12, fontSize: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Local:</span> {conn.localAddress}:{conn.localPort}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Remote:</span> {conn.remoteAddress}:{conn.remotePort}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Process Path:</span> <span className="text-mono" style={{ fontSize: 10 }}>{conn.processPath}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Created:</span> {new Date(conn.created).toLocaleString()}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Bytes Sent:</span> {conn.bytesSent.toLocaleString()}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Bytes Received:</span> {conn.bytesReceived.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Listening Ports tab */}
      {tab === 'listening' && (
        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 60px 140px 130px 60px 140px 1fr',
            padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
            fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', gap: 4,
          }}>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => { setSortField('port'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
            >
              Port {sortField === 'port' && (sortDir === 'asc' ? '▲' : '▼')}
            </span>
            <span>Proto</span>
            <span>Address</span>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => { setSortField('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
            >
              Process {sortField === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
            </span>
            <span>PID</span>
            <span>Service</span>
            <span>Description</span>
          </div>
          {sortedPorts.map((port, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '60px 60px 140px 130px 60px 140px 1fr',
                padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center', gap: 4,
              }}
            >
              <div className="flex items-center gap-1">
                {dangerPorts.includes(port.port) && (
                  <AlertTriangle size={12} style={{ color: 'var(--red)' }} />
                )}
                <span className="text-mono" style={{ color: dangerPorts.includes(port.port) ? 'var(--red)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {port.port}
                </span>
              </div>
              <span className="text-mono" style={{ fontSize: 10 }}>{port.protocol}</span>
              <span className="text-mono" style={{ fontSize: 10 }}>{port.address}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{port.processName}</span>
              <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{port.pid}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{port.service || '—'}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{port.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Geo tooltip */}
      {geoHover && (
        <div
          style={{
            position: 'fixed', left: geoHover.x, top: geoHover.y, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div>{geoHover.info.country === 'US' ? '🇺🇸' : '🌐'} {geoHover.info.city}, {geoHover.info.country}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{geoHover.info.isp}</div>
        </div>
      )}
    </div>
  );
}
