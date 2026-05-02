import { useState, useEffect, useRef } from 'react';
import { Wifi, Network, Bluetooth, Activity, Gauge, Globe } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useNetworkStore } from '../../stores/networkStore';
import NetworkTools from './networkTools';
import type { NetworkInterface } from '../../utils/types';

const IFACE_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  ethernet: Network,
  wifi: Wifi,
  bluetooth: Bluetooth,
  virtual: Activity,
};

const STATUS_COLOR: Record<string, string> = {
  connected: 'var(--green)',
  disconnected: 'var(--red)',
  limited: 'var(--yellow)',
};

export default function NetworkView() {
  const { interfaces, traffic, speedTest, speedTestRunning, fetchInterfaces, fetchTraffic, runSpeedTest } = useNetworkStore();
  const [dlHistory, setDlHistory] = useState<Array<{ val: number }>>([]);
  const [ulHistory, setUlHistory] = useState<Array<{ val: number }>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchInterfaces();
    fetchTraffic();
    const id = setInterval(() => {
      fetchInterfaces();
      fetchTraffic();
    }, 2000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [fetchInterfaces, fetchTraffic]);

  useEffect(() => {
    if (traffic) {
      setDlHistory((prev) => [...prev.slice(-30), { val: traffic.downloadSpeed }]);
      setUlHistory((prev) => [...prev.slice(-30), { val: traffic.uploadSpeed }]);
    }
  }, [traffic]);

  const activeIface = interfaces.find((i) => i.status === 'connected');

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Network Monitor</h2>
        <div className="flex items-center gap-2">
          <span className="pulse-dot active" />
          <span className="text-sm text-muted text-mono">Polling: 2s interval</span>
        </div>
      </div>

      {/* Interface Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {interfaces.map((iface) => (
          <InterfaceCard key={iface.name} iface={iface} />
        ))}
      </div>

      {/* Live Traffic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Download Speed</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="stat-value">{traffic?.downloadSpeed.toFixed(1) ?? '--'}</span>
            <span className="stat-unit">Mbps</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={dlHistory}>
                <defs>
                  <linearGradient id="dl-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="var(--accent)" fill="url(#dl-grad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="stat-label">Total: {traffic?.totalDownload.toFixed(1) ?? '--'} GB</div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Upload Speed</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="stat-value">{traffic?.uploadSpeed.toFixed(1) ?? '--'}</span>
            <span className="stat-unit">Mbps</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={ulHistory}>
                <defs>
                  <linearGradient id="ul-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="var(--green)" fill="url(#ul-grad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="stat-label">Total: {traffic?.totalUpload.toFixed(1) ?? '--'} GB</div>
        </div>
      </div>

      {/* Speed Test + Active Connections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Speed Test</span></div>
          {speedTest && (
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div>
                <div className="text-sm text-muted">Download</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{speedTest.download}</div>
                <div className="text-sm text-muted">Mbps</div>
              </div>
              <div>
                <div className="text-sm text-muted">Upload</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{speedTest.upload}</div>
                <div className="text-sm text-muted">Mbps</div>
              </div>
              <div>
                <div className="text-sm text-muted">Ping</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>{speedTest.ping}</div>
                <div className="text-sm text-muted">ms</div>
              </div>
            </div>
          )}
          <button className="btn btn-primary" onClick={runSpeedTest} disabled={speedTestRunning}>
            {speedTestRunning ? (
              <><span className="spin" style={{ display: 'inline-block' }}>⏳</span> Testing...</>
            ) : (
              <><Gauge size={16} /> Run Speed Test</>
            )}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Active Connections</span></div>
          <div className="stat-value">{traffic?.activeConnections ?? '--'}</div>
          <div className="stat-label">Current TCP/UDP connections</div>
        </div>
      </div>

      {/* WiFi Details */}
      {activeIface?.type === 'wifi' && activeIface.ssid && (
        <div className="card">
          <div className="card-header"><span className="card-title">Wi-Fi Details</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div className="text-sm text-muted" style={{ marginBottom: 2 }}>SSID</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{activeIface.ssid}</div>
            </div>
            <div>
              <div className="text-sm text-muted" style={{ marginBottom: 2 }}>Signal Strength</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${activeIface.signalStrength ?? 0}%`, borderRadius: 4,
                    background: (activeIface.signalStrength ?? 0) >= 60 ? 'var(--green)' : (activeIface.signalStrength ?? 0) >= 30 ? 'var(--yellow)' : 'var(--red)',
                  }} />
                </div>
                <span className="text-mono" style={{ fontSize: 12 }}>{activeIface.signalStrength}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted" style={{ marginBottom: 2 }}>Speed</div>
              <span className="text-mono" style={{ fontSize: 14 }}>{activeIface.speed} Mbps</span>
            </div>
          </div>
        </div>
      )}

      {/* Network Tools — Phase D: LAN Scan, DNS Cache, Bandwidth Top, Speed History */}
      <NetworkTools />
    </div>
  );
}

function InterfaceCard({ iface }: { iface: NetworkInterface }) {
  const Icon = IFACE_ICON[iface.type] || Globe;
  const statusColor = STATUS_COLOR[iface.status] || 'var(--text-secondary)';
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{iface.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
          <span style={{ fontSize: 11, color: statusColor, textTransform: 'capitalize' }}>{iface.status}</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{ color: 'var(--text-secondary)' }}><Icon size={18} /></span>
        <span className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{iface.type}</span>
        <span className="text-sm text-muted">{iface.speed} Mbps</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <DetailItem label="IP Address" value={iface.ipAddress} />
        <DetailItem label="Gateway" value={iface.gateway} />
        <DetailItem label="Subnet" value={iface.subnet} />
        <DetailItem label="MAC" value={iface.macAddress} />
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div className="text-mono" style={{ fontSize: 12 }}>{value}</div>
    </div>
  );
}
