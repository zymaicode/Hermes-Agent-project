export interface TempFileCategory {
  id: string;
  name: string;
  path: string;
  description: string;
  size: number;
  fileCount: number;
  canClean: boolean;
}

export interface CleanupResult {
  category: string;
  filesDeleted: number;
  spaceFreed: number;
  errors: string[];
}

const TEMP_CATEGORIES: TempFileCategory[] = [
  {
    id: 'windows-temp',
    name: 'Windows Temp',
    path: 'C:\\Windows\\Temp',
    description: '系统临时文件，由 Windows 系统进程和服务创建。',
    size: 2_200_000_000,
    fileCount: 4520,
    canClean: true,
  },
  {
    id: 'user-temp',
    name: 'User Temp',
    path: 'C:\\Users\\User\\AppData\\Local\\Temp',
    description: '用户应用程序在 %TEMP% 文件夹中创建的临时文件。',
    size: 1_050_000_000,
    fileCount: 3100,
    canClean: true,
  },
  {
    id: 'prefetch',
    name: 'Prefetch',
    path: 'C:\\Windows\\Prefetch',
    description: 'Windows 预读取文件，用于加速应用程序启动。',
    size: 380_000_000,
    fileCount: 340,
    canClean: true,
  },
  {
    id: 'recycle-bin',
    name: 'Recycle Bin',
    path: 'C:\\$Recycle.Bin',
    description: '已删除但尚未永久移除的文件。',
    size: 920_000_000,
    fileCount: 340,
    canClean: true,
  },
  {
    id: 'recent-docs',
    name: 'Recent Documents',
    path: 'C:\\Users\\User\\AppData\\Roaming\\Microsoft\\Windows\\Recent',
    description: '最近打开的文档快捷方式列表。',
    size: 12_000_000,
    fileCount: 150,
    canClean: true,
  },
  {
    id: 'delivery-opt',
    name: 'Delivery Optimization',
    path: 'C:\\Windows\\SoftwareDistribution\\DeliveryOptimization',
    description: 'Windows 更新传递优化缓存文件，可能与其他电脑共享。',
    size: 650_000_000,
    fileCount: 180,
    canClean: true,
  },
];

export class TempCleaner {
  scanTempFiles(): TempFileCategory[] {
    return TEMP_CATEGORIES.map((c) => ({ ...c }));
  }

  async cleanTempFiles(categories: string[]): Promise<CleanupResult[]> {
    const results: CleanupResult[] = [];
    for (const id of categories) {
      const cat = TEMP_CATEGORIES.find((c) => c.id === id);
      if (cat) {
        results.push({
          category: cat.name,
          filesDeleted: cat.canClean ? cat.fileCount : 0,
          spaceFreed: cat.canClean ? cat.size : 0,
          errors: cat.canClean ? [] : [`"${cat.name}" 不能自动安全删除`],
        });
      }
    }
    return results;
  }
}
