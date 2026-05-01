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

export function detectDisplayIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;

  // Check graphics driver status via simulated event log analysis
  const gpuTemp = rng() * 40 + 45; // 45-85°C
  const driverVersion = '546.17';
  const recommendedRes = { w: 1920, h: 1080 };
  const currentRes = { w: 1920, h: 1080 };

  // Simulated: check Event Log for display driver crashes
  const driverCrashes = rng() < 0.15;
  if (driverCrashes) {
    issues.push({
      id: 'display-driver-crash',
      category: 'display',
      severity: 'critical',
      title: '显卡驱动可能已崩溃',
      description: '检测到显卡驱动停止响应事件，可能导致黑屏或画面卡顿',
      details: `NVIDIA驱动版本 ${driverVersion} 在过去24小时内记录了"Display driver nvlddmkm stopped responding"错误。这通常由驱动版本不兼容、过热或硬件故障引起。`,
      evidence: [
        `NVIDIA驱动版本: ${driverVersion}`,
        '事件日志: nvlddmkm 停止响应 (Event ID 4101)',
        '最近崩溃时间: 2小时前',
        `当前GPU温度: ${gpuTemp.toFixed(0)}°C`,
      ],
      canAutoFix: true,
      autoFixDescription: '重启显卡驱动（通过pnputil重启GPU设备），如问题仍然存在则建议更新驱动',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-graphics-driver',
      rollbackPlan: '自动回滚: 无破坏性操作，重启驱动后会自动恢复',
    });
  }

  // Check resolution mismatch
  if (currentRes.w !== recommendedRes.w || currentRes.h !== recommendedRes.h) {
    issues.push({
      id: 'display-resolution-mismatch',
      category: 'display',
      severity: 'warning',
      title: '显示分辨率异常',
      description: `当前分辨率 ${currentRes.w}x${currentRes.h} 与推荐分辨率 ${recommendedRes.w}x${recommendedRes.h} 不匹配`,
      details: '分辨率不匹配可能导致显示模糊或屏幕闪烁。',
      evidence: [
        `当前分辨率: ${currentRes.w}x${currentRes.h}`,
        `推荐分辨率: ${recommendedRes.w}x${recommendedRes.h}`,
      ],
      canAutoFix: true,
      autoFixDescription: '将分辨率重置为推荐值',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'reset-display-settings',
      rollbackPlan: '可在显示设置中手动恢复原分辨率',
    });
  }

  // Check GPU temperature
  if (gpuTemp > 85) {
    issues.push({
      id: 'gpu-overheat',
      category: 'display',
      severity: 'warning',
      title: 'GPU温度过高',
      description: `GPU当前温度 ${gpuTemp.toFixed(0)}°C，超过安全阈值 85°C`,
      details: 'GPU温度过高可能导致性能下降、画面卡顿甚至硬件损坏。请检查散热风扇是否正常工作，清理灰尘。',
      evidence: [
        `当前GPU温度: ${gpuTemp.toFixed(0)}°C`,
        '安全阈值: 85°C',
        'GPU使用率: 78%',
      ],
      canAutoFix: false,
      autoFixDescription: '',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: '',
      rollbackPlan: '',
    });
  }

  // Simulated: black screen from explorer crash
  const explorerCrashed = rng() < 0.05;
  if (explorerCrashed) {
    issues.push({
      id: 'explorer-crash-black',
      category: 'display',
      severity: 'critical',
      title: '资源管理器崩溃可能导致黑屏',
      description: '检测到explorer.exe崩溃事件，可能导致桌面黑屏或任务栏消失',
      details: 'Windows资源管理器(explorer.exe)意外终止。这会导致桌面图标、任务栏消失，表现为"黑屏"。',
      evidence: [
        '事件日志: explorer.exe 崩溃 (Event ID 1000)',
        '故障模块: shell32.dll',
        '异常代码: 0xc0000005',
      ],
      canAutoFix: true,
      autoFixDescription: '重启Windows资源管理器 (explorer.exe)',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'restart-explorer',
      rollbackPlan: '无需回滚，explorer.exe重启后自动恢复正常',
    });
  }

  return issues;
}
