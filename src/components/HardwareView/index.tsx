import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Cpu, MemoryStick, HardDrive, Monitor, CircuitBoard } from 'lucide-react';
import { useHardwareStore } from '../../stores/hardwareStore';
import { LoadingSpinner } from '../common/LoadingState';
import type { HardwareSnapshot } from '../../utils/types';

type HardwareTab = 'cpu' | 'memory' | 'disk' | 'gpu' | 'motherboard';

const TABS: { id: HardwareTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'cpu', label: 'CPU', icon: Cpu },
  { id: 'memory', label: 'Memory', icon: MemoryStick },
  { id: 'disk', label: 'Disk', icon: HardDrive },
  { id: 'gpu', label: 'GPU', icon: Monitor },
  { id: 'motherboard', label: 'Motherboard', icon: CircuitBoard },
];

function CPUTab({ data }: { data: HardwareSnapshot }) {
  const { cpu } = data;
  return (
    <div>
      <div className="grid-2 mb-4">
        <InfoCard label="Processor" value={cpu.name} />
        <InfoCard label="Cores / Threads" value={`${cpu.cores}C / ${cpu.threads}T`} />
        <InfoCard label="Base Clock" value={`${cpu.baseClock} GHz`} />
        <InfoCard label="Current Clock" value={`${cpu.currentClock} GHz`} />
        <InfoCard label="Temperature" value={`${cpu.temp}°C`} accent={cpu.temp > 85 ? 'var(--red)' : undefined} />
        <InfoCard label="Power Draw" value={`${cpu.power} W`} />
        <InfoCard label="Core Voltage" value={`${cpu.voltage} V`} />
        <InfoCard label="Usage" value={`${cpu.usage.toFixed(1)}%`} accent={cpu.usage > 90 ? 'var(--red)' : undefined} />
      </div>
      <UsageGauge label="CPU Utilization" value={cpu.usage} color="var(--accent)" />
    </div>
  );
}

function MemoryTab({ data }: { data: HardwareSnapshot }) {
  const { memory } = data;
  return (
    <div>
      <div className="grid-2 mb-4">
        <InfoCard label="Total Capacity" value={`${memory.total} GB`} />
        <InfoCard label="Used" value={`${memory.used.toFixed(1)} GB`} />
        <InfoCard label="Available" value={`${memory.available.toFixed(1)} GB`} />
        <InfoCard label="Speed" value={`${memory.speed} MHz`} />
        <InfoCard label="Type" value={memory.type} />
        <InfoCard label="Slots Used" value={String(memory.slots)} />
        <InfoCard label="Usage" value={`${memory.usagePercent.toFixed(1)}%`} />
        <InfoCard label="Free" value={`${(memory.total - memory.used).toFixed(1)} GB`} />
      </div>
      <UsageGauge label="Memory Utilization" value={memory.usagePercent} color="var(--purple)" />
    </div>
  );
}

function DiskTab({ data }: { data: HardwareSnapshot }) {
  const { disks } = data;
  return (
    <div>
      {disks.map((disk) => (
        <div key={disk.name} className="card mb-4">
          <div className="card-header">
            <span className="card-title">
              {disk.name} — {disk.model}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {disk.health}
            </span>
          </div>
          <div className="grid-2">
            <InfoCard label="Type" value={disk.type} />
            <InfoCard label="Total Capacity" value={`${disk.total} GB`} />
            <InfoCard label="Used Space" value={`${disk.used} GB`} />
            <InfoCard label="Free Space" value={`${disk.free} GB`} />
            <InfoCard label="Temperature" value={`${disk.temp}°C`} />
            <InfoCard label="Health Status" value={disk.health} />
          </div>
          <div style={{ marginTop: 16 }}>
            <UsageBar label="Disk Usage" used={disk.used} total={disk.total} unit="GB" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GPUTab({ data }: { data: HardwareSnapshot }) {
  const { gpu } = data;
  return (
    <div>
      <div className="grid-2 mb-4">
        <InfoCard label="GPU" value={gpu.name} />
        <InfoCard label="Usage" value={`${gpu.usage.toFixed(1)}%`} accent={gpu.usage > 90 ? 'var(--red)' : undefined} />
        <InfoCard label="VRAM" value={`${gpu.vramUsed.toFixed(1)} / ${gpu.vramTotal} GB`} />
        <InfoCard label="Temperature" value={`${gpu.temp}°C`} accent={gpu.temp > 85 ? 'var(--red)' : undefined} />
        <InfoCard label="Core Clock" value={`${gpu.clock} MHz`} />
        <InfoCard label="Power Draw" value={`${gpu.power} W`} />
        <InfoCard label="VRAM Used" value={`${gpu.vramUsed.toFixed(1)} GB`} />
        <InfoCard label="VRAM Free" value={`${(gpu.vramTotal - gpu.vramUsed).toFixed(1)} GB`} />
      </div>
      <UsageGauge label="GPU Utilization" value={gpu.usage} color="var(--green)" />
      <div style={{ marginTop: 16 }}>
        <UsageBar label="VRAM Usage" used={gpu.vramUsed} total={gpu.vramTotal} unit="GB" />
      </div>
    </div>
  );
}

function MotherboardTab({ data }: { data: HardwareSnapshot }) {
  const { motherboard } = data;
  return (
    <div>
      <div className="grid-2">
        <InfoCard label="Manufacturer" value={motherboard.manufacturer} />
        <InfoCard label="Model" value={motherboard.model} />
        <InfoCard label="BIOS Version" value={motherboard.bios} />
        <InfoCard label="Chipset" value={motherboard.chipset} />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
        {label}
      </div>
      <div
        className="text-mono"
        style={{ fontSize: 15, fontWeight: 600, color: accent || 'var(--text-primary)' }}
      >
        {value}
      </div>
    </div>
  );
}

function UsageGauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{label}</span>
        <span className="text-mono" style={{ fontSize: 20, fontWeight: 700, color }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="progress-bar" style={{ height: 8 }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  total,
  unit,
}: {
  label: string;
  used: number;
  total: number;
  unit: string;
}) {
  const pct = (used / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-sm text-mono">
          {used.toFixed(1)} / {total.toFixed(0)} {unit}
        </span>
      </div>
      <div className="progress-bar" style={{ height: 6 }}>
        <div
          className={`progress-bar-fill ${pct >= 90 ? 'red' : pct >= 75 ? 'orange' : pct >= 50 ? 'yellow' : 'green'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function HardwareView() {
  const [activeTab, setActiveTab] = useState<HardwareTab>('cpu');
  const snapshot = useHardwareStore((s) => s.snapshot);

  if (!snapshot) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Hardware</h2>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <tab.icon size={14} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'cpu' && <CPUTab data={snapshot} />}
        {activeTab === 'memory' && <MemoryTab data={snapshot} />}
        {activeTab === 'disk' && <DiskTab data={snapshot} />}
        {activeTab === 'gpu' && <GPUTab data={snapshot} />}
        {activeTab === 'motherboard' && <MotherboardTab data={snapshot} />}
      </div>
    </div>
  );
}
