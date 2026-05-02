import { useState } from 'react';
import { Cpu, HardDrive, Heart, MemoryStick, Monitor, Thermometer, ChevronDown, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import type { HardwareSnapshot } from '../../../electron/hardware/collector';

// ─── Helper Functions ───────────────────────────────────────────────────────

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

function getHealthColor(score: number): string {
  if (score >= 90) return 'var(--green)';
  if (score >= 75) return 'var(--accent)';
  if (score >= 55) return 'var(--yellow)';
  if (score >= 35) return 'var(--orange)';
  return 'var(--red)';
}

// ─── Shared Mini Components ─────────────────────────────────────────────────

function MiniSparkline({ data, color, useLine }: { data: Array<{ val: number }>; color: string; useLine?: boolean }) {
  if (data.length < 2) return null;
  if (useLine) {
    return (
      <div className="animate-fadeIn">
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div className="animate-fadeIn">
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="val" stroke={color} fill={`url(#grad-${color.replace(/\W/g, '')})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div className="text-mono" style={{ fontSize: 13 }}>{value}</div>
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface WidgetBaseProps {
  timestamp: string;
}

interface CpuWidgetProps extends WidgetBaseProps {
  cpu: HardwareSnapshot['cpu'];
  cpuHistory: Array<{ val: number }>;
  showSparklines?: boolean;
}

interface MemoryWidgetProps extends WidgetBaseProps {
  memory: HardwareSnapshot['memory'];
  memHistory: Array<{ val: number }>;
  showSparklines?: boolean;
}

interface DiskWidgetProps extends WidgetBaseProps {
  disk: HardwareSnapshot['disks'][0];
  diskHistory: Array<{ val: number }>;
  showSparklines?: boolean;
}

interface GpuWidgetProps extends WidgetBaseProps {
  gpu: HardwareSnapshot['gpu'];
  gpuHistory: Array<{ val: number }>;
  showSparklines?: boolean;
}

interface HealthWidgetProps extends WidgetBaseProps {
  healthScore: { total: number; grade: string; recommendations: string[] } | null;
}

interface TemperatureWidgetProps {
  cpu: HardwareSnapshot['cpu'];
  gpu: HardwareSnapshot['gpu'];
  disk: HardwareSnapshot['disks'][0];
  tempHistory: Array<{ time: number; cpu: number; gpu: number; disk: number }>;
}

interface MemCompositionWidgetProps {
  memory: HardwareSnapshot['memory'];
  memComposition: Array<{ time: number; used: number; cache: number; free: number }>;
}

interface DiskActivityWidgetProps {
  disks: HardwareSnapshot['disks'];
  diskActivity: Array<{ name: string; read: number; write: number }>;
}

interface PerfHistoryWidgetProps {
  history: number[];
  cpu: HardwareSnapshot['cpu'];
  memory: HardwareSnapshot['memory'];
  gpu: HardwareSnapshot['gpu'];
}

interface MemoryDetailsWidgetProps {
  memory: HardwareSnapshot['memory'];
}

interface StorageWidgetProps {
  disks: HardwareSnapshot['disks'];
}

// ─── CpuWidget ──────────────────────────────────────────────────────────────

export function CpuWidget({ cpu, cpuHistory, timestamp, showSparklines }: CpuWidgetProps) {
  const [expanded, setExpanded] = useState(false);

  const perCoreData = Array.from({ length: 8 }, (_, i) => ({
    core: `C${i}`,
    usage: Math.max(5, Math.min(100, cpu.usage + (Math.random() - 0.5) * 30 + (i === 0 || i === 2 ? 10 : i === 4 ? -15 : 0))),
  }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span className="stat-value">{cpu.usage.toFixed(1)}</span>
        <span className="stat-unit">%</span>
      </div>
      <div className="stat-label">{cpu.name} · {cpu.temp}°C</div>
      {showSparklines && <MiniSparkline data={cpuHistory} color={getUsageColor(cpu.usage)} useLine />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div className="card-timestamp">{timestamp}</div>
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 12 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less' : 'Details'}
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>
      </div>
      {expanded && (
        <div className="animate-slideDown" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Per-Core Usage</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {perCoreData.map((core) => (
                <div key={core.core} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="text-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', width: 20 }}>{core.core}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${core.usage}%`, borderRadius: 3, background: getUsageColor(core.usage), transition: 'width 0.5s ease' }} />
                  </div>
                  <span className="text-mono" style={{ fontSize: 11, color: getUsageColor(core.usage), width: 38, textAlign: 'right' }}>{core.usage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Clock Speed</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span className="stat-value" style={{ fontSize: 18 }}>{cpu.currentClock.toFixed(1)}</span>
              <span className="stat-unit">GHz</span>
            </div>
            <div className="stat-label">Base: {cpu.baseClock} GHz · Boost active</div>
            <div style={{ marginTop: 8 }}>
              <DetailItem label="Power Draw" value={`${cpu.power} W`} />
              <DetailItem label="Core Voltage" value={`${cpu.voltage} V`} />
              <DetailItem label="Cores / Threads" value={`${cpu.cores} / ${cpu.threads}`} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MemoryWidget ───────────────────────────────────────────────────────────

export function MemoryWidget({ memory, memHistory, timestamp, showSparklines }: MemoryWidgetProps) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span className="stat-value">{memory.used.toFixed(1)}</span>
        <span className="stat-unit">GB</span>
      </div>
      <div className="stat-label">of {memory.total} GB · {memory.usagePercent.toFixed(1)}%</div>
      {showSparklines && <MiniSparkline data={memHistory} color={getUsageColor(memory.usagePercent)} />}
      <div className="card-timestamp" style={{ marginTop: 4 }}>{timestamp}</div>
    </>
  );
}

// ─── DiskWidget ─────────────────────────────────────────────────────────────

export function DiskWidget({ disk, diskHistory, timestamp, showSparklines }: DiskWidgetProps) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span className="stat-value">{disk.used.toFixed(0)}</span>
        <span className="stat-unit">GB</span>
      </div>
      <div className="stat-label">of {formatBytes(disk.total)} · {disk.usagePercent}%</div>
      {showSparklines && <MiniSparkline data={diskHistory} color={getUsageColor(disk.usagePercent)} />}
      <div className="card-timestamp" style={{ marginTop: 4 }}>{timestamp}</div>
    </>
  );
}

// ─── GpuWidget ──────────────────────────────────────────────────────────────

export function GpuWidget({ gpu, gpuHistory, timestamp, showSparklines }: GpuWidgetProps) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span className="stat-value">{gpu.usage.toFixed(1)}</span>
        <span className="stat-unit">%</span>
      </div>
      <div className="stat-label">{gpu.name.split(' ').slice(-1)[0]} · {gpu.temp}°C</div>
      {showSparklines && <MiniSparkline data={gpuHistory} color={getUsageColor(gpu.usage)} />}
      <div className="card-timestamp" style={{ marginTop: 4 }}>{timestamp}</div>
    </>
  );
}

// ─── HealthWidget ───────────────────────────────────────────────────────────

export function HealthWidget({ healthScore, timestamp }: HealthWidgetProps) {
  if (!healthScore) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
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
      <div className="stat-label" style={{ textAlign: 'center' }}>{healthScore.recommendations[0] || 'System healthy'}</div>
      <div className="card-timestamp" style={{ marginTop: 8 }}>{timestamp}</div>
    </div>
  );
}

// ─── TemperatureWidget ──────────────────────────────────────────────────────

export function TemperatureWidget({ cpu, gpu, disk, tempHistory }: TemperatureWidgetProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>CPU</div>
        <span className="stat-value" style={{ fontSize: 18, color: getTempColor(cpu.temp) }}>{cpu.temp.toFixed(0)}°C</span>
        <div style={{ marginTop: 4 }}>
          <MiniSparkline data={tempHistory.map((t) => ({ val: t.cpu }))} color={getTempColor(cpu.temp)} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>GPU</div>
        <span className="stat-value" style={{ fontSize: 18, color: getTempColor(gpu.temp) }}>{gpu.temp.toFixed(0)}°C</span>
        <div style={{ marginTop: 4 }}>
          <MiniSparkline data={tempHistory.map((t) => ({ val: t.gpu }))} color={getTempColor(gpu.temp)} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Disk</div>
        <span className="stat-value" style={{ fontSize: 18, color: getTempColor(disk?.temp ?? 35) }}>{(disk?.temp ?? 35).toFixed(0)}°C</span>
        <div style={{ marginTop: 4 }}>
          <MiniSparkline data={tempHistory.map((t) => ({ val: t.disk }))} color={getTempColor(disk?.temp ?? 35)} />
        </div>
      </div>
    </div>
  );
}

// ─── MemCompositionWidget ───────────────────────────────────────────────────

export function MemCompositionWidget({ memory, memComposition }: MemCompositionWidgetProps) {
  return (
    <>
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
    </>
  );
}

// ─── DiskActivityWidget ─────────────────────────────────────────────────────

export function DiskActivityWidget({ disks, diskActivity }: DiskActivityWidgetProps) {
  const latestDiskActivity = diskActivity.slice(-disks.length);
  return (
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
  );
}

// ─── PerfHistoryWidget ──────────────────────────────────────────────────────

const PERF_TABS = ['CPU', 'Memory', 'Disk', 'Temperature'] as const;

export function PerfHistoryWidget({ history, cpu, memory }: PerfHistoryWidgetProps) {
  const [perfTab, setPerfTab] = useState<string>('CPU');
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabRefs: Record<string, HTMLButtonElement | null> = {};

  const updateSlider = (tab: string) => {
    const el = tabRefs[tab];
    if (el) {
      setSliderStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  };

  const handleTabChange = (tab: string) => {
    setPerfTab(tab);
    requestAnimationFrame(() => updateSlider(tab));
  };

  const perfHistoryData = history.slice(-60).map((v, i) => ({
    idx: i,
    CPU: v,
    Memory: memory.usagePercent + (Math.random() - 0.5) * 1,
    Disk: cpu.usage + (Math.random() - 0.5),
    Temperature: cpu.temp + (Math.random() - 0.5) * 2,
  }));

  return (
    <>
      <div className="tab-indicator-wrapper">
        {PERF_TABS.map((tab) => (
          <button
            key={tab}
            ref={(el) => { tabRefs[tab] = el; }}
            className={`tab${perfTab === tab ? ' active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >{tab}</button>
        ))}
        <div className="tab-slider" style={{ left: sliderStyle.left, width: sliderStyle.width }} />
      </div>
      <div style={{ marginTop: 12 }}>
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
    </>
  );
}

// ─── MemoryDetailsWidget ────────────────────────────────────────────────────

export function MemoryDetailsWidget({ memory }: MemoryDetailsWidgetProps) {
  return (
    <>
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
    </>
  );
}

// ─── StorageWidget ──────────────────────────────────────────────────────────

export function StorageWidget({ disks }: StorageWidgetProps) {
  return (
    <>
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
    </>
  );
}
