import { useEffect, useMemo } from 'react';
import {
  Cpu, HardDrive, RefreshCw, CheckCircle, AlertTriangle,
  Layers, Zap, BatteryCharging, MemoryStick, Activity,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemoryStore } from '../../stores/memoryStore';
import { useProcessStore } from '../../stores/processStore';
import { Badge } from '../common/Badge';

function getScoreColor(score: number) {
  if (score >= 80) return 'var(--green)';
  if (score >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function getScoreBadge(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

export default function MemoryView() {
  const modules = useMemoryStore((s) => s.modules);
  const allocation = useMemoryStore((s) => s.allocation);
  const timings = useMemoryStore((s) => s.timings);
  const health = useMemoryStore((s) => s.health);
  const pageFile = useMemoryStore((s) => s.pageFile);
  const loading = useMemoryStore((s) => s.loading);
  const fetchAll = useMemoryStore((s) => s.fetchAll);
  const processes = useProcessStore((s) => s.processes);
  const fetchProcesses = useProcessStore((s) => s.fetchProcesses);

  useEffect(() => { fetchAll(); fetchProcesses(); }, []);

  const topProcesses = useMemo(() => {
    return [...processes].sort((a, b) => b.memoryMB - a.memoryMB).slice(0, 5);
  }, [processes]);

  const totalGB = useMemo(() => modules.reduce((sum, m) => sum + (m.isActive ? m.sizeGB : 0), 0), [modules]);
  const usedSlots = useMemo(() => modules.filter((m) => m.isActive).length, [modules]);

  if (loading && modules.length === 0) {
    return (
      <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Memory Details</h2>
        </div>
        <div className="empty-state"><div className="empty-state-title">Loading memory data...</div></div>
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Memory Details</h2>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchAll}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
        </button>
      </div>

      {/* Health Summary Card */}
      {health && (
        <div className="card animate-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `conic-gradient(${getScoreColor(health.healthScore)} ${health.healthScore * 3.6}deg, var(--bg-tertiary) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: getScoreColor(health.healthScore),
                }}>
                  {health.healthScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {totalGB} GB {modules[0]?.type || 'DDR5'}
                  {health.isDualChannel && <Badge variant="green">Dual Channel</Badge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {usedSlots}/{health.totalSlots} slots used &middot; Max capacity: {health.maxCapacity} GB
                </div>
                {health.xmpProfile && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {health.xmpProfile}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Health Score', value: `${health.healthScore}/100`, color: getScoreColor(health.healthScore) },
                { label: 'Used Slots', value: `${usedSlots}/${health.totalSlots}`, color: 'var(--accent)' },
                { label: 'Total', value: `${totalGB} GB`, color: 'var(--green)' },
                { label: 'Channel', value: health.isDualChannel ? 'Dual' : health.isQuadChannel ? 'Quad' : 'Single', color: 'var(--purple)' },
                { label: 'Speed Match', value: health.speedMismatch ? 'Mismatch' : 'OK', color: health.speedMismatch ? 'var(--red)' : 'var(--green)' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Memory Allocation Donut */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Memory Allocation</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {allocation.reduce((s, a) => s + a.sizeMB, 0).toLocaleString()} MB total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={allocation}
                dataKey="sizeMB"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {allocation.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} stroke="var(--bg-secondary)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12 }}
                formatter={(value: number) => [`${(value / 1024).toFixed(1)} GB`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {allocation.map((a) => (
              <div key={a.category} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>{a.category}</span>
                <span style={{ fontWeight: 600 }}>{a.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Timings */}
        {timings && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div className="card-title">Memory Timings</div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>DDR5-6000</span>
            </div>
            <table className="compact">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th style={{ textAlign: 'right' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>CAS Latency (CL)</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{timings.casLatency}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>Column Address Strobe latency</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>tRCD</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{timings.tRCD}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>RAS to CAS Delay</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>tRP</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{timings.tRP}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>Row Precharge Time</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>tRAS</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{timings.tRAS}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>Row Active Time</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Command Rate</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{timings.commandRate}T</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>Command per clock cycle</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              CL{timings.casLatency}-{timings.tRCD}-{timings.tRP}-{timings.tRAS} @ {timings.commandRate}T
            </div>
          </div>
        )}
      </div>

      {/* Physical Modules */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Physical Modules</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        {modules.map((mod) => (
          <div
            key={mod.slot}
            className="card"
            style={{
              padding: 16,
              borderStyle: mod.isActive ? 'solid' : 'dashed',
              opacity: mod.isActive ? 1 : 0.5,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MemoryStick size={18} style={{ color: mod.isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{mod.slot}</span>
              </div>
              <Badge variant={mod.isActive ? 'green' : 'gray'}>
                {mod.isActive ? `${mod.sizeGB} GB` : 'Empty'}
              </Badge>
            </div>
            {mod.isActive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11 }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                  <span>{mod.type} @ {mod.speed} MHz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Manufacturer</span>
                  <span>{mod.manufacturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Part #</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{mod.partNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Serial</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{mod.serialNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Voltage</span>
                  <span>{mod.voltage}V</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Rank / Factor</span>
                  <span>{mod.rank} / {mod.formFactor}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom row: Page File + Top Processes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Page File */}
        {pageFile && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div className="card-title">Page File</div>
              <Badge variant={pageFile.isManaged ? 'blue' : 'yellow'}>
                {pageFile.isManaged ? 'System Managed' : 'Custom'}
              </Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex items-center justify-between" style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Path</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{pageFile.path}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Usage</span>
                  <span style={{ fontWeight: 600 }}>{pageFile.currentMB} / {pageFile.maximumMB} MB</span>
                </div>
                <div className="progress-bar" style={{ height: 8, borderRadius: 4 }}>
                  <div
                    className="progress-bar-fill green"
                    style={{ width: `${(pageFile.currentMB / pageFile.maximumMB * 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>Initial: {pageFile.initialMB} MB</span>
                  <span>{((pageFile.currentMB / pageFile.maximumMB) * 100).toFixed(0)}% used</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Processes by Memory */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Top Memory Processes</div>
            <Activity size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <table className="compact">
            <thead>
              <tr>
                <th>Process</th>
                <th style={{ textAlign: 'right' }}>Memory</th>
              </tr>
            </thead>
            <tbody>
              {topProcesses.map((p) => (
                <tr key={p.pid}>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PID {p.pid}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {p.memoryMB.toFixed(1)} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Warnings */}
      {health && health.errors.length > 0 && (
        <div className="card" style={{ padding: 16, borderColor: 'var(--yellow)', background: 'rgba(210, 153, 34, 0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: 'var(--yellow)' }} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Health Warnings</span>
          </div>
          {health.errors.map((err, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--yellow)', paddingLeft: 24 }}>{err}</div>
          ))}
        </div>
      )}
    </div>
  );
}
