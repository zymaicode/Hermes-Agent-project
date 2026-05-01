import { useEffect } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { usePolicyStore } from '../../stores/policyStore';
import type { PolicyCategory } from '../../../electron/policy/policyManager';

interface TreeNode {
  category: PolicyCategory;
  children: TreeNode[];
  level: number;
  expanded: boolean;
}

export default function PolicyTree() {
  const categories = usePolicyStore((s) => s.categories);
  const selectedCategoryId = usePolicyStore((s) => s.selectedCategoryId);
  const selectCategory = usePolicyStore((s) => s.selectCategory);
  const searchQuery = usePolicyStore((s) => s.searchQuery);
  const setSearchQuery = usePolicyStore((s) => s.setSearchQuery);
  const loadCategories = usePolicyStore((s) => s.loadCategories);
  const selectedPolicyId = usePolicyStore((s) => s.selectedPolicyId);
  const selectedPolicies = usePolicyStore((s) => s.policies);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Build tree structure
  const buildTree = (): TreeNode[] => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    for (const cat of categories) {
      map.set(cat.id, { category: cat, children: [], level: 0, expanded: true });
    }
    for (const cat of categories) {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        node.level = 0;
        roots.push(node);
      }
    }
    return roots;
  };

  const tree = buildTree();

  const handleCategoryClick = (categoryId: string) => {
    selectCategory(categoryId);
  };

  const renderNode = (node: TreeNode): React.ReactNode => {
    const isSelected = selectedCategoryId === node.category.id;
    const hasChildren = node.children.length > 0;
    const isRoot = node.level === 0;

    return (
      <div key={node.category.id}>
        <div
          onClick={() => handleCategoryClick(node.category.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: `${isRoot ? 5 : 3}px 8px`,
            paddingLeft: 8 + node.level * 16,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            background: isSelected ? 'var(--accent-muted)' : 'transparent',
            color: isSelected ? 'var(--accent)' : isRoot ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: isRoot ? 13 : 12,
            fontWeight: isRoot ? 600 : isSelected ? 500 : 400,
            transition: 'background 0.1s, color 0.1s',
            marginBottom: 1,
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isRoot ? 'var(--text-primary)' : 'var(--text-secondary)';
            }
          }}
        >
          {hasChildren ? (
            <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
          ) : (
            <span style={{ width: 12, flexShrink: 0 }} />
          )}
          <span className="truncate">{node.category.name}</span>
          {node.category.childCount > 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>
              {node.category.childCount}
            </span>
          )}
        </div>
        {node.children.map(renderNode)}
      </div>
    );
  };

  // Compute policy count for selected category
  const configuredCount = selectedPolicies.filter((p) => p.state !== 'not_configured').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 220 }}>
      {/* Search */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="input"
            placeholder="搜索策略..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 12, paddingTop: 5, paddingBottom: 5 }}
          />
        </div>
      </div>

      {/* Category Tree */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px 16px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 8px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          策略分类
        </div>
        {tree.map(renderNode)}
        {tree.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            加载中...
          </div>
        )}
      </div>

      {/* Footer stats */}
      {selectedCategoryId && (
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--border-color)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          <div>{selectedPolicies.length} 条策略</div>
          {configuredCount > 0 && (
            <div style={{ color: 'var(--accent)', marginTop: 2 }}>
              {configuredCount} 已配置
            </div>
          )}
        </div>
      )}
    </div>
  );
}
