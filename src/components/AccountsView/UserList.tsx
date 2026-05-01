import { useState } from 'react';
import { UserCircle, Monitor, UserX, Search, Shield, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAccountsStore } from '../../stores/accountsStore';
import type { LocalUser } from '../../utils/types';

function UserRow({ user }: { user: LocalUser }) {
  const [expanded, setExpanded] = useState(false);
  const { selectedUser, fetchUserDetail, selectUser } = useAccountsStore();

  const handleExpand = () => {
    if (!expanded) {
      fetchUserDetail(user.name);
    }
    setExpanded(!expanded);
  };

  const accountIcon = user.accountType === 'administrator'
    ? Shield
    : user.accountType === 'guest'
    ? UserX
    : UserCircle;

  const iconColor = user.accountType === 'administrator'
    ? 'var(--yellow)'
    : user.accountType === 'guest'
    ? 'var(--text-muted)'
    : 'var(--accent)';

  const AccountIcon = accountIcon;

  return (
    <>
      <tr
        className="clickable"
        onClick={handleExpand}
        style={{ cursor: 'pointer' }}
      >
        <td>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AccountIcon size={16} style={{ color: iconColor }} />
            <span style={{ fontWeight: 500 }}>{user.name}</span>
          </span>
        </td>
        <td>{user.fullName}</td>
        <td>
          {user.enabled ? (
            <span className="badge badge-green">已启用</span>
          ) : (
            <span className="badge badge-gray">已禁用</span>
          )}
        </td>
        <td>
          {user.accountType === 'administrator' ? (
            <span className="badge badge-yellow">管理员</span>
          ) : user.accountType === 'guest' ? (
            <span className="badge badge-gray">访客</span>
          ) : (
            <span className="badge badge-blue">标准用户</span>
          )}
        </td>
        <td className="text-mono text-sm text-muted">
          {user.lastLogon ? new Date(user.lastLogon).toLocaleDateString('zh-CN') : '从未登录'}
        </td>
        <td style={{ width: 30 }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
      </tr>
      {expanded && selectedUser && selectedUser.name === user.name && (
        <tr key={`${user.name}-detail`}>
          <td colSpan={6} style={{ padding: 0, background: 'var(--bg-primary)' }}>
            <div style={{ padding: '16px 24px' }}>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div>
                  <div className="text-sm text-muted mb-2">用户信息</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted" style={{ width: 80 }}>用户名:</span>
                      <span className="text-mono">{selectedUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted" style={{ width: 80 }}>全名:</span>
                      <span>{selectedUser.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted" style={{ width: 80 }}>描述:</span>
                      <span className="text-sm">{selectedUser.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted" style={{ width: 80 }}>SID:</span>
                      <span className="text-mono" style={{ fontSize: 11 }}>{selectedUser.sid}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted mb-2">账户状态</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm text-muted">密码年龄: {selectedUser.passwordAge} 天</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm text-muted">
                        最后登录: {selectedUser.lastLogon ? new Date(selectedUser.lastLogon).toLocaleString('zh-CN') : '从未'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted mb-2">组成员资格</div>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  {selectedUser.groups.map((g) => (
                    <span key={g} className="badge badge-blue">{g}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                <div className="text-sm text-muted mb-2">可用操作 (模拟)</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" disabled>重置密码</button>
                  <button className="btn btn-sm" disabled>启用/禁用账户</button>
                  <button className="btn btn-sm" disabled>更改账户类型</button>
                  <button className="btn btn-sm" disabled>管理组成员资格</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function UserList() {
  const { users } = useAccountsStore();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 12, maxWidth: 360 }}>
        <div style={{ position: 'relative' }}>
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
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>用户名</th>
                <th>全名</th>
                <th>状态</th>
                <th>类型</th>
                <th>最后登录</th>
                <th style={{ width: 30 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <UserRow key={user.name} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
