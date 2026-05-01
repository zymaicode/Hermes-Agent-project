import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  BellOff,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  HardDrive,
  Monitor,
  BrainCircuit,
} from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import type { Alert, AlertSeverity } from '../../utils/types';

const severityConfig: Record<AlertSeverity, { color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
  info: { color: 'var(--accent)', bg: 'rgba(88, 166, 255, 0.12)', icon: Info },
  warning: { color: 'var(--yellow)', bg: 'rgba(210, 153, 34, 0.12)', icon: AlertTriangle },
  critical: { color: 'var(--red)', bg: 'rgba(248, 81, 73, 0.12)', icon: AlertCircle },
};

const typeIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  'cpu.temp': Cpu,
  'cpu.usage': Cpu,
  'gpu.temp': Monitor,
  'gpu.usage': Monitor,
  'memory.usage': HardDrive,
  'disk.usage': HardDrive,
  ai_analysis: BrainCircuit,
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

interface AlertCardProps {
  alert: Alert;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

function AlertCard({ alert, expanded, onToggle, onDismiss, onSnooze }: AlertCardProps) {
  const sev = severityConfig[alert.severity];
  const SevIcon = sev.icon;
  const TypeIcon = alert.sourceMetric
    ? typeIcons[alert.sourceMetric] || AlertCircle
    : typeIcons['ai_analysis'] || BrainCircuit;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${sev.color}33`,
        borderLeft: `3px solid ${sev.color}`,
        borderRadius: 'var(--radius)',
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'slideDown 0.25s ease-out',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: sev.bg,
            color: sev.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <SevIcon size={16} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {alert.title}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: sev.bg,
                color: sev.color,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {alert.severity}
            </span>
            {alert.type === 'ai_analysis' && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'rgba(163, 113, 247, 0.12)',
                  color: 'var(--purple)',
                  fontWeight: 600,
                }}
              >
                AI
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {alert.message}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {formatRelativeTime(alert.timestamp)}
            </span>
            {alert.sourceMetric && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                <TypeIcon size={12} />
                {alert.sourceMetric}
              </span>
            )}
            {alert.currentValue != null && alert.threshold != null && (
              <span style={{ fontSize: 11, color: sev.color, fontWeight: 500 }}>
                {alert.currentValue.toFixed(1)} / {alert.threshold}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            padding: '0 14px 12px 56px',
            borderTop: '1px solid var(--border-color)',
            marginTop: 0,
            paddingTop: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 12,
              whiteSpace: 'pre-wrap',
            }}
          >
            {alert.detail}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              <X size={14} />
              Dismiss
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSnooze(15);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              <Clock size={14} />
              Snooze 15m
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSnooze(60);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              <Clock size={14} />
              Snooze 1h
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertModal() {
  const activeAlerts = useAlertStore((s) => s.activeAlerts);
  const showAlertModal = useAlertStore((s) => s.showAlertModal);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);
  const snoozeAlert = useAlertStore((s) => s.snoozeAlert);
  const dismissAllAlerts = useAlertStore((s) => s.dismissAllAlerts);
  const hideAlert = useAlertStore((s) => s.hideAlert);
  const subscribeToAlerts = useAlertStore((s) => s.subscribeToAlerts);
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribeToAlerts();
    fetchAlerts();
    return unsub;
  }, [subscribeToAlerts, fetchAlerts]);

  // Auto-dismiss cleared: if no active alerts remain, hide modal
  useEffect(() => {
    if (activeAlerts.length === 0 && showAlertModal) {
      const timer = setTimeout(() => hideAlert(), 300);
      return () => clearTimeout(timer);
    }
  }, [activeAlerts.length, showAlertModal, hideAlert]);

  if (!showAlertModal || activeAlerts.length === 0) return null;

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) hideAlert();
      }}
    >
      <div
        style={{
          width: 520,
          maxHeight: '80vh',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeSlideIn 0.2s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: criticalCount > 0 ? 'rgba(248, 81, 73, 0.15)' : 'rgba(210, 153, 34, 0.15)',
                color: criticalCount > 0 ? 'var(--red)' : 'var(--yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={15} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                System Alerts
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
                {criticalCount > 0 && (
                  <span style={{ color: 'var(--red)', marginLeft: 6 }}>{criticalCount} critical</span>
                )}
                {warningCount > 0 && (
                  <span style={{ color: 'var(--yellow)', marginLeft: 6 }}>{warningCount} warning</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={dismissAllAlerts}
              title="Dismiss all"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'inherit',
              }}
            >
              <BellOff size={13} />
              Dismiss All
            </button>
            <button
              onClick={hideAlert}
              style={{
                padding: 4,
                borderRadius: 'var(--radius)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Alert list */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px 18px',
          }}
        >
          {activeAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              expanded={expandedAlerts.has(alert.id)}
              onToggle={() =>
                setExpandedAlerts((prev) => {
                  const next = new Set(prev);
                  if (next.has(alert.id)) next.delete(alert.id);
                  else next.add(alert.id);
                  return next;
                })
              }
              onDismiss={() => {
                setExpandedAlerts((prev) => {
                  const next = new Set(prev);
                  next.delete(alert.id);
                  return next;
                });
                dismissAlert(alert.id);
              }}
              onSnooze={(minutes) => {
                setExpandedAlerts((prev) => {
                  const next = new Set(prev);
                  next.delete(alert.id);
                  return next;
                });
                snoozeAlert(alert.id, minutes);
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-color)',
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          Alerts auto-resolve when metrics return to normal
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
