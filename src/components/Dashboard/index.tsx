import { useState, useEffect, useMemo, useRef } from 'react';
import { Cpu, HardDrive, Heart, MemoryStick, Monitor, Thermometer, ChevronDown, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
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

function MiniSparkline({ data, color, useLine }: { data: Array<{ val: number }>; color: string; useLine?: boolean }) {
  if (data.length < 2) return null;
  if (useLine) {
    return (
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
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
        <Area type="monotone" dataKey="val" stroke={color} fill={`url(#grad-${color})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatCard({ title, icon: Icon, value, unit, subtitle, color, history, timestamp, useLine, onClick, expanded }: {
  title: string; icon: React.ComponentType<{ size?: number }>; value: string; unit: string; subtitle: string;
  color: string; history: Array<{ val: number }>; timestamp: string; useLine?: boolean;
  onClick?: () => void; expanded?: boolean;
}) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color }}><Icon size={16} /></span>
          {onClick && (expanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />)}
        </div>
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div className="text-mono" style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

const PERF_TABS = ['CPU', 'Memory', 'Disk', 'Temperature'] as const;

export default function Dashboard() {
  const snapshot = useHardwareStore((s) => s.snapshot);
  const history = useHardwareStore((s) => s.history);
  const polling = useHardwareStore((s) => s.polling);
  const healthScore = useHealthStore((s) => s.score);
  const fetchHealth = useHealthStore((s) => s.fetchScore);
  const [lastUpdated, setLastUpdated] = useState('');
  const [cpuExpanded, setCpuExpanded] = useState(false);
  const [perfTab, setPerfTab] = useState<string>('CPU');
  const [tempHistory, setTempHistory] = useState<Array<{ time: number; cpu: number; gpu: number; disk: number }>>([]);
  const [diskActivity, setDiskActivity] = useState<Array<{ name: string; read: number; write: number }>>([]);
  const [memComposition, setMemComposition] = useState<Array<{ time: number; used: number; cache: number; free: number }>>([]);
  const tickRef = useRef(0);

  useEffect(() => {
    if (snapshot) {
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }
  }, [snapshot]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    if (!snapshot) return;
    tickRef.current++;
    const t = tickRef.current;
    setTempHistory((prev) => {
      const next = [...prev, { time: t, cpu: snapshot.cpu.temp + (Math.random() - 0.5) * 4, gpu: snapshot.gpu.temp + (Math.random() - 0.5) * 4, disk: (snapshot.disks[0]?.temp ?? 35) + (Math.random() - 0.5) * 2 }];
      return next.slice(-60);
    });
    setDiskActivity((prev) => {
      const next = [...prev];
      for (const disk of snapshot.disks) {
        const read = Math.max(0, 50 + Math.random() * 400 - (disk.usagePercent * 2));
        const write = Math.max(0, 10 + Math.random() * 200 - (disk.usagePercent * 1.5));
        next.push({ name: disk.name, read: Math.round(read), write: Math.round(write) });
      }
      return next.slice(-60);
    });
    setMemComposition((prev) => {
      const cache = Math.round((snapshot.memory.total - snapshot.memory.used - snapshot.memory.available) * 10) / 10;
      const used = snapshot.memory.used - cache;
      const next = [...prev, { time: t, used: Math.max(0, used), cache: Math.max(0, cache), free: snapshot.memory.available }];
      return next.slice(-60);
    });
  }, [snapshot]);

  const perfHistoryData = useMemo(() => {
    if (!snapshot) return [];
    const h = history.slice(-60).map((v, i) => ({ idx: i, CPU: v, Memory: snapshot.memory.usagePercent + (Math.random() - 0.5) * 1, Disk: (snapshot.disks[0]?.usagePercent ?? 50) + (Math.random() - 0.5), Temperature: snapshot.cpu.temp + (Math.random() - 0.5) * 2 }));
    return h;
  }, [history, snapshot]);

  const perCoreData = useMemo(() => {
    if (!snapshot) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      core: `C${i}`,
      usage: Math.max(5, Math.min(100, snapshot.cpu.usage + (Math.random() - 0.5) * 30 + (i === 0 || i === 2 ? 10 : i === 4 ? -15 : 0))),
    }));
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const { cpu, memory, disks, gpu } = snapshot;
  const cpuHistory = history.slice(-30).map((v) => ({ val: v }));
  const memHistory = history.slice(-30).map(() => ({ val: memory.usagePercent + (Math.random() - 0.5) * 2 }));
  const diskHistory = history.slice(-30).map(() => ({ val: disks[0].usagePercent + (Math.random() - 0.5) }));
  const gpuHistory = history.slice(-30).map(() => ({ val: gpu.usage + (Math.random() - 0.5) * 2 }));
  const timestamp = lastUpdated ? `Last updated: ${lastUpdated}` : '';
  const latestDiskActivity = diskActivity.slice(-snapshot.disks.length);

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className={`pulse-dot${polling ? ' active' : ''}`} />
          <span className="text-sm text-muted text-mono">Polling: 1s interval</span>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="CPU Usage" icon={Cpu} value={cpu.usage.toFixed(1)} unit="%"
          subtitle={`${cpu.name} · ${cpu.temp}°C`} color={getUsageColor(cpu.usage)}
          history={cpuHistory} timestamp={timestamp} useLine
          onClick={() => setCpuExpanded(!cpuExpanded)} expanded={cpuExpanded}
        />
        <StatCard title="Memory" icon={MemoryStick} value={memory.used.toFixed(1)} unit="GB"
          subtitle={`of ${memory.total} GB · ${memory.usagePercent.toFixed(1)}%`}
          color={getUsageColor(memory.usagePercent)} history={memHistory} timestamp={timestamp}
        />
        <StatCard title="Disk (C:)" icon={HardDrive} value={disks[0].used.toFixed(0)} unit="GB"
          subtitle={`of ${formatBytes(disks[0].total)} · ${disks[0].usagePercent}%`}
          color={getUsageColor(disks[0].usagePercent)} history={diskHistory} timestamp={timestamp}
        />
        <StatCard title="GPU" icon={Monitor} value={gpu.usage.toFixed(1)} unit="%"
          subtitle={`${gpu.name.split(' ').slice(-1)[0]} · ${gpu.temp}°C`}
          color={getUsageColor(gpu.usage)} history={gpuHistory} timestamp={timestamp}
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
                <circle cx="40" cy="40" r="32" fill="none" stroke={getHealthColor(healthScore.total)} strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - healthScore.total / 100)} transform="rotate(-90 40 40)" />
                <text x="40" y="38" textAnchor="middle" dominantBaseline="central"
                  fill={getHealthColor(healthScore.total)} fontSize="20" fontWeight="700" fontFamily="var(--font-mono)">
                  {healthScore.total}
                </text>
                <text x="40" y="53" textAnchor="middle" dominantBaseline="central"
                  fill="var(--text-secondary)" fontSize="9" fontWeight="500">/100</text>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 600, color: getHealthColor(healthScore.total), marginTop: 4 }}>{healthScore.grade}</div>
            </div>
            <div className="stat-label" style={{ textAlign: 'center' }}>{healthScore.recommendations[0] || 'System healthy'}</div>
            <div className="card-timestamp">{timestamp}</div>
          </div>
        )}
      </div>

      {/* CPU Expanded Detail Panel */}
      {cpuExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Per-Core Usage</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {perCoreData.map((core) => (
                <div key={core.core} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="text-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', width: 24 }}>{core.core}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${core.usage}%`, borderRadius: 4, background: getUsageColor(core.usage), transition: 'width 0.5s ease' }} />
                  </div>
                  <span className="text-mono" style={{ fontSize: 11, color: getUsageColor(core.usage), width: 44, textAlign: 'right' }}>{core.usage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Clock Speed</span></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span className="stat-value">{cpu.currentClock.toFixed(1)}</span>
              <span className="stat-unit">GHz</span>
            </div>
            <div className="stat-label">Base: {cpu.baseClock} GHz · Boost active</div>
            <div style={{ marginTop: 12 }}>
              <DetailItem label="Power Draw" value={`${cpu.power} W`} />
              <DetailItem label="Core Voltage" value={`${cpu.voltage} V`} />
              <DetailItem label="Cores / Threads" value={`${cpu.cores} / ${cpu.threads}`} />
            </div>
          </div>
        </div>
      )}

      {/* Temperature Overview Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <TempCard label="CPU Temperature" value={`${cpu.temp.toFixed(0)}°C`} history={tempHistory.map((t) => ({ val: t.cpu }))} color={getTempColor(cpu.temp)} icon={Thermometer} />
        <TempCard label="GPU Temperature" value={`${gpu.temp.toFixed(0)}°C`} history={tempHistory.map((t) => ({ val: t.gpu }))} color={getTempColor(gpu.temp)} icon={Thermometer} />
        <TempCard label="Disk Temperature" value={`${(disks[0]?.temp ?? 35).toFixed(0)}°C`} history={tempHistory.map((t) => ({ val: t.disk }))} color={getTempColor(disks[0]?.temp ?? 35)} icon={Thermometer} />
      </div>

      {/* Memory Composition + Disk Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Memory Composition</span></div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={memComposition.slice(-60)}>
              <defs>
                <linearGradient id="mem-used" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient>
                <linearGradient id="mem-cache" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--yellow)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--yellow)" stopOpacity={0} /></linearGradient>
                <linearGradient id="mem-free" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--green)" stopOpacity={0} /></linearGradient>
              </defs>
              <Area type="monotone" dataKey="used" stackId="1" stroke="var(--accent)" fill="url(#mem-used)" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="cache" stackId="1" stroke="var(--yellow)" fill="url(#mem-cache)" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="free" stackId="1" stroke="var(--green)" fill="url(#mem-free)" strokeWidth={1} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            <LegendItem color="var(--accent)" label={`Used ${memory.used.toFixed(1)} GB`} />
            <LegendItem color="var(--yellow)" label={`Cache ${Math.max(0, memory.total - memory.used - memory.available).toFixed(1)} GB`} />
            <LegendItem color="var(--green)" label={`Free ${memory.available.toFixed(1)} GB`} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Disk Activity</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {latestDiskActivity.map((act) => (
              <div key={act.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Disk {act.name}</span>
                  <span className="text-sm text-muted">Read {act.read} MB/s · Write {act.write} MB/s</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm text-muted" style={{ marginBottom: 2 }}>Read</div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, act.read / 5)}%`, borderRadius: 3, background: 'var(--accent)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm text-muted" style={{ marginBottom: 2 }}>Write</div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, act.write / 3)}%`, borderRadius: 3, background: 'var(--green)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance History Tabs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Performance History</span>
        </div>
        <div className="tabs" style={{ marginBottom: 12 }}>
          {PERF_TABS.map((tab) => (
            <button key={tab} className={`tab${perfTab === tab ? ' active' : ''}`} onClick={() => setPerfTab(tab)}>{tab}</button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={perfHistoryData}>
            <defs>
              <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="idx" hide />
            <YAxis domain={perfTab === 'Temperature' ? [20, 100] : [0, 100]} hide />
            <Tooltip
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              formatter={(value: number) => [`${value.toFixed(1)}${perfTab === 'Temperature' ? '°C' : '%'}`, perfTab]}
            />
            <Area type="monotone" dataKey={perfTab} stroke="var(--accent)" fill="url(#perf-grad)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* System Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Memory Details</span></div>
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
              <div className={`progress-bar-fill ${memory.usagePercent >= 80 ? 'red' : memory.usagePercent >= 50 ? 'yellow' : 'green'}`}
                style={{ width: `${memory.usagePercent}%` }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Storage</span></div>
          {disks.map((disk) => (
            <div key={disk.name} style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{disk.name}</span>
                  <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{disk.model}</span>
                </div>
                <span className="text-sm text-mono">{disk.usagePercent}%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 4 }}>
                <div className={`progress-bar-fill ${disk.usagePercent >= 80 ? 'red' : disk.usagePercent >= 50 ? 'yellow' : 'green'}`}
                  style={{ width: `${disk.usagePercent}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{disk.used} GB / {formatBytes(disk.total)} · {disk.type}</span>
                <span className="text-sm text-muted">{disk.temp}°C · {disk.health}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TempCard({ label, value, history, color, icon: Icon }: { label: string; value: string; history: Array<{ val: number }>; color: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{label}</span>
        <span style={{ color }}><Icon size={16} /></span>
      </div>
      <span className="stat-value" style={{ color }}>{value}</span>
      <div style={{ marginTop: 8 }}>
        <MiniSparkline data={history} color={color} />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}
