import { useState } from 'react';
import { Volume2, Mic, ChevronDown, ChevronUp, Star, CheckCircle, XCircle, MinusCircle, AlertCircle } from 'lucide-react';
import type { AudioDeviceInfo } from '../../../electron/external/deviceManager';

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string }> = {
  active: { label: '活跃', icon: CheckCircle, color: 'var(--green)' },
  disabled: { label: '已禁用', icon: MinusCircle, color: 'var(--yellow)' },
  unplugged: { label: '已断开', icon: XCircle, color: 'var(--text-secondary)' },
  not_present: { label: '未插入', icon: AlertCircle, color: 'var(--red)' },
};

const typeLabel: Record<string, string> = {
  playback: '播放设备',
  recording: '录音设备',
  both: '播放/录音',
};

export default function AudioDevices({ devices }: { devices: AudioDeviceInfo[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const playback = devices.filter((d) => d.type === 'playback' || d.type === 'both');
  const recording = devices.filter((d) => d.type === 'recording' || d.type === 'both');

  if (devices.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        未检测到音频设备
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="播放设备" icon={<Volume2 size={16} />} devices={playback} expanded={expanded} toggle={toggle} />
      <Section title="录音设备" icon={<Mic size={16} />} devices={recording} expanded={expanded} toggle={toggle} />
    </div>
  );
}

function Section({
  title,
  icon,
  devices,
  expanded,
  toggle,
}: {
  title: string;
  icon: React.ReactNode;
  devices: AudioDeviceInfo[];
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {icon}
        {title}
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>
          ({devices.length} 个设备)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {devices.map((d) => {
          const isExpanded = !!expanded[d.id];
          const statusI = statusConfig[d.status] || statusConfig.not_present;
          const StatusIcon = statusI.icon;
          return (
            <div
              key={d.id}
              className="panel"
              style={{ padding: 14, borderRadius: 'var(--radius)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--accent-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {d.type === 'recording' ? (
                    <Mic size={20} style={{ color: 'var(--accent)' }} />
                  ) : (
                    <Volume2 size={20} style={{ color: 'var(--accent)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {d.name}
                    </span>
                    {d.isDefault && (
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
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>{d.deviceFormat}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: statusI.color, display: 'flex' }}><StatusIcon size={12} /></span>
                      <span style={{ color: statusI.color }}>{statusI.label}</span>
                    </span>
                    <span>{typeLabel[d.type]}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    {d.jackInfo}
                  </div>
                  <VolumeBar volume={d.volume} muted={d.status === 'disabled' || d.status === 'not_present'} />
                </div>
                <button
                  onClick={() => toggle(d.id)}
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>驱动程序</span>
                    <span style={{ color: 'var(--text-primary)' }}>{d.driver}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>格式</span>
                    <span style={{ color: 'var(--text-primary)' }}>{d.deviceFormat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>插孔信息</span>
                    <span style={{ color: 'var(--text-primary)' }}>{d.jackInfo}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VolumeBar({ volume, muted }: { volume: number; muted: boolean }) {
  const pct = muted ? 0 : volume;
  const color = muted ? 'var(--text-secondary)' : pct > 80 ? 'var(--accent)' : pct > 40 ? 'var(--green)' : 'var(--orange)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <Volume2 size={12} style={{ color, opacity: 0.7 }} />
      <div
        style={{
          flex: 1,
          maxWidth: 120,
          height: 4,
          borderRadius: 2,
          background: 'var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.3s',
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)', minWidth: 28 }}>
        {pct === 0 ? '静音' : `${pct}%`}
      </span>
    </div>
  );
}
