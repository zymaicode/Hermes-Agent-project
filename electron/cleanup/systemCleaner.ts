export interface SystemCleanupCategory {
  id: string;
  name: string;
  description: string;
  size: number;
  canClean: boolean;
  risk: 'safe' | 'moderate' | 'warning';
}

export interface CleanupResult {
  category: string;
  filesDeleted: number;
  spaceFreed: number;
  errors: string[];
}

const SYSTEM_CATEGORIES: SystemCleanupCategory[] = [
  {
    id: 'windows-update-cache',
    name: 'Windows Update Cache',
    description: 'Windows 更新备份文件，位于 SoftwareDistribution 文件夹。系统稳定后可安全删除。',
    size: 2_400_000_000,
    canClean: true,
    risk: 'moderate',
  },
  {
    id: 'log-files',
    name: 'Log Files (>30 days)',
    description: '超过 30 天的应用程序和系统日志文件，部分可能对故障排除有用。',
    size: 450_000_000,
    canClean: true,
    risk: 'safe',
  },
  {
    id: 'error-reporting',
    name: 'Error Reporting',
    description: 'Windows 错误报告 (WER) 生成的崩溃报告和诊断数据。',
    size: 320_000_000,
    canClean: true,
    risk: 'safe',
  },
  {
    id: 'windows-old',
    name: 'Old Windows Installation',
    description: 'Windows.old 文件夹，包含以前 Windows 安装的文件。仅当确定不回滚时删除。',
    size: 28_500_000_000,
    canClean: true,
    risk: 'warning',
  },
  {
    id: 'thumbnail-cache',
    name: 'Thumbnail Cache',
    description: '资源管理器中文件和文件夹的缩略图缓存，删除后会自动重建。',
    size: 180_000_000,
    canClean: true,
    risk: 'safe',
  },
  {
    id: 'font-cache',
    name: 'Font Cache',
    description: '字体渲染缓存文件，删除后系统会重新生成。',
    size: 85_000_000,
    canClean: true,
    risk: 'safe',
  },
];

export class SystemCleaner {
  scanSystem(): SystemCleanupCategory[] {
    return SYSTEM_CATEGORIES.map((c) => ({ ...c }));
  }

  async cleanSystem(categories: string[]): Promise<CleanupResult[]> {
    const results: CleanupResult[] = [];
    for (const id of categories) {
      const cat = SYSTEM_CATEGORIES.find((c) => c.id === id);
      if (cat) {
        results.push({
          category: cat.name,
          filesDeleted: cat.canClean ? Math.floor(cat.size / 1_000_000) : 0,
          spaceFreed: cat.canClean ? cat.size : 0,
          errors: cat.canClean ? [] : [`"${cat.name}" 不能自动安全删除`],
        });
      }
    }
    return results;
  }
}
