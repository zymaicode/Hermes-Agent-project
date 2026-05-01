import { useEffect } from 'react';
import {
  Battery, Plug, Zap, Thermometer, Clock,
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useBatteryStore } from '../../stores/batteryStore';

function batteryIcon(percent: number) {
  if (percent > 80) return <BatteryFull size={48} style={{ color: 'var(--green)' }} />;
  if (percent > 40) return <BatteryMedium size={48} style={{ color: 'var(--yellow)' }} />;
  if (percent > 15) return <BatteryLow size={48} style={{ color: 'var(--orange)' }} />;
  return <BatteryWarning size={48} style={{ color: 'var(--red)' }} />;
}

function chargeColor(percent: number): string {
  if (percent > 60) return 'var(--green)';
  if (percent > 20) return 'var(--yellow)';
  return 'var(--red)';
}

function healthColor(health: string): string {
  switch (health) {
    case 'excellent': return 'var(--green)';
    case 'good': return 'var(--accent)';
    case 'fair': return 'var(--yellow)';
    case 'poor': return 'var(--red)';
    default: return 'var(--text-secondary)';
  }
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function BatteryView() {
  const status = useBatteryStore((s) => s.status);
  const history = useBatteryStore((s) => s.history);
  const loading = useBatteryStore((s) => s.loading);
  const noBattery = useBatteryStore((s) => s.noBattery);
  const fetchStatus = useBatteryStore((s) => s.fetchStatus);
  const fetchHistory = useBatteryStore((s) => s.fetchHistory);

  useEffect(() => { fetchStatus(); fetchHistory(); }, [fetchStatus, fetchHistory]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Checking battery...
      </div>
    );
  }

  if (noBattery || !status) {
    return (
      <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Plug size={64} style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Battery Report</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No battery detected — desktop system</p>
      </div>
    );
  }

  const chartData = history.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    charge: p.chargePercent,
    capacity: p.capacity,
  }));

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Battery Report</h2>
        <div className="flex items-center gap-2">
          <Battery size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{status.manufacturer}</span>
        </div>
      </div>

      {/* Main battery card */}
      <div className="card" style={{ padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 32 }}>
        {batteryIcon(status.chargePercent)}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: chargeColor(status.chargePercent) }}>
            {status.chargePercent}%
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
            <span className="flex items-center gap-1" style={{ fontSize: 13, color: status.acConnected ? 'var(--green)' : 'var(--orange)' }}>
              {status.acConnected ? <Plug size={14} /> : <Zap size={14} />}
              {status.acConnected ? 'Charging' : 'Discharging'}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <Clock size={14} />
              {status.chargePercent === 100 ? '∞' : status.estimatedRemaining} remaining
            </span>
          </div>
          {status.estimatedFullCharge && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Full charge in ~{status.estimatedFullCharge}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Health</div>
          <span style={{
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            padding: '4px 12px', borderRadius: 12,
            background: healthColor(status.health) + '22', color: healthColor(status.health),
          }}>
            {status.health}
          </span>
        </div>
      </div>

      {/* Capacity bars */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Battery Capacity</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Design Capacity</div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'var(--blue)', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{status.capacity.design.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>mWh</span></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Full Charge Capacity</div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(status.capacity.fullCharge / status.capacity.design) * 100}%`, background: 'var(--green)', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{status.capacity.fullCharge.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>mWh</span></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Capacity</div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(status.capacity.current / status.capacity.design) * 100}%`, background: 'var(--accent)', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{status.capacity.current.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>mWh</span></div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Wear Level: </span>
          <span style={{ color: status.capacity.wearLevel > 30 ? 'var(--red)' : status.capacity.wearLevel > 15 ? 'var(--yellow)' : 'var(--green)', fontWeight: 600 }}>
            {status.capacity.wearLevel}% worn ({status.capacity.design - status.capacity.fullCharge} mWh lost)
          </span>
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Cycle Count: </span>
          <span style={{ fontWeight: 600 }}>{status.cycleCount}</span>
        </div>
      </div>

      {/* Detailed stats grid */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Detailed Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 24px', fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Voltage:</span>{' '}
            <span className="text-mono">{(status.voltage / 1000).toFixed(1)} V</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Temperature:</span>{' '}
            <span className="text-mono">{status.temperature}°C</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Charge Rate:</span>{' '}
            <span className="text-mono">{(status.chargeRate / 1000).toFixed(1)} W</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Discharge Rate:</span>{' '}
            <span className="text-mono">{(status.dischargeRate / 1000).toFixed(1)} W</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Chemistry:</span>{' '}
            <span>{status.chemistry}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Manufacturer:</span>{' '}
            <span>{status.manufacturer}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Serial Number:</span>{' '}
            <span className="text-mono">{status.serialNumber}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Manufacture Date:</span>{' '}
            <span>{status.manufactureDate}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>AC Connected:</span>{' '}
            <span style={{ color: status.acConnected ? 'var(--green)' : 'var(--text-secondary)' }}>
              {status.acConnected ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* History chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Charge History (12 Hours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="chargeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} unit="%" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Area type="monotone" dataKey="charge" stroke="var(--green)" fill="url(#chargeFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
