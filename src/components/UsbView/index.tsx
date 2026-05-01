import { useEffect } from 'react';
import { Usb, HardDrive, Keyboard, Headphones, Wifi, Camera, MoreHorizontal, RefreshCw, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { useUsbStore } from '../../stores/usbStore';

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  storage: HardDrive,
  input: Keyboard,
  audio: Headphones,
  network: Wifi,
  imaging: Camera,
  other: MoreHorizontal,
};

const TYPE_COLORS: Record<string, string> = {
  storage: 'var(--accent)',
  input: 'var(--green)',
  audio: 'var(--purple)',
  network: 'var(--yellow)',
  imaging: 'var(--orange)',
  other: 'var(--text-secondary)',
};

const BUS_COLORS: Record<string, string> = {
  'USB 2.0': 'rgba(139,148,158,0.12)',
  'USB 3.0': 'rgba(63,185,80,0.12)',
  'USB-C': 'rgba(88,166,255,0.12)',
  'Thunderbolt': 'rgba(163,113,247,0.12)',
};

const BUS_TEXT: Record<string, string> = {
  'USB 2.0': 'var(--text-secondary)',
  'USB 3.0': 'var(--green)',
  'USB-C': 'var(--accent)',
  'Thunderbolt': 'var(--purple)',
};

function formatPower(mA: number): string {
  if (mA >= 1000) return `${(mA / 1000).toFixed(1)}A`;
  return `${mA}mA`;
}

export default function UsbView() {
  const {
    devices, history, loading, historyOpen, ejectResult,
    fetchDevices, fetchHistory, toggleHistory, ejectDevice, clearEjectResult,
  } = useUsbStore();

  useEffect(() => {
    fetchDevices();
    fetchHistory();
  }, [fetchDevices, fetchHistory]);

  useEffect(() => {
    if (ejectResult) {
      const t = setTimeout(clearEjectResult, 3000);
      return () => clearTimeout(t);
    }
  }, [ejectResult, clearEjectResult]);

  if (loading && devices.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading USB devices...
      </div>
    );
  }

  const connectedSerials = new Set(devices.map((d) => d.serialNumber));

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>USB Devices</h2>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-ghost" onClick={() => { fetchDevices(); fetchHistory(); }}>
            <RefreshCw size={14} />
          </button>
          <Usb size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{devices.length} connected</span>
        </div>
      </div>

      {/* Eject toast */}
      {ejectResult && (
        <div style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 13,
          background: ejectResult.success ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)',
          color: ejectResult.success ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${ejectResult.success ? 'var(--green)' : 'var(--red)'}`,
        }}>
          {ejectResult.message}
        </div>
      )}

      {/* Connected Devices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginBottom: 16 }}>
        {devices.map((device) => {
          const Icon = TYPE_ICONS[device.type] || MoreHorizontal;
          const typeColor = TYPE_COLORS[device.type] || 'var(--text-secondary)';
          const isStorage = device.type === 'storage';

          return (
            <div key={device.serialNumber} className="card" style={{ padding: 14 }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${typeColor}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: typeColor, display: 'flex' }}><Icon size={20} /></span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }} className="truncate">{device.name}</div>
                  <div className="text-sm text-muted">{device.vendor}</div>
                </div>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                  color: BUS_TEXT[device.busType] || 'var(--text-secondary)',
                  background: BUS_COLORS[device.busType] || 'rgba(139,148,158,0.08)',
                }}>
                  {device.busType}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>VID/PID: </span>
                  <span className="text-mono">{device.vid}:{device.pid}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Power: </span>
                  <span className="text-mono">{formatPower(device.powerRequired)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Serial: </span>
                  <span className="text-mono" style={{ fontSize: 10 }}>{device.serialNumber.slice(0, 12)}...</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>First seen: </span>
                  <span className="text-mono" style={{ fontSize: 10 }}>{device.firstConnected.split(' ')[0]}</span>
                </div>
              </div>

              <div className="text-sm text-muted truncate mt-2" style={{ fontSize: 11 }}>{device.description}</div>

              {isStorage && (
                <button
                  className="btn btn-sm"
                  style={{ marginTop: 10, width: '100%' }}
                  onClick={() => ejectDevice(device.serialNumber)}
                >
                  Safely Eject
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* History Section */}
      <div>
        <button
          className="btn btn-ghost"
          onClick={() => { toggleHistory(); if (!historyOpen && history.length === 0) fetchHistory(); }}
          style={{ justifyContent: 'flex-start', width: '100%', marginBottom: 8 }}
        >
          {historyOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span style={{ marginLeft: 8 }}>Device History ({history.length})</span>
        </button>

        {historyOpen && (
          <div className="table-container" style={{ maxHeight: 280 }}>
            <table>
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Type</th>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Times</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const isConnected = connectedSerials.has(entry.serialNumber);
                  const Icon = TYPE_ICONS[entry.type] || MoreHorizontal;
                  const typeColor = TYPE_COLORS[entry.type] || 'var(--text-secondary)';
                  return (
                    <tr key={entry.serialNumber}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: typeColor, display: 'flex' }}><Icon size={14} /></span>
                          <span style={{ fontWeight: 500 }}>{entry.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                          color: typeColor, background: `${typeColor}20`,
                          textTransform: 'capitalize',
                        }}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="text-mono" style={{ fontSize: 11 }}>{entry.firstSeen}</td>
                      <td className="text-mono" style={{ fontSize: 11 }}>{entry.lastSeen}</td>
                      <td className="text-mono" style={{ fontSize: 12 }}>{entry.timesConnected}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Circle size={8} fill={isConnected ? 'var(--green)' : 'var(--text-muted)'} color={isConnected ? 'var(--green)' : 'var(--text-muted)'} />
                          <span style={{ fontSize: 11, color: isConnected ? 'var(--green)' : 'var(--text-muted)' }}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
