import { useEffect } from 'react';
import { Trash2, Search, Copy } from 'lucide-react';
import { useCleanupStore } from '../../stores/cleanupStore';
import QuickClean from './QuickClean';
import LargeFiles from './LargeFiles';
import DuplicateFiles from './DuplicateFiles';

const TABS: Array<{ id: 'quick' | 'large' | 'duplicates'; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'quick', label: 'Quick Clean', icon: Trash2 },
  { id: 'large', label: 'Large Files', icon: Search },
  { id: 'duplicates', label: 'Duplicates', icon: Copy },
];

export default function CleanupView() {
  const { tab, setTab, scanAllQuick, scanLargeFiles, scanDuplicates, quickLoading, largeFilesLoading, duplicatesLoading } = useCleanupStore();

  useEffect(() => {
    if (tab === 'quick' && !quickLoading) {
      scanAllQuick();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (newTab: 'quick' | 'large' | 'duplicates') => {
    setTab(newTab);
    if (newTab === 'quick') {
      scanAllQuick();
    } else if (newTab === 'large') {
      scanLargeFiles();
    } else if (newTab === 'duplicates') {
      scanDuplicates();
    }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>System Cleanup</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className="btn btn-ghost btn-sm"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 0,
                padding: '6px 16px',
              }}
            >
              <Icon size={14} />
              <span style={{ marginLeft: 6 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'quick' && <QuickClean />}
        {tab === 'large' && <LargeFiles />}
        {tab === 'duplicates' && <DuplicateFiles />}
      </div>
    </div>
  );
}
