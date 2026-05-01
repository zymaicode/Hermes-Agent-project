import type { DetectedIssue } from '../engine';
import { createRng } from '../utils';

export function detectPerformanceIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = createRng(seed);

  const cpuUsage = rng() * 40 + 50; // 50-90%
  const memUsage = rng() * 30 + 60; // 60-90%
  const diskQueue = rng() * 2.5;
  const startupCount = Math.floor(rng() * 12) + 10; // 10-22
  const pageFileUsage = rng() * 50 + 40; // 40-90%

  if (cpuUsage > 85) {
    issues.push({
      id: 'cpu-high-usage',
      category: 'performance',
      severity: 'warning',
      title: 'CPU占用持续过高',
      description: `CPU使用率持续在 ${cpuUsage.toFixed(0)}% 以上，可能导致系统响应缓慢`,
      details: '高CPU使用率通常由后台进程、恶意软件或系统服务异常引起。建议检查任务管理器中占用CPU最高的进程。',
      evidence: [
        `当前CPU使用率: ${cpuUsage.toFixed(0)}%`,
        '5分钟平均使用率: 87%',
        '最高占用进程: MsMpEng.exe (Windows Defender)',
      ],
      canAutoFix: true,
      autoFixDescription: '禁用非必要启动项，清理临时文件，优化后台服务',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'optimize-performance',
      rollbackPlan: '可在启动项管理中重新启用被禁用的项目',
    });
  }

  if (memUsage > 88) {
    issues.push({
      id: 'memory-insufficient',
      category: 'performance',
      severity: 'critical',
      title: '内存不足',
      description: `内存使用率达到 ${memUsage.toFixed(0)}%，系统可能频繁使用页面文件导致速度变慢`,
      details: '内存不足会导致系统使用硬盘作为虚拟内存（页面文件），速度远低于物理内存。建议关闭不必要的程序或增加物理内存。',
      evidence: [
        `内存使用率: ${memUsage.toFixed(0)}%`,
        '已用内存: 14.2 GB / 16 GB',
        '页面文件使用: 8.5 GB',
      ],
      canAutoFix: true,
      autoFixDescription: '清理临时文件释放磁盘空间，优化页面文件设置，禁用高内存启动项',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'optimize-memory',
      rollbackPlan: '可重新启用被禁用的启动项，恢复页面文件设置',
    });
  }

  if (diskQueue > 2) {
    issues.push({
      id: 'disk-100-active',
      category: 'performance',
      severity: 'warning',
      title: '磁盘活动时间过高',
      description: `磁盘队列长度 ${diskQueue.toFixed(1)}，磁盘可能处于100%活动状态`,
      details: '磁盘持续100%活动通常由Windows Search索引、Superfetch服务或磁盘碎片引起。对于SSD，可能是固件问题。',
      evidence: [
        `磁盘队列长度: ${diskQueue.toFixed(1)}`,
        '活动时间: 100%',
        '平均响应时间: 250ms',
        '可能原因: Windows Search索引服务',
      ],
      canAutoFix: true,
      autoFixDescription: '暂停Windows Search索引服务，优化Superfetch设置',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'optimize-disk',
      rollbackPlan: '可重新启用被暂停的服务',
    });
  }

  if (startupCount > 15) {
    issues.push({
      id: 'too-many-startup',
      category: 'performance',
      severity: 'info',
      title: '开机启动项过多',
      description: `检测到 ${startupCount} 个开机启动项，可能显著延长开机时间`,
      details: '过多的开机启动项会导致Windows启动缓慢。建议禁用不必要的启动程序。',
      evidence: [
        `开机启动项数量: ${startupCount}`,
        '建议数量: ≤15',
        '预计开机延迟: 45秒',
        '高影响项目: OneDrive, Steam, Discord',
      ],
      canAutoFix: true,
      autoFixDescription: '禁用低影响的非必要启动项（保留杀毒软件和系统服务）',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'disable-startup-apps',
      rollbackPlan: '可在启动项管理中重新启用被禁用的项目',
    });
  }

  if (pageFileUsage > 85) {
    issues.push({
      id: 'pagefile-near-max',
      category: 'performance',
      severity: 'warning',
      title: '虚拟内存不足',
      description: `页面文件使用率 ${pageFileUsage.toFixed(0)}%，接近最大值可能导致程序崩溃`,
      details: '页面文件（虚拟内存）即将耗尽。这通常由内存泄漏或物理内存不足引起。',
      evidence: [
        `页面文件使用率: ${pageFileUsage.toFixed(0)}%`,
        '页面文件大小: 4.8 GB / 6 GB',
        '已提交内存: 18.2 GB',
      ],
      canAutoFix: true,
      autoFixDescription: '优化页面文件设置为系统托管，增加最大页面文件大小',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'optimize-pagefile',
      rollbackPlan: '可恢复原页面文件设置',
    });
  }

  return issues;
}
