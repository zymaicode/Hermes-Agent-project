export interface CredentialEntry {
  targetName: string;
  type: 'generic' | 'domain' | 'certificate' | 'generic_certificate';
  persistence: 'session' | 'local_machine' | 'enterprise';
  userName: string;
  lastModified: string;
  comment: string;
}

const SIMULATED_CREDENTIALS: CredentialEntry[] = [
  {
    targetName: 'WindowsLive:target=virtualapp/didlogical',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'zhangsan@outlook.com',
    lastModified: '2026-04-15T10:30:00Z',
    comment: 'Microsoft 帐户登录凭据',
  },
  {
    targetName: 'MicrosoftOffice:target=...',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'zhangsan@outlook.com',
    lastModified: '2026-03-20T14:00:00Z',
    comment: 'Office 365 激活凭据',
  },
  {
    targetName: 'TERMSRV/192.168.1.100',
    type: 'generic',
    persistence: 'enterprise',
    userName: 'Administrator',
    lastModified: '2026-04-28T09:00:00Z',
    comment: '远程桌面连接凭据 - 服务器机房',
  },
  {
    targetName: 'TERMSRV/192.168.1.101',
    type: 'generic',
    persistence: 'enterprise',
    userName: 'devuser',
    lastModified: '2026-04-25T16:30:00Z',
    comment: '远程桌面连接凭据 - 开发服务器',
  },
  {
    targetName: 'TERMSRV/192.168.1.200',
    type: 'generic',
    persistence: 'enterprise',
    userName: 'backup_svc',
    lastModified: '2026-01-10T08:00:00Z',
    comment: '远程桌面连接凭据 - 备份服务器',
  },
  {
    targetName: 'git:https://github.com',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'devuser',
    lastModified: '2026-04-30T11:20:00Z',
    comment: 'GitHub Personal Access Token',
  },
  {
    targetName: 'git:https://gitlab.internal',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'zhangsan',
    lastModified: '2026-04-22T08:45:00Z',
    comment: '内部 GitLab 凭据',
  },
  {
    targetName: '*.internal.corp',
    type: 'domain',
    persistence: 'enterprise',
    userName: 'CORP\\zhangsan',
    lastModified: '2026-05-01T06:00:00Z',
    comment: '企业域凭据 - 自动续期',
  },
  {
    targetName: 'virtualapp/didlogical',
    type: 'generic_certificate',
    persistence: 'local_machine',
    userName: 'zhangsan@outlook.com',
    lastModified: '2026-04-15T10:30:00Z',
    comment: 'Microsoft 帐户证书',
  },
  {
    targetName: 'WindowsDefender:...',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'SYSTEM',
    lastModified: '2026-04-01T00:00:00Z',
    comment: 'Windows Defender 安全凭据',
  },
  {
    targetName: 'Chrome:https://mail.qq.com',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'zhangsan@qq.com',
    lastModified: '2026-04-29T18:30:00Z',
    comment: 'Chrome 保存的密码 - QQ 邮箱',
  },
  {
    targetName: 'Chrome:https://pan.baidu.com',
    type: 'generic',
    persistence: 'local_machine',
    userName: 'zhangsan',
    lastModified: '2026-04-20T22:00:00Z',
    comment: 'Chrome 保存的密码 - 百度网盘',
  },
];

export class CredentialManager {
  listCredentials(): CredentialEntry[] {
    return SIMULATED_CREDENTIALS;
  }

  removeCredential(targetName: string): boolean {
    return true;
  }
}
