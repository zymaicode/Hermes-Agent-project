import { useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Monitor,
  AppWindow,
  AlertTriangle,
  Bell,
  Heart,
  HeartPulse,
  MessageSquare,
  Settings,
  RefreshCw,
  ChevronRight,
  Zap,
  Wrench,
  Wifi,
  Thermometer,
  Activity,
  Gauge,
  Calendar,
  Shield,
  Usb,
  Trash2,
  ShieldCheck,
  ClipboardList,
  Server,
  ScrollText,
  Battery,
  LineChart,
  Search,
  GitFork,
  FileType,
  MonitorSmartphone,
  RotateCcw,
  FileText,
  MemoryStick,
  Package,
  Volume2,
  Type,
  Eye,
  UserCircle,
  Network,
  FileCode,
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
}

const navSections: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Monitoring',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'repair', label: 'Repair', icon: Wrench },
      { id: 'overlay', label: 'Overlay', icon: Eye },
      { id: 'hardware', label: 'Hardware', icon: Cpu },
      { id: 'memory', label: 'Memory', icon: MemoryStick },
      { id: 'software', label: 'Software', icon: Monitor },
      { id: 'temperatures', label: 'Temps', icon: Thermometer },
      { id: 'network', label: 'Network', icon: Wifi },
    ],
  },
  {
    heading: 'System',
    items: [
      { id: 'process', label: 'Processes', icon: Activity },
      { id: 'startup', label: 'Startup', icon: Zap },
      { id: 'services', label: 'Services', icon: Server },
      { id: 'drivers', label: 'Drivers', icon: Cpu },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { id: 'benchmark', label: 'Benchmark', icon: Gauge },
      { id: 'registry', label: 'Registry', icon: Search },
      { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
      { id: 'filetypes', label: 'File Types', icon: FileType },
      { id: 'netdiag', label: 'Net Diag', icon: Network },
    ],
  },
  {
    heading: 'Security',
    items: [
      { id: 'firewall', label: 'Firewall', icon: Shield },
      { id: 'security', label: 'Security', icon: ShieldCheck },
      { id: 'usb', label: 'USB Devices', icon: Usb },
      { id: 'accounts', label: 'Accounts', icon: UserCircle },
    ],
  },
  {
    heading: 'Management',
    items: [
      { id: 'apps', label: 'Apps', icon: AppWindow },
      { id: 'updates', label: 'Updates', icon: RefreshCw },
      { id: 'scheduler', label: 'Tasks', icon: Calendar },
      { id: 'power', label: 'Power Plan', icon: Zap },
      { id: 'features', label: 'Features', icon: Package },
    ],
  },
  {
    heading: 'Advanced',
    items: [
      { id: 'restore', label: 'Restore', icon: RotateCcw },
      { id: 'policy', label: 'Group Policy', icon: FileCode },
      { id: 'filescanner', label: 'File Scanner', icon: Search },
      { id: 'remote', label: 'Remote', icon: Monitor },
      { id: 'report', label: 'Report', icon: FileText },
    ],
  },
  {
    heading: 'Data',
    items: [
      { id: 'health', label: 'Health', icon: Heart },
      { id: 'aiDiagnostic', label: 'AI 体检', icon: HeartPulse },
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
      { id: 'battery', label: 'Battery', icon: Battery },
      { id: 'clipboard', label: 'Clipboard', icon: ClipboardList },
      { id: 'perflog', label: 'Perf Log', icon: LineChart },
      { id: 'eventlog', label: 'Event Log', icon: ScrollText },
      { id: 'netconn', label: 'Net Connections', icon: GitFork },
    ],
  },
  {
    heading: 'Other',
    items: [
      { id: 'display', label: 'Display', icon: MonitorSmartphone },
      { id: 'sounds', label: 'Sounds', icon: Volume2 },
      { id: 'fonts', label: 'Fonts', icon: Type },
      { id: 'devices', label: 'Devices', icon: MonitorSmartphone },
      { id: 'system', label: 'System Info', icon: Monitor },
      { id: 'ai', label: 'AI Chat', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
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

  const getBadge = (id: NavPage) => {
    if (id === 'conflicts' && highCount > 0) {
      return { count: highCount, bg: 'var(--red)', color: '#fff' };
    }
    if (id === 'updates' && updatesCount > 0) {
      return { count: updatesCount, bg: 'var(--yellow)', color: '#000' };
    }
    if (id === 'alerts' && criticalAlertCount > 0) {
      return { count: criticalAlertCount, bg: 'var(--red)', color: '#fff' };
    }
    if (id === 'health' && healthScore !== undefined) {
      return {
        count: healthScore,
        bg: healthScore >= 85 ? 'var(--green)' :
            healthScore >= 70 ? 'var(--accent)' :
            healthScore >= 50 ? 'var(--yellow)' :
            healthScore >= 30 ? 'var(--orange)' :
            'var(--red)',
        color: healthScore >= 50 ? '#000' : '#fff',
      };
    }
    return null;
  };

  return (
    <div className="sidebar" style={{ scrollBehavior: 'smooth' }}>
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
          {navSections.map((section) => (
            <div key={section.heading}>
              <div className="sidebar-section">{section.heading}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                const badge = getBadge(item.id);
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
                      textAlign: 'left' as const,
                      width: '100%',
                      transition: 'background 0.15s, color 0.15s',
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                      paddingLeft: isActive ? 9 : 12,
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
                    {badge && (
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
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
                        {badge.count}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} />}
                  </button>
                );
              })}
            </div>
          ))}
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
