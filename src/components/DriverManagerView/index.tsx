import { useEffect } from 'react';
import { List, Archive, GitCompare } from 'lucide-react';
import DriverList from './DriverList';
import DriverBackup from './DriverBackup';
import DriverCompare from './DriverCompare';
import { useDriverManagerStore } from '../../stores/driverManagerStore';

const TABS = [
  { id: 'list' as const, label: '所有驱动', icon: List },
  { id: 'backup' as const, label: '备份管理', icon: Archive },
  { id: 'compare' as const, label: '版本对比', icon: GitCompare },
];

export default function DriverManagerView() {
  const activeTab = useDriverManagerStore((s) => s.activeTab);
  const setActiveTab = useDriverManagerStore((s) => s.setActiveTab);
  const fetchDrivers = useDriverManagerStore((s) => s.fetchDrivers);
  const fetchBackups = useDriverManagerStore((s) => s.fetchBackups);
  const loading = useDriverManagerStore((s) => s.loading);

  useEffect(() => {
    fetchDrivers();
    fetchBackups();
  }, [fetchDrivers, fetchBackups]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>驱动管理</h2>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: 3 }}>
          {TABS.map((tab) => {
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
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: isActive ? 500 : 400,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'list' && <DriverList />}
        {activeTab === 'backup' && <DriverBackup />}
        {activeTab === 'compare' && <DriverCompare />}
      </div>
    </div>
  );
}
