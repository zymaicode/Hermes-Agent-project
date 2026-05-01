import { useState, useEffect, useMemo } from 'react';
import { Thermometer } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useHardwareStore } from '../../stores/hardwareStore';
import { useTemperatureStore } from '../../stores/temperatureStore';

export default function TemperatureView() {
  const snapshot = useHardwareStore((s) => s.snapshot);
  const { readings, period, addReading, setPeriod } = useTemperatureStore();
  const [chartHeight, setChartHeight] = useState(240);

  useEffect(() => {
    if (snapshot) {
      addReading({
        timestamp: Date.now(),
        cpuTemp: snapshot.cpu.temp + (Math.random() - 0.5) * 2,
        gpuTemp: snapshot.gpu.temp + (Math.random() - 0.5) * 2,
        diskTemp: (snapshot.disks[0]?.temp ?? 35) + (Math.random() - 0.5),
      });
    }
  }, [snapshot, addReading]);

  const chartData = useMemo(() => {
    const cutoff = period === '1min' ? 60 : 3600;
    return readings.slice(-cutoff).map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: period === '1min' ? '2-digit' : undefined }),
      cpu: +r.cpuTemp.toFixed(1),
      gpu: +r.gpuTemp.toFixed(1),
      disk: +r.diskTemp.toFixed(1),
    }));
  }, [readings, period]);

  const stats = useMemo(() => {
    if (readings.length === 0) return null;
    const cutoff = period === '1min' ? 60 : 3600;
    const recent = readings.slice(-cutoff);
    const stat = (key: 'cpuTemp' | 'gpuTemp' | 'diskTemp') => {
      const vals = recent.map((r) => r[key]);
      return { current: vals[vals.length - 1], min: Math.min(...vals), max: Math.max(...vals), avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) };
    };
    return { cpu: stat('cpuTemp'), gpu: stat('gpuTemp'), disk: stat('diskTemp') };
  }, [readings, period]);

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Temperature History</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`tab${period === '1min' ? ' active' : ''}`} onClick={() => setPeriod('1min')}>1 Minute</button>
          <button className={`tab${period === '6hour' ? ' active' : ''}`} onClick={() => setPeriod('6hour')}>6 Hours</button>
        </div>
      </div>

      {/* Current Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <TempStatCard label="CPU Temperature" stats={stats.cpu} unit="°C" color="var(--orange)" />
          <TempStatCard label="GPU Temperature" stats={stats.gpu} unit="°C" color="var(--red)" />
          <TempStatCard label="Disk Temperature" stats={stats.disk} unit="°C" color="var(--yellow)" />
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TempChart label="CPU Temperature" data={chartData} dataKey="cpu" color="var(--orange)" warning={75} critical={85} />
        <TempChart label="GPU Temperature" data={chartData} dataKey="gpu" color="var(--red)" warning={80} critical={88} />
        <TempChart label="Disk Temperature" data={chartData} dataKey="disk" color="var(--yellow)" warning={55} critical={65} />
      </div>
    </div>
  );
}

function TempStatCard({ label, stats, unit, color }: { label: string; stats: { current: number; min: number; max: number; avg: number }; unit: string; color: string }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{label}</span>
        <Thermometer size={16} style={{ color }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="stat-value" style={{ color }}>{stats.current.toFixed(1)}</span>
        <span className="stat-unit">{unit}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div>
          <div className="text-sm text-muted">Min</div>
          <span className="text-mono" style={{ fontSize: 13, color: 'var(--green)' }}>{stats.min.toFixed(1)}{unit}</span>
        </div>
        <div>
          <div className="text-sm text-muted">Max</div>
          <span className="text-mono" style={{ fontSize: 13, color: 'var(--red)' }}>{stats.max.toFixed(1)}{unit}</span>
        </div>
        <div>
          <div className="text-sm text-muted">Average</div>
          <span className="text-mono" style={{ fontSize: 13 }}>{stats.avg.toFixed(1)}{unit}</span>
        </div>
      </div>
    </div>
  );
}

function TempChart({ label, data, dataKey, color, warning, critical }: { label: string; data: Array<Record<string, number | string>>; dataKey: string; color: string; warning: number; critical: number }) {
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">{label}</span></div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis domain={[20, 100]} hide />
          <Tooltip
            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value: number) => [`${value.toFixed(1)}°C`, label]}
          />
          <ReferenceLine y={warning} stroke="var(--yellow)" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={critical} stroke="var(--red)" strokeDasharray="4 4" strokeWidth={1} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 2, background: 'var(--yellow)', display: 'inline-block' }} /> Warning: {warning}°C
        </span>
        <span style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 2, background: 'var(--red)', display: 'inline-block' }} /> Critical: {critical}°C
        </span>
      </div>
    </div>
  );
}
