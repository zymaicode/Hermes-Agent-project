import {
  LayoutDashboard,
  Cpu,
  Monitor,
  AppWindow,
  MessageSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { NavPage } from '../../utils/types';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'software', label: 'Software', icon: Monitor },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'ai', label: 'AI Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setPage = useAppStore((s) => s.setPage);

  return (
    <div className="sidebar">
      <div style={{ padding: '16px 12px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 4px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>PCHelper</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              v1.0.0
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  background: isActive ? 'var(--accent-muted)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border-color)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#fff',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            System Online
          </div>
        </div>
      </div>
    </div>
  );
}
