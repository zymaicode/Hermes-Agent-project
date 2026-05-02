import { useState, useEffect, useMemo } from 'react';
import { Monitor, Server, Cpu, Smartphone, Printer, Wifi, Search, RefreshCw, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { useNetworkToolsStore } from '../../stores/networkToolsStore';
import './networkTools.css';

/* ---------- helpers ---------- */

function vendorIcon(vendor: string) {
  const lc = vendor.toLowerCase();
  if (lc.includes('tp-link') || lc.includes('router')) return <Wifi size={18} />;
  if (lc.includes('synology') || lc.includes('nas')) return <Server size={18} />;
  if (lc.includes('intel') || lc.includes('asus')) return <Cpu size={18} />;
  if (lc.includes('samsung') || lc.includes('smart')) return <Monitor size={18} />;
  if (lc.includes('hp') || lc.includes('printer')) return <Printer size={18} />;
  if (lc.includes('raspberry') || lc.includes('espressif')) return <Cpu size={18} />;
  return <Smartphone size={18} />;
}

function fmtSpeed(kbps: number): string {
  if (kbps > 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
  return `${kbps.toFixed(0)} Kbps`;
}

/* ========== LanScannerPanel ========== */

function LanScannerPanel() {
  const { lanDevices, lanScanning, lanLastScan, scanLan, refreshLan } = useNetworkToolsStore();
  const [expandedIp, setExpandedIp] = useState<string | null>(null);

  useEffect(() => {
    if (lanDevices.length === 0) scanLan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const online = lanDevices.filter(d => d.status === 'online').length;
  const offline = lanDevices.length - online;

  return (
    <div className="nt-panel">
      <div className="nt-panel-header">
        <div className="nt-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          LAN Devices
          {lanDevices.length > 0 && (
            <>
              <span className="nt-badge nt-badge-online">{online} online</span>
              <span className="nt-badge nt-badge-offline">{offline} offline</span>
            </>
          )}
        </div>
        <div className="nt-panel-actions">
          {lanLastScan > 0 && (
            <span className="text-sm text-muted">Last: {new Date(lanLastScan).toLocaleTimeString()}</span>
          )}
          <button className="btn btn-sm" onClick={refreshLan} disabled={lanScanning}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={scanLan} disabled={lanScanning}>
            {lanScanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {lanDevices.length === 0 && lanScanning && (
        <div className="text-sm text-muted" style={{ padding: 24, textAlign: 'center' }}>Scanning LAN...</div>
      )}

      {lanDevices.length > 0 && (
        <>
          {/* header */}
          <div className="nt-device-row" style={{ color: 'var(--text-secondary)', fontSize: 11, cursor: 'default' }}>
            <span />
            <span>Hostname</span>
            <span>IP</span>
            <span>Vendor</span>
            <span>Status</span>
            <span>Ports</span>
          </div>

          {lanDevices.map((d) => (
            <div key={d.ip}>
              <div className="nt-device-row" onClick={() => setExpandedIp(expandedIp === d.ip ? null : d.ip)}>
                <span style={{ color: 'var(--text-secondary)' }}>{vendorIcon(d.vendor)}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{d.hostname}</span>
                <span className="text-mono text-sm">{d.ip}</span>
                <span className="text-sm text-muted">{d.vendor}</span>
                <span>
                  <span className={`nt-dot nt-dot-${d.status}`} />
                </span>
                <span className="text-sm text-muted">{d.openPorts.length}</span>
              </div>
              {expandedIp === d.ip && (
                <div className="nt-device-detail">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><strong>MAC:</strong> {d.mac}</div>
                    <div><strong>Last Seen:</strong> {new Date(d.lastSeen).toLocaleString()}</div>
                    {d.openPorts.length > 0 && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Open Ports:</strong> {d.openPorts.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ========== DnsCachePanel ========== */

function DnsCachePanel() {
  const { dnsCache, dnsLoading, loadDnsCache, flushDnsCache } = useNetworkToolsStore();
  const [search, setSearch] = useState('');
  const [confirmFlush, setConfirmFlush] = useState(false);

  useEffect(() => {
    if (dnsCache.length === 0 && !dnsLoading) loadDnsCache();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!search.trim()) return dnsCache;
    const q = search.toLowerCase();
    return dnsCache.filter(e => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
  }, [dnsCache, search]);

  const handleFlush = async () => {
    if (!confirmFlush) { setConfirmFlush(true); return; }
    await flushDnsCache();
    setConfirmFlush(false);
  };

  return (
    <div className="nt-panel">
      <div className="nt-panel-header">
        <div className="nt-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          DNS Cache
          <span className="nt-badge nt-badge-online">{dnsCache.length} entries</span>
        </div>
        <div className="nt-panel-actions">
          <button className="btn btn-sm" onClick={loadDnsCache} disabled={dnsLoading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className={`btn btn-sm ${confirmFlush ? 'btn-danger' : ''}`} onClick={handleFlush}>
            <Trash2 size={14} /> {confirmFlush ? 'Confirm Flush' : 'Flush Cache'}
          </button>
        </div>
      </div>

      <div className="nt-dns-search">
        <input
          placeholder="Search by domain or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {dnsLoading && <div className="text-sm text-muted" style={{ padding: 16, textAlign: 'center' }}>Loading...</div>}

      {!dnsLoading && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px', gap: 8, padding: '6px 12px', color: 'var(--text-secondary)', fontSize: 11 }}>
            <span>Domain</span>
            <span>Type</span>
            <span>TTL</span>
            <span>Length</span>
          </div>
          {filtered.map((e, i) => (
            <div key={`${e.name}-${e.type}-${i}`} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px', gap: 8,
              padding: '6px 12px', borderRadius: 4, fontSize: 13,
              background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
            }}>
              <span className="text-mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
              <span><span className="nt-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', fontSize: 10 }}>{e.type}</span></span>
              <span className="text-mono text-sm">{e.ttl}s</span>
              <span className="text-mono text-sm">{e.length}B</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted" style={{ padding: 16, textAlign: 'center' }}>No matching entries</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========== BandwidthTopPanel ========== */

function BandwidthTopPanel() {
  const { bwProcesses, bwLoading, loadBwTop } = useNetworkToolsStore();

  useEffect(() => {
    if (bwProcesses.length === 0) loadBwTop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxBw = useMemo(() => {
    if (bwProcesses.length === 0) return 1;
    return Math.max(...bwProcesses.map(p => p.downloadSpeed + p.uploadSpeed), 1);
  }, [bwProcesses]);

  const totalDl = bwProcesses.reduce((s, p) => s + p.downloadSpeed, 0);
  const totalUl = bwProcesses.reduce((s, p) => s + p.uploadSpeed, 0);

  return (
    <div className="nt-panel">
      <div className="nt-panel-header">
        <div className="nt-panel-title">Bandwidth Top</div>
        <div className="nt-panel-actions">
          <div className="text-sm text-muted" style={{ display: 'flex', gap: 12 }}>
            <span>DL: <strong style={{ color: 'var(--accent)' }}>{fmtSpeed(totalDl)}</strong></span>
            <span>UL: <strong style={{ color: 'var(--green)' }}>{fmtSpeed(totalUl)}</strong></span>
          </div>
          <button className="btn btn-sm" onClick={loadBwTop} disabled={bwLoading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {bwLoading && <div className="text-sm text-muted" style={{ padding: 16, textAlign: 'center' }}>Loading...</div>}

      {!bwLoading && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 70px 90px 1fr', gap: 8, padding: '6px 12px', color: 'var(--text-secondary)', fontSize: 11 }}>
            <span>Process</span>
            <span>Download</span>
            <span>Upload</span>
            <span>Total</span>
            <span>Protocol</span>
            <span style={{ textAlign: 'right' }}>Usage</span>
          </div>
          {bwProcesses.map((p) => {
            const total = p.downloadSpeed + p.uploadSpeed;
            const pct = (total / maxBw) * 100;
            return (
              <div key={p.pid} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 70px 90px 1fr', gap: 8,
                padding: '8px 12px', borderRadius: 4, fontSize: 13, alignItems: 'center',
              }}>
                <span style={{ fontWeight: 500 }}>{p.processName}</span>
                <span className="text-mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{fmtSpeed(p.downloadSpeed)}</span>
                <span className="text-mono" style={{ fontSize: 12, color: 'var(--green)' }}>{fmtSpeed(p.uploadSpeed)}</span>
                <span className="text-mono text-sm">{p.totalBytes} MB</span>
                <span className="text-sm text-muted">{p.protocol}</span>
                <div className="nt-bw-bar">
                  <div className="nt-bw-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--green))' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========== SpeedHistoryPanel ========== */

function SpeedHistoryPanel() {
  const { speedHistory, speedStats, speedTopResults, loadSpeedHistory, clearSpeedHistory } = useNetworkToolsStore();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (speedHistory.length === 0) loadSpeedHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    return [...speedHistory].reverse().map((s, i) => ({
      name: i.toString(),
      download: s.download,
      upload: s.upload,
    }));
  }, [speedHistory]);

  const handleClear = async () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    await clearSpeedHistory();
    setConfirmClear(false);
  };

  return (
    <div className="nt-panel">
      <div className="nt-panel-header">
        <div className="nt-panel-title">Speed Test History</div>
        <div className="nt-panel-actions">
          <button className="btn btn-sm" onClick={loadSpeedHistory}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className={`btn btn-sm ${confirmClear ? 'btn-danger' : ''}`} onClick={handleClear}>
            <Trash2 size={14} /> {confirmClear ? 'Confirm Clear' : 'Clear History'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {speedStats && (
        <div className="nt-stat-cards">
          <div className="nt-stat-card">
            <div className="nt-stat-value" style={{ color: 'var(--accent)' }}>{speedStats.avgDownload.toFixed(1)}</div>
            <div className="nt-stat-label">Avg Download (Mbps)</div>
          </div>
          <div className="nt-stat-card">
            <div className="nt-stat-value" style={{ color: 'var(--green)' }}>{speedStats.avgUpload.toFixed(1)}</div>
            <div className="nt-stat-label">Avg Upload (Mbps)</div>
          </div>
          <div className="nt-stat-card">
            <div className="nt-stat-value" style={{ color: 'var(--yellow)' }}>{speedStats.avgPing.toFixed(0)}</div>
            <div className="nt-stat-label">Avg Ping (ms)</div>
          </div>
          <div className="nt-stat-card">
            <div className="nt-stat-value">{speedStats.count}</div>
            <div className="nt-stat-label">Total Tests</div>
          </div>
        </div>
      )}

      {/* Best records */}
      {speedTopResults && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {speedTopResults.maxDownload && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Best DL: <strong style={{ color: 'var(--accent)' }}>{speedTopResults.maxDownload.download.toFixed(1)}</strong> Mbps
              <span className="text-muted"> at {new Date(speedTopResults.maxDownload.timestamp).toLocaleString()}</span>
            </div>
          )}
          {speedTopResults.maxUpload && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Best UL: <strong style={{ color: 'var(--green)' }}>{speedTopResults.maxUpload.upload.toFixed(1)}</strong> Mbps
              <span className="text-muted"> at {new Date(speedTopResults.maxUpload.timestamp).toLocaleString()}</span>
            </div>
          )}
          {speedTopResults.minPing && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Best Ping: <strong style={{ color: 'var(--yellow)' }}>{speedTopResults.minPing.ping}</strong> ms
              <span className="text-muted"> at {new Date(speedTopResults.minPing.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="nt-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sp-dl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sp-ul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Area type="monotone" dataKey="download" stroke="var(--accent)" fill="url(#sp-dl)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="upload" stroke="var(--green)" fill="url(#sp-ul)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      {speedHistory.length === 0 && (
        <div className="text-sm text-muted" style={{ padding: 16, textAlign: 'center' }}>No test history yet. Run a speed test to start recording.</div>
      )}
      {speedHistory.map((s, i) => (
        <div key={`${s.timestamp}-${i}`} className="nt-speed-item">
          <div className="nt-speed-metrics">
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>DL </span>
              <span className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{s.download.toFixed(1)}</span>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UL </span>
              <span className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>{s.upload.toFixed(1)}</span>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ping </span>
              <span className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--yellow)' }}>{s.ping}</span>
            </div>
          </div>
          <span className="text-sm text-muted">{new Date(s.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ========== Main Tabs Container ========== */

export default function NetworkTools() {
  const [tab, setTab] = useState(0);
  const tabs = ['LAN Scan', 'DNS Cache', 'Bandwidth Top', 'Speed History'];

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: tab === i ? 600 : 400,
              color: tab === i ? 'var(--accent)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <LanScannerPanel />}
      {tab === 1 && <DnsCachePanel />}
      {tab === 2 && <BandwidthTopPanel />}
      {tab === 3 && <SpeedHistoryPanel />}
    </div>
  );
}
