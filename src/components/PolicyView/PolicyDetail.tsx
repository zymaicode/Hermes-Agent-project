import { useMemo } from 'react';
import { Copy, Info } from 'lucide-react';
import { usePolicyStore } from '../../stores/policyStore';
import type { PolicyEntry } from '../../../electron/policy/policyManager';

const STATE_LABELS: Record<PolicyEntry['state'], { label: string; color: string; bg: string }> = {
  enabled: { label: '已启用', color: '#3fb950', bg: 'rgba(63,185,80,0.15)' },
  disabled: { label: '已禁用', color: '#f85149', bg: 'rgba(248,81,73,0.15)' },
  not_configured: { label: '未配置', color: '#8b949e', bg: 'rgba(139,148,158,0.12)' },
};

export default function PolicyDetail() {
  const selectedPolicyId = usePolicyStore((s) => s.selectedPolicyId);
  const policies = usePolicyStore((s) => s.policies);

  const policy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId]
  );

  const handleCopyRegistry = () => {
    if (policy) {
      navigator.clipboard.writeText(policy.registryKey).catch(() => {});
    }
  };

  if (!selectedPolicyId) {
    return (
      <div className="empty-state" style={{ minWidth: 260, borderLeft: '1px solid var(--border-color)' }}>
        <div className="empty-state-icon" style={{ fontSize: 36 }}>📄</div>
        <div className="empty-state-title">选择一条策略</div>
        <div className="empty-state-desc">从策略列表中选择一条查看详细信息</div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="empty-state" style={{ minWidth: 260 }}>
        <div className="empty-state-desc">未找到策略</div>
      </div>
    );
  }

  const stateInfo = STATE_LABELS[policy.state];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 280, maxWidth: 400, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
          {policy.name}
        </h3>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 10px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 600,
          background: stateInfo.bg,
          color: stateInfo.color,
        }}>
          {stateInfo.label}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Description */}
        <DetailSection label="描述">
          {policy.description}
        </DetailSection>

        {/* Supported On */}
        <DetailSection label="支持的操作系统">
          {policy.supportedOn}
        </DetailSection>

        {/* Help Text */}
        {policy.helpText && (
          <DetailSection label="帮助说明">
            {policy.helpText}
          </DetailSection>
        )}

        {/* Options */}
        {policy.options && policy.options.length > 0 && (
          <DetailSection label="可用选项">
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {policy.options.map((opt, i) => (
                <li key={i} style={{ marginBottom: 2, fontSize: 12, color: 'var(--text-secondary)' }}>{opt}</li>
              ))}
            </ul>
          </DetailSection>
        )}

        {/* Registry Key */}
        <DetailSection label="注册表路径(只读)">
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
            lineHeight: 1.5,
          }}>
            <div>{policy.registryKey}</div>
            <div style={{ color: 'var(--accent)', marginTop: 2 }}>{policy.registryValue}</div>
          </div>
          <button
            onClick={handleCopyRegistry}
            className="btn btn-sm"
            style={{ marginTop: 6, gap: 4 }}
          >
            <Copy size={12} />
            复制注册表路径
          </button>
        </DetailSection>

        {/* Warning banner */}
        <div style={{
          marginTop: 16,
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(88,166,255,0.08)',
          border: '1px solid rgba(88,166,255,0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            此工具为只读查看，修改策略请使用 gpedit.msc 或相关管理工具。
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
