import { useState } from 'react';
import {
  Gamepad2, ChevronDown, ChevronUp, Usb, Bluetooth, Wifi,
  CheckCircle, XCircle, Battery, GamepadIcon,
} from 'lucide-react';
import type { GameControllerEntry } from '../../../electron/external/deviceManager';

const typeLabel: Record<string, string> = {
  xbox: 'Xbox 控制器',
  playstation: 'PlayStation 控制器',
  switch_pro: 'Switch Pro 控制器',
  generic: '通用手柄',
  joystick: '摇杆',
  racing_wheel: '方向盘',
};

const connectionLabel: Record<string, string> = {
  wired: '有线',
  bluetooth: '蓝牙',
  wireless_dongle: '无线接收器',
};

const connectionIcon: Record<string, React.ComponentType<{ size?: number }>> = {
  wired: Usb,
  bluetooth: Bluetooth,
  wireless_dongle: Wifi,
};

export default function GameControllers({ controllers }: { controllers: GameControllerEntry[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  if (controllers.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        未检测到游戏控制器
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {controllers.map((c) => {
        const isExpanded = !!expanded[c.name];
        const ConnIcon = connectionIcon[c.connectionType] || Usb;
        return (
          <div
            key={c.name}
            className="panel"
            style={{
              padding: 14,
              borderRadius: 'var(--radius)',
              opacity: c.isConnected ? 1 : 0.65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: c.isConnected ? 'var(--accent-muted)' : 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {c.type === 'racing_wheel' ? (
                  <GamepadIcon size={20} style={{ color: c.isConnected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                ) : (
                  <Gamepad2 size={20} style={{ color: c.isConnected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: c.isConnected
                        ? 'rgba(34,197,94,0.15)'
                        : 'var(--bg-hover)',
                      color: c.isConnected ? 'var(--green)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {c.isConnected ? (
                      <><CheckCircle size={10} /> 已连接</>
                    ) : (
                      <><XCircle size={10} /> 未连接</>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {typeLabel[c.type] || c.type}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ConnIcon size={12} />
                    {connectionLabel[c.connectionType] || c.connectionType}
                  </span>
                  <span>{c.buttons} 个按键</span>
                  <span>{c.axes} 个轴</span>
                  <span>{c.vendor}</span>
                </div>
                {c.batteryLevel !== null && (
                  <BatteryBar level={c.batteryLevel} />
                )}
              </div>
              <button
                onClick={() => toggle(c.name)}
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
                <Row label="名称" value={c.name} />
                <Row label="类型" value={typeLabel[c.type] || c.type} />
                <Row label="连接方式" value={connectionLabel[c.connectionType] || c.connectionType} />
                <Row label="制造商" value={c.vendor} />
                <Row label="按键数量" value={String(c.buttons)} />
                <Row label="轴数量" value={String(c.axes)} />
                <Row label="驱动程序" value={c.driver} />
                <Row label="电池电量" value={c.batteryLevel !== null ? `${c.batteryLevel}%` : '有线供电'} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 70 ? 'var(--green)' : level > 30 ? 'var(--yellow)' : level > 10 ? 'var(--orange)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <Battery size={12} style={{ color, opacity: 0.7 }} />
      <div
        style={{
          flex: 1,
          maxWidth: 100,
          height: 4,
          borderRadius: 2,
          background: 'var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${level}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{level}%</span>
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
