import { useState } from 'react';
import { Monitor, ChevronDown, ChevronUp, Star, Cable } from 'lucide-react';
import type { MonitorInfo } from '../../../electron/external/deviceManager';

const connectionLabels: Record<string, string> = {
  HDMI: 'HDMI',
  DP: 'DisplayPort',
  DVI: 'DVI',
  VGA: 'VGA',
  'USB-C': 'USB-C',
  'built-in': '内置',
};

export default function DisplayInfo({ monitors }: { monitors: MonitorInfo[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (monitors.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        未检测到显示器
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {monitors.map((m) => {
        const isExpanded = !!expanded[m.id];
        return (
          <div
            key={m.id}
            className="panel"
            style={{ padding: 16, borderRadius: 'var(--radius)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--accent-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Monitor size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </span>
                  {m.isPrimary && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--accent-muted)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Star size={10} /> 主显示器
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>{m.screenSize}英寸</span>
                  <span>{m.resolution} @ {m.refreshRate}Hz</span>
                  <span>
                    <Cable size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                    {connectionLabels[m.connectionType] || m.connectionType}
                  </span>
                  <span>{m.aspectRatio}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {m.gpuOutput}
                </div>
              </div>
              <button
                onClick={() => toggle(m.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {isExpanded && (
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: 'var(--bg-hover)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 24px',
                  fontSize: 12,
                }}
              >
                <Row label="制造商" value={m.manufacturer} />
                <Row label="EDID 版本" value={m.edidVersion} />
                <Row label="序列号" value={m.serialNumber} />
                <Row label="色深" value={`${m.colorDepth} bit`} />
                <Row label="生产日期" value={m.manufactureDate} />
                <Row label="分辨率" value={`${m.resolution} (${m.aspectRatio})`} />
                <Row label="刷新率" value={`${m.refreshRate} Hz`} />
                <Row label="接口类型" value={connectionLabels[m.connectionType] || m.connectionType} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
