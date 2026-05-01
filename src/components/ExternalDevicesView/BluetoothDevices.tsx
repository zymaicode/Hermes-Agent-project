import { useState } from 'react';
import {
  Keyboard, Mouse, Headphones, Speaker, Smartphone, Watch,
  Bluetooth, ChevronDown, ChevronUp, Signal, Battery, WifiOff,
} from 'lucide-react';
import type { BluetoothDeviceEntry } from '../../../electron/external/deviceManager';

const typeIcon: Record<string, React.ComponentType<{ size?: number }>> = {
  keyboard: Keyboard,
  mouse: Mouse,
  headset: Headphones,
  speaker: Speaker,
  phone: Smartphone,
  watch: Watch,
  other: Bluetooth,
};

const typeLabel: Record<string, string> = {
  keyboard: '键盘',
  mouse: '鼠标',
  headset: '耳机',
  speaker: '音箱',
  phone: '手机',
  watch: '手表',
  other: '其他',
};

function SignalBars({ strength }: { strength: number }) {
  const bars = strength === 0 ? 0 : strength > 80 ? 4 : strength > 60 ? 3 : strength > 40 ? 2 : 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[1, 2, 3, 4].map((level) => {
        const filled = level <= bars;
        const heightPx = 4 + level * 3;
        return (
          <div
            key={level}
            style={{
              width: 3,
              height: heightPx,
              borderRadius: 1,
              background: filled ? (strength > 70 ? 'var(--green)' : strength > 40 ? 'var(--yellow)' : 'var(--red)') : 'var(--border-color)',
            }}
          />
        );
      })}
    </div>
  );
}

export default function BluetoothDevices({ devices }: { devices: BluetoothDeviceEntry[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (mac: string) =>
    setExpanded((prev) => ({ ...prev, [mac]: !prev[mac] }));

  if (devices.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        未检测到蓝牙设备
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {devices.map((d) => {
        const Icon = typeIcon[d.type] || Bluetooth;
        const isExpanded = !!expanded[d.mac];
        return (
          <div
            key={d.mac}
            className="panel"
            style={{
              padding: 14,
              borderRadius: 'var(--radius)',
              opacity: d.isConnected ? 1 : 0.65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: d.isConnected ? 'var(--accent-muted)' : 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <span style={{ color: d.isConnected ? 'var(--accent)' : 'var(--text-secondary)', display: 'flex' }}><Icon size={20} /></span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {d.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: d.isConnected
                        ? 'rgba(34,197,94,0.15)'
                        : 'var(--bg-hover)',
                      color: d.isConnected ? 'var(--green)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {d.isConnected ? (
                      <><Bluetooth size={10} /> 已连接</>
                    ) : (
                      <><WifiOff size={10} /> 未连接</>
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
                    {typeLabel[d.type] || d.type}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace' }}>{d.mac}</span>
                  <span>配对于 {d.paired}</span>
                  {d.isConnected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Signal size={12} />
                      <SignalBars strength={d.signalStrength} />
                      <span>{d.signalStrength}%</span>
                    </div>
                  )}
                </div>
                {d.batteryLevel !== null && (
                  <BatteryBar level={d.batteryLevel} />
                )}
              </div>
              <button
                onClick={() => toggle(d.mac)}
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
                  <span style={{ color: 'var(--text-secondary)' }}>MAC 地址</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{d.mac}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>设备类型</span>
                  <span style={{ color: 'var(--text-primary)' }}>{typeLabel[d.type] || d.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>配对日期</span>
                  <span style={{ color: 'var(--text-primary)' }}>{d.paired}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>驱动程序</span>
                  <span style={{ color: 'var(--text-primary)' }}>{d.driver}</span>
                </div>
                {d.isConnected && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>信号强度</span>
                    <SignalBars strength={d.signalStrength} />
                  </div>
                )}
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
