import { useEffect, useState } from 'react';
import { UserCircle, Shield, Key } from 'lucide-react';
import { useAccountsStore } from '../../stores/accountsStore';
import { UserList } from './UserList';
import { UacSettingsView } from './UacSettings';
import { CredentialView } from './CredentialView';
import { LoadingSpinner } from '../common/LoadingState';

type AccountsTab = 'users' | 'uac' | 'credentials';

const TABS: { id: AccountsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'users', label: '用户', icon: UserCircle },
  { id: 'uac', label: 'UAC', icon: Shield },
  { id: 'credentials', label: '凭据', icon: Key },
];

export default function AccountsView() {
  const [activeTab, setActiveTab] = useState<AccountsTab>('users');
  const { users, fetchUsers, fetchGroups, fetchUacSettings, fetchCredentials, loading } = useAccountsStore();

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchGroups(),
      fetchUacSettings(),
      fetchCredentials(),
    ]);
  }, [fetchUsers, fetchGroups, fetchUacSettings, fetchCredentials]);

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>用户账户管理</h2>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <tab.icon size={14} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'users' && <UserList />}
        {activeTab === 'uac' && <UacSettingsView />}
        {activeTab === 'credentials' && <CredentialView />}
      </div>
    </div>
  );
}
