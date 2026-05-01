import { useAccountsStore } from '../../stores/accountsStore';
import { Shield, ShieldCheck, ShieldAlert, Monitor, Info } from 'lucide-react';

const UAC_LEVELS = [
  { level: 0, label: '从不通知', desc: '完全禁用UAC。不推荐，会降低系统安全性。', color: 'var(--red)' },
  { level: 1, label: '仅通知 (无安全桌面)', desc: '当应用尝试更改计算机时通知，但不使用安全桌面。', color: 'var(--orange)' },
  { level: 2, label: '默认 — 仅通知', desc: '仅当应用尝试更改计算机时通知。Windows 默认设置，平衡安全与便利。', color: 'var(--green)' },
  { level: 3, label: '始终通知', desc: '始终在应用尝试更改或用户更改设置时通知。最高安全级别。', color: 'var(--accent)' },
];

export function UacSettingsView() {
  const { uacSettings } = useAccountsStore();

  if (!uacSettings) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">无法加载UAC设置</div>
      </div>
    );
  }

  const currentLevel = uacSettings.level;
  const recommendedLevel = 2;

  return (
    <div>
      {/* UAC Level Info Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>用户账户控制 (UAC)</div>
            <div className="text-sm text-muted">User Account Control — 防止未经授权的系统更改</div>
          </div>
        </div>
        <div className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
          用户账户控制 (UAC) 是 Windows 安全功能，当需要管理员权限的操作发生时，会提示用户确认。
          这有助于防止恶意软件在未经授权的情况下更改系统设置或安装软件。
          建议保持默认级别 (级别 2) 以获得最佳的安全性和用户体验平衡。
        </div>
      </div>

      {/* UAC Level Slider */}
      <div className="card mb-4">
        <div className="card-title" style={{ marginBottom: 16 }}>UAC 通知级别</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {UAC_LEVELS.map((lvl) => {
            const isCurrent = lvl.level === currentLevel;
            const isRecommended = lvl.level === recommendedLevel;

            return (
              <div
                key={lvl.level}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  background: isCurrent ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border-muted)',
                  cursor: 'default',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: isCurrent ? lvl.color : 'var(--bg-tertiary)',
                      color: isCurrent ? '#fff' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {lvl.level}
                    </span>
                    <span style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {lvl.label}
                    </span>
                    {isCurrent && <span className="badge badge-green">当前</span>}
                    {isRecommended && <span className="badge badge-blue">推荐</span>}
                  </div>
                  <div className="text-sm text-muted" style={{ paddingLeft: 36 }}>{lvl.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Settings */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>详细设置</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SettingRow
            label="管理员审批模式"
            desc="所有管理员运行在标准用户模式下，操作需要明确批准"
            enabled={uacSettings.adminApprovalMode}
            icon={Shield}
          />
          <SettingRow
            label="安全桌面"
            desc="UAC 提示显示在安全桌面上，防止其他程序干扰"
            enabled={uacSettings.secureDesktop}
            icon={Monitor}
          />
          <SettingRow
            label="安装程序检测"
            desc="检测安装程序的启动并触发 UAC 提示"
            enabled={uacSettings.installerDetection}
            icon={ShieldAlert}
          />
          <SettingRow
            label="文件/注册表虚拟化"
            desc="将旧程序的写入重定向到每用户位置，提高兼容性"
            enabled={uacSettings.virtualization}
            icon={Info}
          />
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label, desc, enabled, icon: Icon,
}: {
  label: string;
  desc: string;
  enabled: boolean;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '12px 0',
        borderBottom: '1px solid var(--border-muted)',
      }}
    >
      <div className="flex items-center gap-3" style={{ flex: 1 }}>
        <span style={{ color: enabled ? 'var(--green)' : 'var(--text-muted)', display: 'flex' }}>
          <Icon size={16} />
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
          <div className="text-sm text-muted">{desc}</div>
        </div>
      </div>
      <span className={`badge ${enabled ? 'badge-green' : 'badge-gray'}`}>
        {enabled ? '已启用' : '已禁用'}
      </span>
    </div>
  );
}
