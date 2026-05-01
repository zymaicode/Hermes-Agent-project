import { useState } from 'react';
import { Printer, ChevronDown, ChevronUp, Star, Wifi, Usb, CheckCircle, XCircle, AlertTriangle, FileWarning, Clock, Droplets } from 'lucide-react';
import type { PrinterEntry } from '../../../electron/external/deviceManager';

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string }> = {
  ready: { label: '就绪', icon: CheckCircle, color: 'var(--green)' },
  offline: { label: '离线', icon: XCircle, color: 'var(--red)' },
  error: { label: '错误', icon: AlertTriangle, color: 'var(--red)' },
  paper_jam: { label: '卡纸', icon: FileWarning, color: 'var(--orange)' },
  low_ink: { label: '墨水不足', icon: Droplets, color: 'var(--yellow)' },
  busy: { label: '忙碌', icon: Clock, color: 'var(--accent)' },
};

export default function Printers({ printers }: { printers: PrinterEntry[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  if (printers.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        未检测到打印机
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {printers.map((p) => {
        const isExpanded = !!expanded[p.name];
        const s = statusConfig[p.status] || statusConfig.offline;
        const StatusIcon = s.icon;
        return (
          <div
            key={p.name}
            className="panel"
            style={{ padding: 14, borderRadius: 'var(--radius)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'var(--accent-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Printer size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  {p.isDefault && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'var(--green-muted, rgba(34,197,94,0.15))',
                        color: 'var(--green)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Star size={10} /> 默认
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: s.color, display: 'flex' }}><StatusIcon size={12} /></span>
                    <span style={{ color: s.color }}>{s.label}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {p.isNetwork ? <Wifi size={12} /> : <Usb size={12} />}
                    {p.isNetwork ? '网络打印机' : '本地打印机'}
                  </span>
                  <span>{p.supportsDuplex ? '支持双面打印' : '仅单面打印'}</span>
                  <span>{p.supportsColor ? '支持彩色' : '仅黑白'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {p.port} · 位置: {p.location}
                </div>

                {p.inkLevels && (
                  <InkLevels levels={p.inkLevels} />
                )}
              </div>
              <button
                onClick={() => toggle(p.name)}
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
                  marginTop: 10,
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'var(--bg-hover)',
                  fontSize: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px 24px',
                }}
              >
                <Row label="驱动程序" value={p.driver} />
                <Row label="端口" value={p.port} />
                <Row label="状态" value={s.label} />
                <Row label="位置" value={p.location} />
                <Row label="已打印页数" value={p.pagesPrinted.toLocaleString()} />
                <Row label="双面打印" value={p.supportsDuplex ? '支持' : '不支持'} />
                <Row label="彩色打印" value={p.supportsColor ? '支持' : '不支持'} />
                <Row label="网络打印机" value={p.isNetwork ? '是' : '否'} />
                <Row label="上次使用" value={p.lastUsed} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InkLevels({ levels }: { levels: Array<{ color: string; level: number }> }) {
  if (!levels || levels.length === 0) return null;
  return (
    <div style={{ marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {levels.map((ink) => {
        const color = ink.level > 50 ? 'var(--green)' : ink.level > 20 ? 'var(--yellow)' : 'var(--red)';
        return (
          <div key={ink.color} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', minWidth: 32 }}>
              {ink.color}
            </span>
            <div
              style={{
                width: 60,
                height: 4,
                borderRadius: 2,
                background: 'var(--border-color)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${ink.level}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 2,
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              {ink.level}%
            </span>
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
