import { useEffect } from 'react';
import { FileCode } from 'lucide-react';
import PolicyTree from './PolicyTree';
import PolicyList from './PolicyList';
import PolicyDetail from './PolicyDetail';
import { usePolicyStore } from '../../stores/policyStore';

export default function PolicyView() {
  const searchQuery = usePolicyStore((s) => s.searchQuery);
  const setSearchQuery = usePolicyStore((s) => s.setSearchQuery);
  const policies = usePolicyStore((s) => s.policies);
  const selectedCategoryId = usePolicyStore((s) => s.selectedCategoryId);

  // When search query changes, filter is applied locally in PolicyList using the already-loaded data.
  // But if no category is selected and there's a search query, search across all policies via IPC.
  useEffect(() => {
    if (searchQuery.trim() && !selectedCategoryId) {
      // Search across all — load root categories and search policies
      // For now, search filtering happens locally in PolicyList when a category is selected.
      // Searches without a category selected show no results since policies aren't loaded.
    }
  }, [searchQuery, selectedCategoryId]);

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      {/* Title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FileCode size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            本地策略编辑器
          </h2>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
            Group Policy Browser — 只读查看
          </div>
        </div>
        {/* Read-only badge */}
        <div style={{
          marginLeft: 'auto',
          padding: '3px 10px',
          borderRadius: 10,
          background: 'rgba(88,166,255,0.1)',
          border: '1px solid rgba(88,166,255,0.25)',
          fontSize: 11,
          color: 'var(--accent)',
          fontWeight: 500,
        }}>
          只读模式
        </div>
      </div>

      {/* 3-panel layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {/* Left: Category Tree */}
        <div style={{
          width: 240,
          minWidth: 240,
          borderRight: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          <PolicyTree />
        </div>

        {/* Center: Policy List */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex' }}>
          <PolicyList />
        </div>

        {/* Right: Policy Detail */}
        <div style={{
          width: 340,
          minWidth: 340,
          borderLeft: '1px solid var(--border-color)',
          overflow: 'hidden',
          display: 'flex',
        }}>
          <PolicyDetail />
        </div>
      </div>
    </div>
  );
}
