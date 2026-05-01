export interface UacSettings {
  level: number;
  levelLabel: string;
  adminApprovalMode: boolean;
  secureDesktop: boolean;
  installerDetection: boolean;
  virtualization: boolean;
}

const UAC_LEVEL_LABELS: Record<number, string> = {
  0: '从不通知 (已禁用)',
  1: '仅在应用尝试更改计算机时通知 (不使用安全桌面)',
  2: '仅在应用尝试更改计算机时通知 (默认)',
  3: '始终通知 (每次使用安全桌面)',
};

export class UacManager {
  getSettings(): UacSettings {
    return {
      level: 2,
      levelLabel: UAC_LEVEL_LABELS[2],
      adminApprovalMode: true,
      secureDesktop: true,
      installerDetection: true,
      virtualization: true,
    };
  }

  getRecommendedLevel(): number {
    return 2;
  }

  getLevelLabel(level: number): string {
    return UAC_LEVEL_LABELS[level] ?? '未知级别';
  }
}
