import type { DetectedIssue } from '../engine';

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function detectSoftwareIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;

  const frequentCrashes = rng() < 0.12;
  const fileAssocBroken = rng() < 0.15;
  const installerError = rng() < 0.08;
  const sfcCorruption = rng() < 0.18;

  if (frequentCrashes) {
    issues.push({
      id: 'app-frequent-crashes',
      category: 'software',
      severity: 'warning',
      title: '应用程序频繁崩溃',
      description: '检测到应用程序在过去1小时内崩溃超过5次',
      details: '频繁的应用崩溃可能由系统文件损坏、.NET Framework问题或Visual C++运行库缺失引起。',
      evidence: [
        '崩溃应用: chrome.exe (3次), explorer.exe (2次)',
        '故障模块: ntdll.dll (0xc0000005)',
        '时间范围: 最近1小时',
        '事件日志: Event ID 1000 (Application Error)',
      ],
      canAutoFix: true,
      autoFixDescription: '运行SFC系统文件检查，重新注册应用包',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'fix-app-crashes',
      rollbackPlan: 'SFC扫描仅修复系统文件，不会影响用户数据',
    });
  }

  if (fileAssocBroken) {
    issues.push({
      id: 'file-association-broken',
      category: 'software',
      severity: 'warning',
      title: '文件关联可能损坏',
      description: '检测到部分常见文件扩展名没有关联默认程序',
      details: '文件关联损坏会导致双击文件时弹出"选择打开方式"对话框或使用错误的程序打开。',
      evidence: [
        '受影响扩展名: .txt, .jpg, .html',
        '.txt 当前关联: 无',
        '.jpg 当前关联: 未知应用',
        '可能原因: 程序卸载时未清理注册表',
      ],
      canAutoFix: true,
      autoFixDescription: '修复常见文件扩展名关联（.txt→记事本, .jpg→照片, .html→Edge）',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'fix-file-associations',
      rollbackPlan: '可在"设置→应用→默认应用"中手动修改',
    });
  }

  if (installerError) {
    issues.push({
      id: 'windows-installer-error',
      category: 'software',
      severity: 'warning',
      title: 'Windows Installer服务异常',
      description: 'Windows Installer (msiexec) 服务未正常响应，可能导致无法安装或卸载程序',
      details: 'Windows Installer服务异常会阻止.msi安装包的安装和卸载操作。',
      evidence: [
        '服务名称: msiserver',
        '状态: 已停止 (触发启动失败)',
        '事件日志: Event ID 11708 (MsiInstaller)',
        '最近安装失败: 2025-04-28 Visual C++ Redist',
      ],
      canAutoFix: true,
      autoFixDescription: '重新注册Windows Installer服务',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'fix-msi-installer',
      rollbackPlan: '重注册操作可逆，如需要可恢复原配置',
    });
  }

  if (sfcCorruption) {
    issues.push({
      id: 'system-file-corruption',
      category: 'software',
      severity: 'critical',
      title: '系统文件可能已损坏',
      description: 'SFC扫描发现系统文件完整性异常，可能导致应用崩溃或系统不稳定',
      details: '系统文件损坏通常由意外关机、磁盘错误或恶意软件引起。需要通过SFC和DISM修复。',
      evidence: [
        'SFC /scannow: 发现损坏文件',
        'CBS.log: 多个文件哈希不匹配',
        '受影响组件: Microsoft-Windows-Foundation',
        '最近更新: KB5031354 (2024-10-08)',
      ],
      canAutoFix: true,
      autoFixDescription: '运行 SFC /scannow 扫描并修复系统文件，如失败则运行DISM恢复',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'run-sfc-dism',
      rollbackPlan: 'SFC/DISM修复系统文件不会影响用户数据',
    });
  }

  return issues;
}
