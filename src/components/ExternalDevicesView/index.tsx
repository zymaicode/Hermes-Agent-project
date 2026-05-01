import { useEffect, useState } from 'react';
import {
  Monitor, Volume2, Bluetooth, Printer, Gamepad2,
  RefreshCw, MonitorSmartphone,
} from 'lucide-react';
import { useExternalDevicesStore } from '../../stores/externalDevicesStore';
import DisplayInfo from './DisplayInfo';
import AudioDevices from './AudioDevices';
import BluetoothDevices from './BluetoothDevices';
import Printers from './Printers';
import GameControllers from './GameControllers';

type TabId = 'displays' | 'audio' | 'bluetooth' | 'printers' | 'controllers';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'displays', label: '显示器', icon: Monitor },
  { id: 'audio', label: '音频设备', icon: Volume2 },
  { id: 'bluetooth', label: '蓝牙设备', icon: Bluetooth },
  { id: 'printers', label: '打印机', icon: Printer },
  { id: 'controllers', label: '游戏控制器', icon: Gamepad2 },
];

export default function ExternalDevicesView() {
  const [activeTab, setActiveTab] = useState<TabId>('displays');
  const {
    monitors, audioDevices, bluetoothDevices, printers, gameControllers,
    loading, fetchAll, refreshAll,
  } = useExternalDevicesStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MonitorSmartphone size={22} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            外部设备管理器
          </h2>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            只读状态概览
          </span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={refreshAll}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <RefreshCw size={14} />
          刷新
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 2,
          marginBottom: 16,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'inherit',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'displays' && <DisplayInfo monitors={monitors} />}
        {activeTab === 'audio' && <AudioDevices devices={audioDevices} />}
        {activeTab === 'bluetooth' && <BluetoothDevices devices={bluetoothDevices} />}
        {activeTab === 'printers' && <Printers printers={printers} />}
        {activeTab === 'controllers' && <GameControllers controllers={gameControllers} />}
      </div>
    </div>
  );
}
