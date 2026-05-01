import { useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Monitor,
  AppWindow,
  AlertTriangle,
  Bell,
  Heart,
  MessageSquare,
  Settings,
  RefreshCw,
  ChevronRight,
  Zap,
  Wifi,
  Thermometer,
  Activity,
  Gauge,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useConflictStore } from '../../stores/conflictStore';
import { useUpdateStore } from '../../stores/updateStore';
import { useAlertStore } from '../../stores/alertStore';
import { useHealthStore } from '../../stores/healthStore';
import type { NavPage } from '../../utils/types';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'software', label: 'Software', icon: Monitor },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'startup', label: 'Startup', icon: Zap },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
  { id: 'updates', label: 'Updates', icon: RefreshCw },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'temperatures', label: 'Temps', icon: Thermometer },
  { id: 'process', label: 'Processes', icon: Activity },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'benchmark', label: 'Benchmark', icon: Gauge },
  { id: 'scheduler', label: 'Tasks', icon: Calendar },
  { id: 'ai', label: 'AI Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setPage = useAppStore((s) => s.setPage);
  const highCount = useConflictStore((s) => s.report?.summary.high ?? 0);
  const updatesCount = useUpdateStore((s) => s.scanResult?.updatesAvailable ?? 0);
  const alertCount = useAlertStore((s) => s.activeAlerts.length);
  const criticalAlertCount = useAlertStore((s) => s.activeAlerts.filter((a) => a.severity === 'critical').length);
  const healthScore = useHealthStore((s) => s.score?.total);
  const healthGrade = useHealthStore((s) => s.score?.grade);
  const scanConflicts = useConflictStore((s) => s.scanConflicts);
  const scanForUpdates = useUpdateStore((s) => s.scanForUpdates);
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts);
  const fetchHealthScore = useHealthStore((s) => s.fetchScore);

  useEffect(() => {
    scanConflicts();
    scanForUpdates();
    fetchAlerts();
    fetchHealthScore();
  }, [scanConflicts, scanForUpdates, fetchAlerts, fetchHealthScore]);

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
                {item.id === 'conflicts' && highCount > 0 && (
                  <span
                    style={{
                      background: 'var(--red)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {highCount}
                  </span>
                )}
                {item.id === 'updates' && updatesCount > 0 && (
                  <span
                    style={{
                      background: 'var(--yellow)',
                      color: '#000',
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {updatesCount}
                  </span>
                )}
                {item.id === 'alerts' && criticalAlertCount > 0 && (
                  <span
                    style={{
                      background: 'var(--red)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {criticalAlertCount}
                  </span>
                )}
                {item.id === 'health' && healthScore !== undefined && (
                  <span
                    style={{
                      background:
                        healthScore >= 85 ? 'var(--green)' :
                        healthScore >= 70 ? 'var(--accent)' :
                        healthScore >= 50 ? 'var(--yellow)' :
                        healthScore >= 30 ? 'var(--orange)' :
                        'var(--red)',
                      color: healthScore >= 50 ? '#000' : '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {healthScore}
                  </span>
                )}
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
