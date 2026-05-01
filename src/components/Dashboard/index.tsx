import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Heart, MemoryStick, Monitor } from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useHardwareStore } from '../../stores/hardwareStore';
import { useHealthStore } from '../../stores/healthStore';

function getUsageColor(usage: number): string {
  if (usage >= 80) return 'var(--red)';
  if (usage >= 50) return 'var(--yellow)';
  return 'var(--green)';
}

function getTempColor(temp: number): string {
  if (temp >= 85) return 'var(--red)';
  if (temp >= 70) return 'var(--orange)';
  if (temp >= 55) return 'var(--yellow)';
  return 'var(--green)';
}

function formatBytes(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
  return `${gb.toFixed(1)} GB`;
}

function MiniSparkline({
  data,
  color,
  useLine,
}: {
  data: Array<{ val: number }>;
  color: string;
  useLine?: boolean;
}) {
  if (data.length < 2) return null;

  if (useLine) {
    return (
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="val"
          stroke={color}
          fill={`url(#grad-${color})`}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StatCardProps {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  value: string;
  unit: string;
  subtitle: string;
  color: string;
  history: Array<{ val: number }>;
  timestamp: string;
  useLine?: boolean;
}

function StatCard({
  title,
  icon: Icon,
  value,
  unit,
  subtitle,
  color,
  history,
  timestamp,
  useLine,
}: StatCardProps) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        <span style={{ color }}><Icon size={16} /></span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="stat-value">{value}</span>
          <span className="stat-unit">{unit}</span>
        </div>
        <div className="stat-label">{subtitle}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <MiniSparkline data={history} color={color} useLine={useLine} />
      </div>
      <div className="card-timestamp">{timestamp}</div>
    </div>
  );
}

function getHealthColor(score: number): string {
  if (score >= 90) return 'var(--green)';
  if (score >= 75) return 'var(--accent)';
  if (score >= 55) return 'var(--yellow)';
  if (score >= 35) return 'var(--orange)';
  return 'var(--red)';
}

export default function Dashboard() {
  const snapshot = useHardwareStore((s) => s.snapshot);
  const history = useHardwareStore((s) => s.history);
  const polling = useHardwareStore((s) => s.polling);
  const healthScore = useHealthStore((s) => s.score);
  const fetchHealth = useHealthStore((s) => s.fetchScore);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    if (snapshot) {
      setLastUpdated(
        new Date().toLocaleTimeString('en-US', { hour12: false })
      );
    }
  }, [snapshot]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (!snapshot) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100%' }}
      >
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const { cpu, memory, disks, gpu } = snapshot;

  const cpuHistory = history.slice(-30).map((v) => ({ val: v }));
  const memHistory = history.slice(-30).map(() => ({
    val: memory.usagePercent + (Math.random() - 0.5) * 2,
  }));
  const diskHistory = history.slice(-30).map(() => ({
    val: disks[0].usagePercent + (Math.random() - 0.5),
  }));
  const gpuHistory = history.slice(-30).map(() => ({
    val: gpu.usage + (Math.random() - 0.5) * 2,
  }));

  const timestamp = lastUpdated ? `Last updated: ${lastUpdated}` : '';

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h2>
        <div className="flex items-center gap-2">
          <span
            className={`pulse-dot${polling ? ' active' : ''}`}
          />
          <span className="text-sm text-muted text-mono">
            Polling: 1s interval
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          title="CPU Usage"
          icon={Cpu}
          value={cpu.usage.toFixed(1)}
          unit="%"
          subtitle={`${cpu.name} · ${cpu.temp}°C`}
          color={getUsageColor(cpu.usage)}
          history={cpuHistory}
          timestamp={timestamp}
          useLine
        />
        <StatCard
          title="Memory"
          icon={MemoryStick}
          value={memory.used.toFixed(1)}
          unit="GB"
          subtitle={`of ${memory.total} GB · ${memory.usagePercent.toFixed(1)}%`}
          color={getUsageColor(memory.usagePercent)}
          history={memHistory}
          timestamp={timestamp}
        />
        <StatCard
          title="Disk (C:)"
          icon={HardDrive}
          value={disks[0].used.toFixed(0)}
          unit="GB"
          subtitle={`of ${formatBytes(disks[0].total)} · ${disks[0].usagePercent}%`}
          color={getUsageColor(disks[0].usagePercent)}
          history={diskHistory}
          timestamp={timestamp}
        />
        <StatCard
          title="GPU"
          icon={Monitor}
          value={gpu.usage.toFixed(1)}
          unit="%"
          subtitle={`${gpu.name.split(' ').slice(-1)[0]} · ${gpu.temp}°C`}
          color={getUsageColor(gpu.usage)}
          history={gpuHistory}
          timestamp={timestamp}
        />
        {healthScore && (
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">Health Score</span>
              <span style={{ color: getHealthColor(healthScore.total) }}><Heart size={16} /></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={getHealthColor(healthScore.total)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - healthScore.total / 100)}
                  transform="rotate(-90 40 40)"
                />
                <text x="40" y="38" textAnchor="middle" dominantBaseline="central"
                  fill={getHealthColor(healthScore.total)} fontSize="20" fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {healthScore.total}
                </text>
                <text x="40" y="53" textAnchor="middle" dominantBaseline="central"
                  fill="var(--text-secondary)" fontSize="9" fontWeight="500"
                >
                  /100
                </text>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 600, color: getHealthColor(healthScore.total), marginTop: 4 }}>
                {healthScore.grade}
              </div>
            </div>
            <div className="stat-label" style={{ textAlign: 'center' }}>
              {healthScore.recommendations[0] || 'System healthy'}
            </div>
            <div className="card-timestamp">{timestamp}</div>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">CPU Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailItem label="Model" value={cpu.name} />
            <DetailItem label="Cores / Threads" value={`${cpu.cores} / ${cpu.threads}`} />
            <DetailItem label="Base Clock" value={`${cpu.baseClock} GHz`} />
            <DetailItem label="Current Clock" value={`${cpu.currentClock} GHz`} />
            <DetailItem label="Temperature" value={`${cpu.temp}°C`} />
            <DetailItem label="Power" value={`${cpu.power} W`} />
            <DetailItem label="Voltage" value={`${cpu.voltage} V`} />
            <DetailItem label="Usage" value={`${cpu.usage.toFixed(1)}%`} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">GPU Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailItem label="Model" value={gpu.name} />
            <DetailItem label="Usage" value={`${gpu.usage.toFixed(1)}%`} />
            <DetailItem label="VRAM" value={`${gpu.vramUsed.toFixed(1)} / ${gpu.vramTotal} GB`} />
            <DetailItem label="Temperature" value={`${gpu.temp}°C`} />
            <DetailItem label="Clock" value={`${gpu.clock} MHz`} />
            <DetailItem label="Power" value={`${gpu.power} W`} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Memory Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailItem label="Total" value={`${memory.total} GB`} />
            <DetailItem label="Used" value={`${memory.used.toFixed(1)} GB`} />
            <DetailItem label="Available" value={`${memory.available.toFixed(1)} GB`} />
            <DetailItem label="Speed" value={`${memory.speed} MHz`} />
            <DetailItem label="Type" value={memory.type} />
            <DetailItem label="Slots" value={String(memory.slots)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Memory Usage</span>
              <span className="text-sm text-mono">{memory.usagePercent.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${memory.usagePercent >= 80 ? 'red' : memory.usagePercent >= 50 ? 'yellow' : 'green'}`}
                style={{ width: `${memory.usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Storage</span>
          </div>
          {disks.map((disk) => (
            <div key={disk.name} style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{disk.name}</span>
                  <span className="text-sm text-muted" style={{ marginLeft: 8 }}>
                    {disk.model}
                  </span>
                </div>
                <span className="text-sm text-mono">{disk.usagePercent}%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 4 }}>
                <div
                  className={`progress-bar-fill ${disk.usagePercent >= 80 ? 'red' : disk.usagePercent >= 50 ? 'yellow' : 'green'}`}
                  style={{ width: `${disk.usagePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {disk.used} GB / {formatBytes(disk.total)} · {disk.type}
                </span>
                <span className="text-sm text-muted">
                  {disk.temp}°C · {disk.health}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
        {label}
      </div>
      <div className="text-mono" style={{ fontSize: 13 }}>
        {value}
      </div>
    </div>
  );
}
