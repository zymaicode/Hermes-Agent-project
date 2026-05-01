import { useMemo } from 'react';
import { usePolicyStore } from '../../stores/policyStore';
import type { StateFilter } from '../../stores/policyStore';
import type { PolicyEntry } from '../../../electron/policy/policyManager';

const STATE_LABELS: Record<PolicyEntry['state'], string> = {
  enabled: '已启用',
  disabled: '已禁用',
  not_configured: '未配置',
};

const STATE_COLORS: Record<PolicyEntry['state'], { bg: string; text: string; border: string }> = {
  enabled: { bg: 'rgba(63,185,80,0.15)', text: '#3fb950', border: 'rgba(63,185,80,0.3)' },
  disabled: { bg: 'rgba(248,81,73,0.15)', text: '#f85149', border: 'rgba(248,81,73,0.3)' },
  not_configured: { bg: 'rgba(139,148,158,0.12)', text: '#8b949e', border: 'rgba(139,148,158,0.25)' },
};

const FILTER_OPTIONS: { id: StateFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'configured', label: '已配置' },
  { id: 'not_configured', label: '未配置' },
];

export default function PolicyList() {
  const policies = usePolicyStore((s) => s.policies);
  const searchQuery = usePolicyStore((s) => s.searchQuery);
  const stateFilter = usePolicyStore((s) => s.stateFilter);
  const setStateFilter = usePolicyStore((s) => s.setStateFilter);
  const selectedCategoryId = usePolicyStore((s) => s.selectedCategoryId);
  const selectedPolicyId = usePolicyStore((s) => s.selectedPolicyId);
  const selectPolicy = usePolicyStore((s) => s.selectPolicy);

  const filteredPolicies = useMemo(() => {
    let result = policies;

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Apply state filter
    if (stateFilter === 'configured') {
      result = result.filter((p) => p.state !== 'not_configured');
    } else if (stateFilter === 'not_configured') {
      result = result.filter((p) => p.state === 'not_configured');
    }

    return result;
  }, [policies, searchQuery, stateFilter]);

  const configuredCount = filteredPolicies.filter((p) => p.state !== 'not_configured').length;

  if (!selectedCategoryId) {
    return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon" style={{ fontSize: 40 }}>📋</div>
        <div className="empty-state-title">选择策略类别</div>
        <div className="empty-state-desc">从左侧分类树中选择一个类别查看相关策略</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, borderRight: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          显示 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredPolicies.length}</span> 条策略
          {configuredCount > 0 && (
            <span> (<span style={{ color: 'var(--accent)' }}>{configuredCount} 已配置</span>)</span>
          )}
        </div>

        {/* State filter buttons */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStateFilter(opt.id)}
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: stateFilter === opt.id ? 'var(--accent)' : 'transparent',
                color: stateFilter === opt.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policy list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredPolicies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-desc">没有匹配的策略</div>
          </div>
        ) : (
          filteredPolicies.map((policy) => {
            const isSelected = selectedPolicyId === policy.id;
            const stateStyle = STATE_COLORS[policy.state];
            return (
              <div
                key={policy.id}
                onClick={() => selectPolicy(policy.id)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-muted)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-muted)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: stateStyle.bg,
                    color: stateStyle.text,
                    border: `1px solid ${stateStyle.border}`,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {STATE_LABELS[policy.state]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                    {policy.name}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 2 }} className="truncate">
                  {policy.description}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
