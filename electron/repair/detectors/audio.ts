import type { DetectedIssue } from '../engine';
import { createRng } from '../utils';

export function detectAudioIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = createRng(seed);

  const audioServiceStopped = rng() < 0.08;
  const noDefaultDevice = rng() < 0.06;
  const deviceDisabled = rng() < 0.1;
  const driverOutdated = rng() < 0.2;

  if (audioServiceStopped) {
    issues.push({
      id: 'audio-service-stopped',
      category: 'audio',
      severity: 'critical',
      title: '音频服务未运行',
      description: 'Windows Audio服务已停止，导致系统无声音输出',
      details: 'Windows Audio服务(Audiosrv)是Windows音频子系统的核心服务。如果此服务停止，所有音频功能将不可用。',
      evidence: [
        '服务名称: Audiosrv',
        '当前状态: 已停止',
        '启动类型: 自动',
        '依赖服务: RPC Endpoint Mapper (正常运行)',
        '可能原因: 第三方音频软件冲突',
      ],
      canAutoFix: true,
      autoFixDescription: '重新启动Windows Audio服务及其依赖服务',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-audio-service',
      rollbackPlan: '自动回滚: 服务重启后自动恢复',
    });
  }

  if (noDefaultDevice) {
    issues.push({
      id: 'no-default-audio-device',
      category: 'audio',
      severity: 'warning',
      title: '默认音频设备未设置',
      description: '系统未检测到默认播放设备，可能导致无声音输出',
      details: '没有设置默认音频播放设备。这可能是音频驱动问题，或所有音频设备都被禁用。',
      evidence: [
        '默认播放设备: 无',
        '已安装音频设备: Realtek High Definition Audio (已禁用)',
        'HDMI音频: NVIDIA High Definition Audio (未接入)',
      ],
      canAutoFix: true,
      autoFixDescription: '启用并设置为默认音频播放设备',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'set-default-audio-device',
      rollbackPlan: '可在声音设置中手动更改默认设备',
    });
  }

  if (deviceDisabled) {
    issues.push({
      id: 'audio-device-disabled',
      category: 'audio',
      severity: 'warning',
      title: '音频设备被禁用',
      description: '检测到音频输出设备已被禁用，导致无法播放声音',
      details: '音频设备被禁用可能是用户误操作或某些应用程序修改了设置。',
      evidence: [
        '设备名称: Speakers (Realtek High Definition Audio)',
        '设备状态: 已禁用',
        '设备管理器状态: 正常（代码45: 设备已断开连接）',
      ],
      canAutoFix: true,
      autoFixDescription: '启用被禁用的音频设备',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'enable-audio-device',
      rollbackPlan: '可在设备管理器中重新禁用',
    });
  }

  if (driverOutdated) {
    issues.push({
      id: 'audio-driver-outdated',
      category: 'audio',
      severity: 'info',
      title: '音频驱动过时',
      description: '音频驱动版本较旧（超过1年），建议更新以获得更好的兼容性',
      details: '过时的音频驱动可能导致新应用程序无声音或声音异常。',
      evidence: [
        '驱动提供商: Realtek Semiconductor Corp.',
        '驱动日期: 2022-06-15',
        '驱动版本: 6.0.9235.1',
        '已安装时间: 3年8个月',
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
