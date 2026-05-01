import type { DetectedIssue } from '../engine';
import { createRng } from '../utils';

export function detectSystemIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = createRng(seed);

  const updateFailed = rng() < 0.15;
  const diskError = rng() < 0.1;
  const clockDrift = rng() < 0.05;
  const restoreDisabled = rng() < 0.25;
  const activationIssue = rng() < 0.03;
  if (updateFailed) {
    issues.push({
      id: 'windows-update-failed',
      category: 'system',
      severity: 'warning',
      title: 'Windows更新失败',
      description: '检测到Windows更新历史中有安装失败的记录',
      details: 'Windows更新失败可能导致安全漏洞未修复或系统功能异常。常见原因包括更新组件损坏、磁盘空间不足。',
      evidence: [
        '失败更新: KB5034123 (2025-01安全更新)',
        '错误代码: 0x800f0922',
        '失败次数: 3次',
        'CBS.log: 组件存储损坏',
        '可用磁盘空间: 32 GB',
      ],
      canAutoFix: true,
      autoFixDescription: '重置Windows Update组件（停止服务→清理SoftwareDistribution→重启服务）',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'reset-windows-update',
      rollbackPlan: '清理SoftwareDistribution会清除更新历史，不会影响已安装的更新',
    });
  }

  if (diskError) {
    issues.push({
      id: 'disk-errors-detected',
      category: 'system',
      severity: 'critical',
      title: '磁盘错误',
      description: '系统事件日志中检测到磁盘错误，可能存在文件系统损坏或坏扇区',
      details: '磁盘错误如果不及时修复可能导致数据丢失。建议尽快运行CHKDSK检查。',
      evidence: [
        '事件日志: Event ID 7 (磁盘坏块)',
        '受影响磁盘: C: (ST1000DM010-2EP102)',
        'NTFS错误: 文件系统结构损坏',
        '建议: 运行 chkdsk /f C:',
      ],
      canAutoFix: true,
      autoFixDescription: '计划运行 CHKDSK /f C: 扫描并修复文件系统错误',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'run-chkdsk',
      rollbackPlan: 'CHKDSK修复不可回滚，但仅修复文件系统结构',
    });
  }

  if (clockDrift) {
    issues.push({
      id: 'system-clock-drift',
      category: 'system',
      severity: 'info',
      title: '系统时间异常',
      description: '系统时钟与NTP服务器时间偏差超过5分钟，可能导致SSL证书验证失败',
      details: '系统时间不准确会影响HTTPS连接、文件时间戳和计划任务的执行时间。',
      evidence: [
        '系统时间偏差: +8分32秒',
        'NTP服务器: time.windows.com',
        '上次同步: 7天前 (同步失败)',
        'CMOS电池状态: 正常 (3.1V)',
      ],
      canAutoFix: true,
      autoFixDescription: '强制同步系统时间与NTP服务器',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'sync-system-time',
      rollbackPlan: '自动回滚: 时间同步后无法撤销（不影响数据）',
    });
  }

  if (restoreDisabled) {
    issues.push({
      id: 'system-restore-disabled',
      category: 'system',
      severity: 'warning',
      title: '系统还原保护已关闭',
      description: '系统还原功能被禁用，无法在出现问题时回滚系统状态',
      details: '系统还原是Windows重要的恢复功能。关闭后无法在安装驱动/软件失败时回滚系统。建议重新启用。',
      evidence: [
        '系统还原状态: 已禁用',
        'C盘保护: 关闭',
        '最大使用空间: 0%',
        '最近还原点: 无',
        '风险: 无系统回滚能力',
      ],
      canAutoFix: true,
      autoFixDescription: '启用系统还原保护，分配10%磁盘空间',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'enable-system-restore',
      rollbackPlan: '可在系统保护设置中重新禁用',
    });
  }

  // Always check activation status (simulated as OK typically)
  if (activationIssue) {
    issues.push({
      id: 'windows-activation-error',
      category: 'system',
      severity: 'warning',
      title: 'Windows激活异常',
      description: 'Windows激活状态异常，部分功能可能受限',
      details: 'Windows激活问题可能导致个性化设置不可用，并显示"未激活"水印。',
      evidence: [
        '激活状态: 未激活',
        '产品ID: 00330-80000-00000-AA123',
        '错误代码: 0xC004F074',
        '密钥管理服务: 无法连接',
      ],
      canAutoFix: false,
      autoFixDescription: '',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: '',
      rollbackPlan: '',
    });
  }

  return issues;
}
