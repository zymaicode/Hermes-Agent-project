import { useState } from 'react';
import { Search, Key, Globe, Server, FileText, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { useAccountsStore } from '../../stores/accountsStore';
import type { CredentialEntry } from '../../utils/types';

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  generic: Key,
  domain: Globe,
  certificate: FileText,
  generic_certificate: Shield,
};

const TYPE_LABELS: Record<string, string> = {
  generic: '通用',
  domain: '域',
  certificate: '证书',
  generic_certificate: '通用证书',
};

function CredentialRow({ cred }: { cred: CredentialEntry }) {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = TYPE_ICONS[cred.type] ?? Key;

  return (
    <>
      <tr
        className="clickable"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <td>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>
              <TypeIcon size={14} />
            </span>
            <span className="text-mono truncate" style={{ fontSize: 12, maxWidth: 320 }}>
              {cred.targetName}
            </span>
          </span>
        </td>
        <td>
          <span className="badge badge-blue">{TYPE_LABELS[cred.type] ?? cred.type}</span>
        </td>
        <td className="text-mono text-sm">{cred.userName}</td>
        <td className="text-sm text-muted">
          {new Date(cred.lastModified).toLocaleDateString('zh-CN')}
        </td>
        <td style={{ width: 30 }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding: 0, background: 'var(--bg-primary)' }}>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted" style={{ width: 80 }}>目标名称:</span>
                  <span className="text-mono" style={{ fontSize: 12 }}>{cred.targetName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted" style={{ width: 80 }}>持久性:</span>
                  <span className="badge badge-blue">
                    {cred.persistence === 'enterprise' ? '企业' : cred.persistence === 'local_machine' ? '本地计算机' : '会话'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted" style={{ width: 80 }}>用户名:</span>
                  <span className="text-mono text-sm">{cred.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted" style={{ width: 80 }}>注释:</span>
                  <span className="text-sm">{cred.comment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted" style={{ width: 80 }}>最后修改:</span>
                  <span className="text-sm text-muted">
                    {new Date(cred.lastModified).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CredentialView() {
  const { credentials } = useAccountsStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = credentials.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.targetName.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q) ||
      c.comment.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, maxWidth: 520 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input"
            placeholder="搜索凭据..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select
          className="input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="all">全部类型</option>
          <option value="generic">通用</option>
          <option value="domain">域</option>
          <option value="certificate">证书</option>
          <option value="generic_certificate">通用证书</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>目标名称</th>
                <th>类型</th>
                <th>用户名</th>
                <th>最后修改</th>
                <th style={{ width: 30 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cred) => (
                <CredentialRow key={cred.targetName} cred={cred} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state" style={{ padding: '32px 24px' }}>
                      <Server size={32} className="empty-state-icon" />
                      <div className="empty-state-title">未找到匹配的凭据</div>
                      <div className="empty-state-desc">尝试调整搜索条件或类型筛选</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        共 {filtered.length} 条凭据 · 只读模式 — 凭据密码不可见
      </div>
    </div>
  );
}
