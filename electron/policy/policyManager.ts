export interface PolicyCategory {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  childCount: number;
  path: string;
}

export interface PolicyEntry {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  supportedOn: string;
  state: 'not_configured' | 'enabled' | 'disabled';
  helpText: string;
  registryKey: string;
  registryValue: string;
  options?: string[];
}

// ── Category tree ──────────────────────────────────────────────

const CATEGORIES: PolicyCategory[] = [
  // Computer Configuration root
  { id: 'computer', name: '计算机配置', description: '计算机级别的策略设置', parentId: null, childCount: 3, path: '计算机配置' },
  { id: 'comp-software', name: '软件设置', description: '软件安装和设置策略', parentId: 'computer', childCount: 0, path: '计算机配置 > 软件设置' },
  { id: 'comp-windows', name: 'Windows 设置', description: 'Windows 系统设置', parentId: 'computer', childCount: 2, path: '计算机配置 > Windows 设置' },
  { id: 'comp-win-security', name: '安全设置', description: '安全策略和账户策略', parentId: 'comp-windows', childCount: 0, path: '计算机配置 > Windows 设置 > 安全设置' },
  { id: 'comp-win-scripts', name: '脚本(启动/关机)', description: '启动和关机脚本', parentId: 'comp-windows', childCount: 0, path: '计算机配置 > Windows 设置 > 脚本(启动/关机)' },
  { id: 'comp-admin', name: '管理模板', description: '基于注册表的策略设置', parentId: 'computer', childCount: 5, path: '计算机配置 > 管理模板' },
  // Administrative Templates subcategories
  { id: 'comp-adm-wincomp', name: 'Windows 组件', description: 'Windows 组件策略', parentId: 'comp-admin', childCount: 13, path: '计算机配置 > 管理模板 > Windows 组件' },
  { id: 'comp-adm-edge', name: 'Microsoft Edge', description: 'Edge 浏览器策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Microsoft Edge' },
  { id: 'comp-adm-ie', name: 'Internet Explorer', description: 'IE 浏览器策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Internet Explorer' },
  { id: 'comp-adm-wu', name: 'Windows Update', description: 'Windows 更新策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Windows Update' },
  { id: 'comp-adm-defender', name: 'Windows Defender', description: 'Defender 防病毒策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Windows Defender' },
  { id: 'comp-adm-explorer', name: '文件资源管理器', description: 'File Explorer 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > 文件资源管理器' },
  { id: 'comp-adm-tasksched', name: '任务计划程序', description: 'Task Scheduler 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > 任务计划程序' },
  { id: 'comp-adm-ps', name: 'Windows PowerShell', description: 'PowerShell 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Windows PowerShell' },
  { id: 'comp-adm-search', name: 'Windows 搜索', description: 'Search 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > Windows 搜索' },
  { id: 'comp-adm-rdp', name: '远程桌面服务', description: 'Remote Desktop 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > 远程桌面服务' },
  { id: 'comp-adm-bitlocker', name: 'BitLocker 驱动器加密', description: 'BitLocker 策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > BitLocker 驱动器加密' },
  { id: 'comp-adm-appx', name: 'AppX 部署', description: '应用包部署策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > AppX 部署' },
  { id: 'comp-adm-smartscreen', name: 'SmartScreen', description: 'SmartScreen 筛选器策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > SmartScreen' },
  { id: 'comp-adm-onedrive', name: 'OneDrive', description: 'OneDrive 同步策略', parentId: 'comp-adm-wincomp', childCount: 0, path: '计算机配置 > 管理模板 > Windows 组件 > OneDrive' },
  { id: 'comp-adm-system', name: '系统', description: '系统策略设置', parentId: 'comp-admin', childCount: 0, path: '计算机配置 > 管理模板 > 系统' },
  { id: 'comp-adm-network', name: '网络', description: '网络策略设置', parentId: 'comp-admin', childCount: 0, path: '计算机配置 > 管理模板 > 网络' },
  { id: 'comp-adm-startmenu', name: '开始菜单和任务栏', description: '开始菜单和任务栏策略', parentId: 'comp-admin', childCount: 0, path: '计算机配置 > 管理模板 > 开始菜单和任务栏' },
  { id: 'comp-adm-desktop', name: '桌面', description: '桌面策略设置', parentId: 'comp-admin', childCount: 0, path: '计算机配置 > 管理模板 > 桌面' },
  { id: 'comp-adm-controlpanel', name: '控制面板', description: '控制面板策略设置', parentId: 'comp-admin', childCount: 0, path: '计算机配置 > 管理模板 > 控制面板' },

  // User Configuration root
  { id: 'user', name: '用户配置', description: '用户级别的策略设置', parentId: null, childCount: 3, path: '用户配置' },
  { id: 'user-software', name: '软件设置', description: '用户软件安装策略', parentId: 'user', childCount: 0, path: '用户配置 > 软件设置' },
  { id: 'user-windows', name: 'Windows 设置', description: '用户 Windows 设置', parentId: 'user', childCount: 0, path: '用户配置 > Windows 设置' },
  { id: 'user-admin', name: '管理模板', description: '用户管理模板策略', parentId: 'user', childCount: 5, path: '用户配置 > 管理模板' },
  { id: 'user-adm-wincomp', name: 'Windows 组件', description: 'Windows 组件策略', parentId: 'user-admin', childCount: 6, path: '用户配置 > 管理模板 > Windows 组件' },
  { id: 'user-adm-edge', name: 'Microsoft Edge', description: 'Edge 浏览器策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > Microsoft Edge' },
  { id: 'user-adm-ie', name: 'Internet Explorer', description: 'IE 浏览器策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > Internet Explorer' },
  { id: 'user-adm-explorer', name: '文件资源管理器', description: 'File Explorer 策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > 文件资源管理器' },
  { id: 'user-adm-search', name: 'Windows 搜索', description: 'Search 策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > Windows 搜索' },
  { id: 'user-adm-rdp', name: '远程桌面服务', description: 'Remote Desktop 策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > 远程桌面服务' },
  { id: 'user-adm-onedrive', name: 'OneDrive', description: 'OneDrive 策略', parentId: 'user-adm-wincomp', childCount: 0, path: '用户配置 > 管理模板 > Windows 组件 > OneDrive' },
  { id: 'user-adm-system', name: '系统', description: '系统策略设置', parentId: 'user-admin', childCount: 0, path: '用户配置 > 管理模板 > 系统' },
  { id: 'user-adm-network', name: '网络', description: '网络策略设置', parentId: 'user-admin', childCount: 0, path: '用户配置 > 管理模板 > 网络' },
  { id: 'user-adm-startmenu', name: '开始菜单和任务栏', description: '开始菜单和任务栏策略', parentId: 'user-admin', childCount: 0, path: '用户配置 > 管理模板 > 开始菜单和任务栏' },
  { id: 'user-adm-desktop', name: '桌面', description: '桌面策略设置', parentId: 'user-admin', childCount: 0, path: '用户配置 > 管理模板 > 桌面' },
  { id: 'user-adm-controlpanel', name: '控制面板', description: '控制面板策略设置', parentId: 'user-admin', childCount: 0, path: '用户配置 > 管理模板 > 控制面板' },
];

// ── Policy entries (~100 realistic policies) ──────────────────

const POLICIES: PolicyEntry[] = [
  // ── Computer > Admin Templates > Windows Update ──
  {
    id: 'pol-wu-001', categoryId: 'comp-adm-wu',
    name: '关闭 Windows 更新',
    description: '禁用 Windows 自动更新功能。启用后系统将不会自动下载和安装更新。',
    supportedOn: 'Windows 11, Windows 10, Windows Server 2022',
    state: 'not_configured',
    helpText: '如果启用此策略设置，Windows Update 将不会自动下载和安装更新。用户仍然可以手动检查更新。如果禁用或未配置，Windows Update 将按照默认设置自动更新。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    registryValue: 'NoAutoUpdate (DWORD)',
  },
  {
    id: 'pol-wu-002', categoryId: 'comp-adm-wu',
    name: '配置自动更新',
    description: '指定计算机接收安全更新和其他重要更新的方式。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可选择: 2=下载前通知; 3=自动下载并通知安装; 4=自动下载并按计划安装; 5=允许本地管理员选择设置。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    registryValue: 'AUOptions (DWORD)',
    options: ['2 - 下载前通知', '3 - 自动下载并通知', '4 - 自动下载并按计划安装', '5 - 允许本地管理员选择'],
  },
  {
    id: 'pol-wu-003', categoryId: 'comp-adm-wu',
    name: '指定 Intranet Microsoft 更新服务位置',
    description: '指定承载来自 Microsoft Update 的更新的 Intranet 服务器。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '使用此策略指定企业内部的 WSUS 服务器地址。如果启用，客户端将从指定服务器获取更新而非微软服务器。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    registryValue: 'UseWUServer (DWORD)',
  },
  {
    id: 'pol-wu-004', categoryId: 'comp-adm-wu',
    name: '自动更新检测频率',
    description: '指定 Windows 检查可用更新的间隔时间(小时)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '默认值为 22 小时。有效范围: 1-22 小时。设置过短可能会增加网络和服务器负载。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    registryValue: 'DetectionFrequency (DWORD)',
    options: ['1 小时', '4 小时', '8 小时', '12 小时', '22 小时(默认)'],
  },
  {
    id: 'pol-wu-005', categoryId: 'comp-adm-wu',
    name: '延迟功能更新',
    description: '延迟接收 Windows 功能更新(大版本升级)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可选择延迟天数。功能更新包含新功能和重大变更，延迟可以降低兼容性风险。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate',
    registryValue: 'DeferFeatureUpdates (DWORD)',
    options: ['30 天', '60 天', '90 天', '180 天', '365 天'],
  },
  {
    id: 'pol-wu-006', categoryId: 'comp-adm-wu',
    name: '不允许通过自动更新安装驱动程序',
    description: '禁止 Windows Update 自动安装设备驱动程序更新。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 Windows Update 将不会自动安装驱动程序更新。建议在稳定环境中启用此策略，手动管理驱动程序更新。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate',
    registryValue: 'ExcludeWUDriversInQualityUpdate (DWORD)',
  },

  // ── Computer > Admin Templates > Windows Defender ──
  {
    id: 'pol-def-001', categoryId: 'comp-adm-defender',
    name: '关闭 Windows Defender 防病毒软件',
    description: '完全禁用 Windows Defender 防病毒保护。不建议在生产环境中关闭。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '如果启用此策略，Windows Defender 将停止所有实时保护。系统将暴露在未受保护状态。仅在安装了第三方防病毒软件时才建议启用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender',
    registryValue: 'DisableAntiSpyware (DWORD)',
  },
  {
    id: 'pol-def-002', categoryId: 'comp-adm-defender',
    name: '关闭实时保护',
    description: '禁用 Windows Defender 的实时监控功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 Defender 将不再实时扫描文件。注意: 关闭实时保护会使设备容易受到恶意软件攻击。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection',
    registryValue: 'DisableRealtimeMonitoring (DWORD)',
  },
  {
    id: 'pol-def-003', categoryId: 'comp-adm-defender',
    name: '配置自动样本提交',
    description: '控制是否自动向 Microsoft 发送可疑文件样本。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '选项: 0=始终提示; 1=自动发送安全样本; 2=从不发送; 3=自动发送所有样本。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet',
    registryValue: 'SpynetReporting (DWORD)',
    options: ['0 - 始终提示', '1 - 自动发送安全样本', '2 - 从不发送', '3 - 自动发送所有样本'],
  },
  {
    id: 'pol-def-004', categoryId: 'comp-adm-defender',
    name: '配置计划的系统扫描',
    description: '设置 Windows Defender 定期扫描的时间、频率和扫描类型。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '默认每天凌晨2点快速扫描。可配置扫描类型: 1=快速扫描; 2=完整扫描。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Scan',
    registryValue: 'ScheduleDay (DWORD)',
    options: ['每天', '每周', '每两周', '每月'],
  },
  {
    id: 'pol-def-005', categoryId: 'comp-adm-defender',
    name: '排除文件和文件夹',
    description: '指定 Windows Defender 扫描时跳过的文件路径。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '使用此策略可以排除特定文件夹，提高大型数据库或虚拟机目录的扫描性能。仅在没有安全风险的情况下使用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Exclusions',
    registryValue: 'Exclusions_Paths (REG_SZ)',
  },
  {
    id: 'pol-def-006', categoryId: 'comp-adm-defender',
    name: '启用云保护',
    description: '启用 Microsoft Defender 的云保护功能(BLOCK AT FIRST SIGHT)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '云保护利用 Microsoft 的云安全情报提供更快速的威胁检测和响应。需要互联网连接。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\MpEngine',
    registryValue: 'MpCloudBlockLevel (DWORD)',
  },

  // ── Computer > Admin Templates > File Explorer ──
  {
    id: 'pol-exp-001', categoryId: 'comp-adm-explorer',
    name: '删除"文件夹选项"菜单',
    description: '从资源管理器的"查看"菜单中删除"文件夹选项"项目。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法通过资源管理器访问文件夹选项对话框，这也会阻止用户修改文件夹选项设置。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoFolderOptions (DWORD)',
  },
  {
    id: 'pol-exp-002', categoryId: 'comp-adm-explorer',
    name: '关闭缩略图显示并仅显示图标',
    description: '禁止资源管理器显示文件缩略图，仅显示图标。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可以提升浏览包含大量图片和视频文件夹的性能。不影响文件图标本身的显示。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'DisableThumbnails (DWORD)',
  },
  {
    id: 'pol-exp-003', categoryId: 'comp-adm-explorer',
    name: '显示隐藏的文件和文件夹',
    description: '强制资源管理器显示隐藏文件和系统文件。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户将看到所有隐藏文件和受保护的操作系统文件。建议仅在需要排查问题或管理员需要访问所有文件时启用。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    registryValue: 'Hidden (DWORD)',
  },
  {
    id: 'pol-exp-004', categoryId: 'comp-adm-explorer',
    name: '关闭 Windows 错误报告',
    description: '禁用 Windows 错误报告功能，不再向 Microsoft 发送崩溃报告。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后将停止自动发送错误报告。但也不会收到针对特定崩溃的解决方案建议。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\Windows Error Reporting',
    registryValue: 'Disabled (DWORD)',
  },

  // ── Computer > Admin Templates > BitLocker ──
  {
    id: 'pol-bit-001', categoryId: 'comp-adm-bitlocker',
    name: '启动时需要附加身份验证',
    description: '配置 BitLocker 启动时需要 TPM + PIN 或 TPM + USB 密钥验证。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '加强安全性，防止未经授权的启动。选项包括: 仅TPM; TPM+PIN; TPM+密钥; TPM+PIN+密钥。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE',
    registryValue: 'UseAdvancedStartup (DWORD)',
  },
  {
    id: 'pol-bit-002', categoryId: 'comp-adm-bitlocker',
    name: '选择驱动器加密方法和密码强度',
    description: '指定 BitLocker 使用的加密算法和密钥强度。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可选: AES 128位、AES 256位。默认使用 XTS-AES 128位。对于需要更高安全性的场景，建议使用 XTS-AES 256位。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE',
    registryValue: 'EncryptionMethod (DWORD)',
    options: ['AES 128位', 'AES 256位', 'XTS-AES 128位', 'XTS-AES 256位'],
  },
  {
    id: 'pol-bit-003', categoryId: 'comp-adm-bitlocker',
    name: '配置恢复密钥存储',
    description: '指定 BitLocker 恢复密钥的存储位置和方式。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '恢复密钥可保存在 Active Directory 或 Azure AD 中。建议始终备份恢复密钥以防无法访问驱动器。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\FVE',
    registryValue: 'OSRecovery (DWORD)',
  },

  // ── Computer > Admin Templates > Remote Desktop ──
  {
    id: 'pol-rdp-001', categoryId: 'comp-adm-rdp',
    name: '允许用户通过远程桌面服务远程连接',
    description: '启用或禁用远程桌面连接。',
    supportedOn: 'Windows 11, Windows 10, Windows Server 2022',
    state: 'not_configured',
    helpText: '启用后允许远程连接到此计算机。建议同时启用网络级别身份验证(NLA)以提高安全性。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services',
    registryValue: 'fDenyTSConnections (DWORD)',
  },
  {
    id: 'pol-rdp-002', categoryId: 'comp-adm-rdp',
    name: '使用网络级别身份验证(NLA)',
    description: '要求用户在建立远程桌面连接前进行身份验证。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '强烈建议启用。NLA 在建立完整会话前验证用户身份，减少拒绝服务攻击的风险和资源消耗。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services',
    registryValue: 'UserAuthentication (DWORD)',
  },
  {
    id: 'pol-rdp-003', categoryId: 'comp-adm-rdp',
    name: '设置远程桌面会话超时',
    description: '配置空闲和已断开连接的远程桌面会话的超时限制。',
    supportedOn: 'Windows 11, Windows 10, Windows Server 2022',
    state: 'not_configured',
    helpText: '可配置活动超时、空闲超时和已断开连接的超时。建议设置合理的超时以保护资源。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services',
    registryValue: 'MaxIdleTime (DWORD)',
  },

  // ── Computer > Admin Templates > System ──
  {
    id: 'pol-sys-001', categoryId: 'comp-adm-system',
    name: '关闭自动播放',
    description: '禁用所有驱动器的自动播放功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'enabled',
    helpText: '自动播放允许插入设备时自动运行程序，存在安全风险。启用此策略可关闭所有驱动器的自动播放。建议在所有企业环境中启用此策略。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoDriveTypeAutoRun (DWORD)',
    options: ['所有驱动器', 'CD-ROM 和可移动媒体驱动器'],
  },
  {
    id: 'pol-sys-002', categoryId: 'comp-adm-system',
    name: '限制可执行文件从指定位置运行',
    description: '只允许从特定目录运行可执行文件，阻止其他位置的程序启动。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可以限制程序运行位置，提高安全性。注意: 不当配置可能导致系统功能异常。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'EnforceShellExtensionSecurity (DWORD)',
  },
  {
    id: 'pol-sys-003', categoryId: 'comp-adm-system',
    name: '关闭数据执行保护(DEP)',
    description: '控制硬件DEP(数据执行保护)是否启用。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'disabled',
    helpText: 'DEP 是重要的安全机制。禁用会降低系统安全性，仅在做兼容性测试时临时禁用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer',
    registryValue: 'NoDataExecutionPrevention (DWORD)',
  },
  {
    id: 'pol-sys-004', categoryId: 'comp-adm-system',
    name: '限制对注册表编辑工具的访问',
    description: '禁止用户访问注册表编辑器(regedit.exe)和其他注册表编辑工具。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法运行 regedit.exe 或导入 .reg 文件。注意: 管理员仍可通过组策略编辑器修改此限制。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'DisableRegistryTools (DWORD)',
  },
  {
    id: 'pol-sys-005', categoryId: 'comp-adm-system',
    name: '显示关闭事件跟踪程序',
    description: '在关闭或重启系统时要求用户提供原因。',
    supportedOn: 'Windows 11, Windows 10, Windows Server 2022',
    state: 'not_configured',
    helpText: '启用后关机对话框将包含下拉菜单要求选择关机原因。适用于需要审核系统重启原因的企业环境。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Reliability',
    registryValue: 'ShutdownReasonUI (DWORD)',
  },
  {
    id: 'pol-sys-006', categoryId: 'comp-adm-system',
    name: '配置 Windows 登录安全选项',
    description: '配置 Ctrl+Alt+Del 安全登录、最后登录用户显示等选项。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '安全登录(Ctrl+Alt+Del)可以防止登录欺骗攻击。不显示最后登录用户名可保护用户隐私。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'DisableCAD (DWORD)',
  },
  {
    id: 'pol-sys-007', categoryId: 'comp-adm-system',
    name: '关闭 Windows 功能',
    description: '指定用户可以打开或关闭的 Windows 功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可以使用此策略阻止用户操作特定的 Windows 功能，如 Windows Subsystem for Linux、Hyper-V 等。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Programs',
    registryValue: 'NoProgramsAndFeatures (DWORD)',
  },
  {
    id: 'pol-sys-008', categoryId: 'comp-adm-system',
    name: '禁用命令提示符',
    description: '阻止用户运行命令提示符(cmd.exe)和批处理文件。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可阻止脚本执行和命令提示符访问。可选择是否同时禁用批处理文件(.bat, .cmd)。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\System',
    registryValue: 'DisableCMD (DWORD)',
  },
  {
    id: 'pol-sys-009', categoryId: 'comp-adm-system',
    name: '配置用户账户控制(UAC)行为',
    description: '控制用户账户控制的提示行为和提权方式。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: 'UAC 级别: 0=从不通知; 1=不调暗桌面; 2=调暗桌面(默认); 3=始终通知。不建议设为0。',
    registryKey: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'ConsentPromptBehaviorAdmin (DWORD)',
    options: ['从不通知', '不调暗桌面时通知', '调暗桌面时通知(默认)', '始终通知'],
  },

  // ── Computer > Admin Templates > Network ──
  {
    id: 'pol-net-001', categoryId: 'comp-adm-network',
    name: '禁止使用 DNS over HTTPS',
    description: '禁用 DNS over HTTPS (DoH) 功能，强制使用传统 DNS。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用可阻止用户或应用使用加密DNS。在某些企业环境中，可能需要禁用DoH以确保DNS流量可被监控。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient',
    registryValue: 'EnableAutoDoH (DWORD)',
  },
  {
    id: 'pol-net-002', categoryId: 'comp-adm-network',
    name: '限制可使用的网络连接',
    description: '指定允许或阻止的网络连接接口。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可用于阻止 Wi-Fi 连接，仅允许有线网络。适用于需要严格网络隔离的安全环境。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WcmSvc',
    registryValue: 'BlockWiFi (DWORD)',
  },
  {
    id: 'pol-net-003', categoryId: 'comp-adm-network',
    name: '关闭 Windows 防火墙',
    description: '关闭所有网络配置文件的 Windows Defender 防火墙。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'disabled',
    helpText: '强烈建议不要关闭防火墙。仅在测试或使用第三方防火墙时可以临时关闭，且关闭后应尽快重新启用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\WindowsFirewall\\DomainProfile',
    registryValue: 'EnableFirewall (DWORD)',
  },
  {
    id: 'pol-net-004', categoryId: 'comp-adm-network',
    name: '配置 SMB 客户端签名',
    description: '要求 SMB 客户端在所有连接上启用数据包签名。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用 SMB 签名可以防止中间人攻击和会话劫持。但会增加约10-15%的 SMB 传输开销。',
    registryKey: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters',
    registryValue: 'RequireSecuritySignature (DWORD)',
  },

  // ── Computer > Admin Templates > Start Menu ──
  {
    id: 'pol-sm-001', categoryId: 'comp-adm-startmenu',
    name: '删除"运行"菜单',
    description: '从开始菜单中删除"运行"命令。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法通过运行菜单执行命令。注意: 用户仍可通过 Win+R 或任务管理器打开运行对话框。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoRun (DWORD)',
  },
  {
    id: 'pol-sm-002', categoryId: 'comp-adm-startmenu',
    name: '删除并阻止访问"关机"命令',
    description: '从开始菜单中删除关机、重启、睡眠和休眠命令。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法通过开始菜单关闭或重启计算机。适用于需要保持持续运行的关键服务器。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoClose (DWORD)',
  },
  {
    id: 'pol-sm-003', categoryId: 'comp-adm-startmenu',
    name: '强制经典开始菜单',
    description: '使用经典的 Windows 开始菜单样式。',
    supportedOn: 'Windows 10 (早期版本)',
    state: 'not_configured',
    helpText: '注意: 此策略仅适用于 Windows 10 早期版本。Windows 11 不再支持经典开始菜单。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoSimpleStartMenu (DWORD)',
  },
  {
    id: 'pol-sm-004', categoryId: 'comp-adm-startmenu',
    name: '将最近打开的文档添加到快速访问',
    description: '控制是否在文件资源管理器的快速访问中显示最近文件。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后方便快速访问最近文件，但可能泄露用户工作习惯和隐私信息。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    registryValue: 'ShowRecent (DWORD)',
  },

  // ── Computer > Admin Templates > Desktop ──
  {
    id: 'pol-desk-001', categoryId: 'comp-adm-desktop',
    name: '隐藏桌面上的所有图标',
    description: '从桌面上删除所有图标和快捷方式。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后桌面将完全空白。用户仍可通过开始菜单、任务栏或文件资源管理器访问所有程序和文件。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoDesktop (DWORD)',
  },
  {
    id: 'pol-desk-002', categoryId: 'comp-adm-desktop',
    name: '禁用活动桌面',
    description: '关闭活动桌面功能以及所有 Web 桌面内容。',
    supportedOn: 'Windows 10',
    state: 'not_configured',
    helpText: '活动桌面允许在桌面上显示 HTML 内容。禁用可减少资源使用并消除相关的安全隐患。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoActiveDesktop (DWORD)',
  },
  {
    id: 'pol-desk-003', categoryId: 'comp-adm-desktop',
    name: '阻止更改桌面背景',
    description: '防止用户更改当前的桌面背景图片。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后个性化设置中的背景选项会被锁定。适用于需要统一桌面环境的企业场所。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\ActiveDesktop',
    registryValue: 'NoChangingWallPaper (DWORD)',
  },

  // ── Computer > Admin Templates > Control Panel ──
  {
    id: 'pol-cp-001', categoryId: 'comp-adm-controlpanel',
    name: '禁止访问控制面板',
    description: '阻止用户启动控制面板(category view)和设置应用。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用此策略将禁止用户通过任何方式访问控制面板和大多数设置页面，包括开始菜单、运行对话框和命令行。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoControlPanel (DWORD)',
  },
  {
    id: 'pol-cp-002', categoryId: 'comp-adm-controlpanel',
    name: '隐藏控制面板中的指定项目',
    description: '从控制面板视图中隐藏特定的设置项目。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可指定 .cpl 文件名来隐藏特定项目。如 main.cpl 对应鼠标设置, desk.cpl 对应显示设置。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'DisallowCpl (DWORD)',
  },
  {
    id: 'pol-cp-003', categoryId: 'comp-adm-controlpanel',
    name: '禁止添加打印机',
    description: '阻止用户通过控制面板添加新的打印机。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后添加打印机向导和大多数添加打印机的入口会被禁用。管理员仍可通过其他方式添加打印机。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoAddPrinter (DWORD)',
  },
  {
    id: 'pol-cp-004', categoryId: 'comp-adm-controlpanel',
    name: '禁止删除打印机',
    description: '防止用户删除已安装的打印机。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法删除现有打印机。适用于共享工作区环境,防止误删除重要打印机。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoDeletePrinter (DWORD)',
  },

  // ── Computer > Admin Templates > PowerShell ──
  {
    id: 'pol-ps-001', categoryId: 'comp-adm-ps',
    name: '启用脚本执行',
    description: '设置 PowerShell 脚本执行策略。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可选: Restricted=禁止所有脚本; AllSigned=仅允许签名脚本; RemoteSigned=远程脚本需签名; Unrestricted=允许所有脚本。推荐 RemoteSigned。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell',
    registryValue: 'ExecutionPolicy (REG_SZ)',
    options: ['Restricted (禁止所有)', 'AllSigned (仅签名)', 'RemoteSigned (远程需签名)', 'Unrestricted (无限制)'],
  },
  {
    id: 'pol-ps-002', categoryId: 'comp-adm-ps',
    name: '启用 PowerShell 日志记录',
    description: '启用 PowerShell 脚本块日志记录和模块日志记录。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可记录所有PowerShell活动,有助于安全审计和威胁检测。日志存储在事件查看器的 Windows PowerShell 日志中。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging',
    registryValue: 'EnableScriptBlockLogging (DWORD)',
  },

  // ── Computer > Admin Templates > Windows Search ──
  {
    id: 'pol-srch-001', categoryId: 'comp-adm-search',
    name: '禁用 Windows Search 索引',
    description: '关闭 Windows 搜索索引服务。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '禁用后文件搜索将变慢，但可减少磁盘活动和资源使用。适用于磁盘空间或性能有限的系统。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search',
    registryValue: 'DisableIndexer (DWORD)',
  },
  {
    id: 'pol-srch-002', categoryId: 'comp-adm-search',
    name: '配置搜索索引位置',
    description: '指定 Windows Search 索引数据库的存储位置。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可将索引数据库移动到性能更好的驱动器上以提高搜索效率并减少系统盘空间占用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search',
    registryValue: 'DataDirectory (REG_SZ)',
  },

  // ── Computer > Admin Templates > Microsoft Edge ──
  {
    id: 'pol-edge-001', categoryId: 'comp-adm-edge',
    name: '配置 Edge 更新策略',
    description: '控制 Microsoft Edge 浏览器的自动更新行为。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '选项: 始终允许更新; 仅手动更新; 禁止更新。企业管理中通常需要控制更新节奏。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\EdgeUpdate',
    registryValue: 'Update{56EB18F8-B008-4CBD-B6D2-8C97FE7E9062} (DWORD)',
    options: ['允许自动更新', '仅手动更新', '禁止更新'],
  },
  {
    id: 'pol-edge-002', categoryId: 'comp-adm-edge',
    name: '禁止在 Edge 中保存密码',
    description: '阻止用户使用 Edge 浏览器的密码保存功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可以降低密码泄露风险，但也会降低用户便利性。建议与第三方密码管理器配合使用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registryValue: 'PasswordManagerEnabled (DWORD)',
  },

  // ── Computer > Admin Templates > Internet Explorer ──
  {
    id: 'pol-ie-001', categoryId: 'comp-adm-ie',
    name: '禁用 Internet Explorer',
    description: '关闭 Internet Explorer 功能，阻止用户启动 IE。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: 'Microsoft 已停止对 IE 的支持。建议启用此策略禁用 IE，引导用户使用 Microsoft Edge 或其他现代浏览器。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Internet Explorer\\Main',
    registryValue: 'NotifyDisableIEOptions (DWORD)',
  },
  {
    id: 'pol-ie-002', categoryId: 'comp-adm-ie',
    name: '配置 IE 模式站点列表',
    description: '指定在 Edge IE 模式下加载的网站列表。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '输入企业站点列表的 XML 文件路径或 URL。Edge 会在此模式下加载列表中的网站以保持兼容性。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registryValue: 'InternetExplorerIntegrationSiteList (REG_SZ)',
  },

  // ── Computer > Admin Templates > Task Scheduler ──
  {
    id: 'pol-ts-001', categoryId: 'comp-adm-tasksched',
    name: '禁止创建新任务',
    description: '阻止用户创建新的计划任务。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法通过任务计划程序创建新任务，但现有任务仍会按计划运行。适用于防止持久化机制。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Task Scheduler5.0',
    registryValue: 'Task Creation (DWORD)',
  },
  {
    id: 'pol-ts-002', categoryId: 'comp-adm-tasksched',
    name: '禁止任务手动运行',
    description: '阻止用户手动启动计划任务。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后任务仅能按计划自动触发，用户无法通过界面或命令行手动运行。任务计划程序中的"运行"按钮会被禁用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Task Scheduler5.0',
    registryValue: 'Task Run (DWORD)',
  },

  // ── Computer > Admin Templates > AppX Deployment ──
  {
    id: 'pol-appx-001', categoryId: 'comp-adm-appx',
    name: '禁用 Microsoft Store 应用',
    description: '阻止用户访问和使用 Microsoft Store。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 Microsoft Store 应用将无法启动。注意: 这不会阻止已安装的商店应用运行。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\WindowsStore',
    registryValue: 'RemoveWindowsStore (DWORD)',
  },
  {
    id: 'pol-appx-002', categoryId: 'comp-adm-appx',
    name: '禁用自动下载应用更新',
    description: '阻止 Microsoft Store 自动下载和安装应用更新。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户需要手动检查并安装应用更新。在带宽受限或需要控制更新时间的环境中很有用。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\WindowsStore',
    registryValue: 'AutoDownload (DWORD)',
  },

  // ── Computer > Admin Templates > SmartScreen ──
  {
    id: 'pol-ss-001', categoryId: 'comp-adm-smartscreen',
    name: '配置 Windows SmartScreen',
    description: '控制 SmartScreen 筛选器的行为级别。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可选: 关闭; 运行前警告; 运行前警告并阻止。SmartScreen 可阻止未知来源的应用和文件，有效防御恶意软件。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System',
    registryValue: 'EnableSmartScreen (DWORD)',
    options: ['关闭 SmartScreen', '运行前警告', '运行前警告并阻止'],
  },
  {
    id: 'pol-ss-002', categoryId: 'comp-adm-smartscreen',
    name: '防止绕过 SmartScreen 警告',
    description: '阻止用户忽略 SmartScreen 发出的安全警告。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法点击"仍要运行"来忽略 SmartScreen 对可疑文件的警告。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System',
    registryValue: 'ShellSmartScreenLevel (REG_SZ)',
  },

  // ── Computer > Admin Templates > OneDrive ──
  {
    id: 'pol-od-001', categoryId: 'comp-adm-onedrive',
    name: '禁止使用 OneDrive',
    description: '阻止用户使用 OneDrive 进行文件存储和同步。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 OneDrive 将无法启动和同步。适用于因合规或安全原因不能使用云存储的企业环境。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\OneDrive',
    registryValue: 'DisableFileSyncNGSC (DWORD)',
  },
  {
    id: 'pol-od-002', categoryId: 'comp-adm-onedrive',
    name: '配置 OneDrive 文件按需同步',
    description: '控制 OneDrive 是否使用按需文件(Files On-Demand)功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用按需同步后，文件仅在需要时下载，不占用本地磁盘空间。有利于节省存储空间。',
    registryKey: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\OneDrive',
    registryValue: 'FilesOnDemandEnabled (DWORD)',
  },

  // ═══════════════════════════════════════════════════
  // USER CONFIGURATION POLICIES
  // ═══════════════════════════════════════════════════

  // ── User > Admin Templates > Start Menu ──
  {
    id: 'pol-usr-sm-001', categoryId: 'user-adm-startmenu',
    name: '从开始菜单中删除"控制面板"',
    description: '在用户开始菜单和搜索结果中隐藏控制面板条目。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法从开始菜单找到控制面板，但熟练用户仍可通过运行对话框访问。建议同时使用其他策略完全锁定。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoStartMenuMorePrograms (DWORD)',
  },
  {
    id: 'pol-usr-sm-002', categoryId: 'user-adm-startmenu',
    name: '不显示最近打开的文档',
    description: '不在开始菜单或任务栏中保存或显示最近打开的文件记录。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用可保护用户隐私，建议在共享计算机或多用户环境中启用。不影响应用程序内部的历史记录。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoRecentDocsHistory (DWORD)',
  },
  {
    id: 'pol-usr-sm-003', categoryId: 'user-adm-startmenu',
    name: '锁定任务栏',
    description: '防止用户调整任务栏位置和大小。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后任务栏将被锁定。适用于需要统一桌面环境的 kiosk 或公共终端。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'LockTaskbar (DWORD)',
  },
  {
    id: 'pol-usr-sm-004', categoryId: 'user-adm-startmenu',
    name: '从开始菜单中删除"运行"菜单',
    description: '在用户配置级别删除开始菜单中的运行命令。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '与计算机配置中的类似策略协同使用效果更好。单独启用时仅影响当前用户。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoRun (DWORD)',
  },
  {
    id: 'pol-usr-sm-005', categoryId: 'user-adm-startmenu',
    name: '隐藏通知区域',
    description: '隐藏任务栏通知区域(系统托盘)中的所有图标。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后时钟、音量、网络和所有通知图标将被隐藏。适用于全屏kiosk或信息亭应用。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoTrayItemsDisplay (DWORD)',
  },

  // ── User > Admin Templates > Windows Components > File Explorer ──
  {
    id: 'pol-usr-exp-001', categoryId: 'user-adm-explorer',
    name: '隐藏快速访问中的最近文件',
    description: '不在文件资源管理器的快速访问中显示最近使用的文件列表。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用此设置可以保护用户隐私，防止其他用户在文件资源管理器中看到你最近打开的文件。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    registryValue: 'ShowRecent (DWORD)',
  },
  {
    id: 'pol-usr-exp-002', categoryId: 'user-adm-explorer',
    name: '隐藏快速访问中的常用文件夹',
    description: '不在文件资源管理器的快速访问中显示常用文件夹列表。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后快速访问将仅显示手动固定的文件夹，提供更干净的文件浏览器界面。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    registryValue: 'ShowFrequent (DWORD)',
  },
  {
    id: 'pol-usr-exp-003', categoryId: 'user-adm-explorer',
    name: '在标题栏显示完整路径',
    description: '在文件资源管理器标题栏中显示完整的文件夹路径。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可在标题栏看到完整路径，便于导航和识别当前位置。特别适合需要频繁切换文件夹的管理员。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\CabinetState',
    registryValue: 'FullPath (DWORD)',
  },

  // ── User > Admin Templates > Desktop ──
  {
    id: 'pol-usr-desk-001', categoryId: 'user-adm-desktop',
    name: '禁用桌面清理向导',
    description: '关闭定期运行的桌面清理向导。',
    supportedOn: 'Windows 10',
    state: 'not_configured',
    helpText: '桌面清理向导会在每60天提醒用户清理未使用的桌面快捷方式。禁用后不会再看到此提示。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoDesktopCleanupWizard (DWORD)',
  },
  {
    id: 'pol-usr-desk-002', categoryId: 'user-adm-desktop',
    name: '不允许更改屏幕保护程序',
    description: '阻止用户更改屏幕保护程序设置。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后屏幕保护程序选项卡将从显示设置中消失。适用于需要使用统一或特定屏保的企业环境。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop',
    registryValue: 'ScreenSaveActive (REG_SZ)',
  },
  {
    id: 'pol-usr-desk-003', categoryId: 'user-adm-desktop',
    name: '启用屏幕保护程序超时',
    description: '设置系统在空闲多久后自动启动屏幕保护程序。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '建议设置15分钟以下。屏幕保护程序可以保护屏幕并配合密码保护增强安全性。建议同时启用"在恢复时显示登录屏幕"。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop',
    registryValue: 'ScreenSaveTimeOut (REG_SZ)',
  },

  // ── User > Admin Templates > Control Panel ──
  {
    id: 'pol-usr-cp-001', categoryId: 'user-adm-controlpanel',
    name: '禁止更改主题',
    description: '阻止用户更改 Windows 桌面主题、颜色和声音方案。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后个性化设置中的主题、颜色和声音选项将被锁定。适用于需要统一桌面体验的环境。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoThemesTab (DWORD)',
  },
  {
    id: 'pol-usr-cp-002', categoryId: 'user-adm-controlpanel',
    name: '禁用"程序和功能"页面',
    description: '阻止用户通过控制面板卸载或更改程序。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后程序和功能页面将不可用。适用于需要管理员审批程序安装/卸载的企业环境。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Programs',
    registryValue: 'NoProgramsAndFeatures (DWORD)',
  },
  {
    id: 'pol-usr-cp-003', categoryId: 'user-adm-controlpanel',
    name: '阻止更改语言设置',
    description: '防止用户修改键盘布局、输入法和显示语言。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后语言首选项中的选项将被锁定。适用于需要保持统一语言设置的多语言企业环境。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Control Panel\\International',
    registryValue: 'HideAdminOptions (DWORD)',
  },

  // ── User > Admin Templates > System ──
  {
    id: 'pol-usr-sys-001', categoryId: 'user-adm-system',
    name: '禁止访问注册表编辑工具',
    description: '在用户级别禁止使用 regedit 等注册表编辑工具。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用此策略可以提高系统安全性，防止用户意外或恶意修改注册表。但管理员仍可通过组策略修改此设置。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'DisableRegistryTools (DWORD)',
  },
  {
    id: 'pol-usr-sys-002', categoryId: 'user-adm-system',
    name: '禁止使用任务管理器',
    description: '阻止用户打开任务管理器(Task Manager)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 Ctrl+Shift+Esc 和 Ctrl+Alt+Del 菜单中的任务管理器入口将被禁用。适用于 kiosk 或限制用户环境。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'DisableTaskMgr (DWORD)',
  },
  {
    id: 'pol-usr-sys-003', categoryId: 'user-adm-system',
    name: '禁用锁定计算机',
    description: '阻止用户锁定计算机(Win+L)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后 Win+L 快捷键以及开始菜单中的锁定选项将被禁用。在安全监控环境中可能有用。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registryValue: 'DisableLockWorkstation (DWORD)',
  },
  {
    id: 'pol-usr-sys-004', categoryId: 'user-adm-system',
    name: '在登录时不显示欢迎屏幕',
    description: '跳过 Windows 登录后的欢迎动画和提示。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后可加快登录过程。适用于性能敏感的环境或用户已经熟悉系统功能的情况。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registryValue: 'NoWelcomeScreen (DWORD)',
  },
  {
    id: 'pol-usr-sys-005', categoryId: 'user-adm-system',
    name: '关闭 Windows 热点提示和推荐',
    description: '禁用 Windows 的功能提示、建议和技巧弹出窗口。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后将不再显示 Windows 的使用建议和新功能介绍。适用于不希望受到这些干扰的用户。',
    registryKey: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\UserProfileEngagement',
    registryValue: 'ScoobeSystemSettingEnabled (DWORD)',
  },

  // ── User > Admin Templates > Network ──
  {
    id: 'pol-usr-net-001', categoryId: 'user-adm-network',
    name: '禁止更改网络位置',
    description: '阻止用户修改网络配置文件(专用/公用/域)。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '网络位置影响防火墙规则和共享设置。锁定此设置可确保网络始终在正确的安全配置下运行。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Network Connections',
    registryValue: 'NC_AllowAdvancedTCPIPConfig (DWORD)',
  },
  {
    id: 'pol-usr-net-002', categoryId: 'user-adm-network',
    name: '禁止更改代理设置',
    description: '阻止用户修改 Internet 选项中的代理服务器设置。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '在企业环境中启用可确保网络流量始终通过企业代理，有助于安全监控和内容过滤。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Internet Explorer\\Control Panel',
    registryValue: 'Proxy (DWORD)',
  },

  // ── User > Admin Templates > Windows Search ──
  {
    id: 'pol-usr-srch-001', categoryId: 'user-adm-search',
    name: '允许在搜索中使用云搜索',
    description: '允许 Windows 搜索在必应中搜索并返回网页结果。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后搜索框会同时显示本地结果和网页建议。禁用仅显示本地文件和设置结果。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer',
    registryValue: 'AllowSearchToUseLocation (DWORD)',
  },
  {
    id: 'pol-usr-srch-002', categoryId: 'user-adm-search',
    name: '不搜索网络路径',
    description: '阻止 Windows 搜索在映射的网络驱动器和 UNC 路径中搜索。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用可减少网络流量并加快搜索速度。对于依赖网络共享的用户，可能会遗漏重要结果。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search',
    registryValue: 'PreventIndexingUncachedNetworkPaths (DWORD)',
  },

  // ── User > Admin Templates > Microsoft Edge ──
  {
    id: 'pol-usr-edge-001', categoryId: 'user-adm-edge',
    name: '防止绕过 Edge 安全警告',
    description: '阻止用户忽略 Microsoft Edge 对恶意网站的安全警告。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后用户无法跳过 SmartScreen 对已知恶意网站或下载内容的警告页面。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registryValue: 'PreventSmartScreenPromptOverride (DWORD)',
  },
  {
    id: 'pol-usr-edge-002', categoryId: 'user-adm-edge',
    name: '配置主页',
    description: '设置 Microsoft Edge 的默认主页 URL。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '可以设置为企业内部网站或指定的起始页面。启用后用户无法更改Edge的主页设置。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registryValue: 'HomepageLocation (REG_SZ)',
  },

  // ── User > Admin Templates > Internet Explorer ──
  {
    id: 'pol-usr-ie-001', categoryId: 'user-adm-ie',
    name: '禁用表单自动完成',
    description: '阻止 Internet Explorer 自动完成表单字段和保存输入历史。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用可防止敏感表单数据(如账号、密码)被浏览器缓存，提高隐私安全性。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Internet Explorer\\Control Panel',
    registryValue: 'FormSuggest (DWORD)',
  },

  // ── User > Admin Templates > Remote Desktop ──
  {
    id: 'pol-usr-rdp-001', categoryId: 'user-adm-rdp',
    name: '限制远程桌面会话中的剪贴板重定向',
    description: '禁止在远程桌面会话中使用剪贴板共享功能。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后无法在本地和远程会话之间复制粘贴内容。可防止通过远程桌面泄露数据。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services',
    registryValue: 'fDisableClip (DWORD)',
  },
  {
    id: 'pol-usr-rdp-002', categoryId: 'user-adm-rdp',
    name: '限制远程桌面中的驱动器重定向',
    description: '禁止在远程桌面会话中映射本地驱动器。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '启用后远程计算机无法访问本地驱动器。用于防止通过远程桌面传输文件和潜在的数据泄露。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services',
    registryValue: 'fDisableCdm (DWORD)',
  },

  // ── User > Admin Templates > OneDrive ──
  {
    id: 'pol-usr-od-001', categoryId: 'user-adm-onedrive',
    name: '阻止用户将个人 OneDrive 帐户同步',
    description: '仅允许使用组织帐户同步 OneDrive，阻止个人 Microsoft 帐户。',
    supportedOn: 'Windows 11, Windows 10',
    state: 'not_configured',
    helpText: '适用于企业环境，确保公司数据仅存储在受管理的 OneDrive for Business 帐户中。',
    registryKey: 'HKCU\\SOFTWARE\\Policies\\Microsoft\\OneDrive',
    registryValue: 'DisablePersonalSync (DWORD)',
  },
];

export class PolicyManager {
  getCategories(): PolicyCategory[] {
    return CATEGORIES;
  }

  getPoliciesByCategory(categoryId: string): PolicyEntry[] {
    // Collect all descendant category IDs recursively
    const descendantIds = new Set<string>();
    const collectDescendants = (parentId: string) => {
      for (const cat of CATEGORIES) {
        if (cat.parentId === parentId) {
          descendantIds.add(cat.id);
          collectDescendants(cat.id);
        }
      }
    };
    descendantIds.add(categoryId);
    collectDescendants(categoryId);

    return POLICIES.filter((p) => descendantIds.has(p.categoryId));
  }

  searchPolicies(query: string): PolicyEntry[] {
    const q = query.toLowerCase();
    return POLICIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.helpText.toLowerCase().includes(q) ||
        p.registryKey.toLowerCase().includes(q)
    );
  }

  getPolicyById(id: string): PolicyEntry | null {
    return POLICIES.find((p) => p.id === id) ?? null;
  }
}
