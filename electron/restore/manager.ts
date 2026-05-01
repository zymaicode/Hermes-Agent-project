export interface RestorePoint {
  id: number;
  description: string;
  type: 'system' | 'manual' | 'install' | 'update';
  created: string;
  status: 'available' | 'deleted';
  sizeMB: number;
  eventType: string;
  isAutomatic: boolean;
}

export interface RestoreSettings {
  enabled: boolean;
  diskSpaceUsed: number;
  maxUsage: number;
  lastRestore: string | null;
  nextScheduled: string | null;
  drives: string[];
}

function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  d.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60));
  return d.toISOString();
}

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

const BASE_POINTS: Omit<RestorePoint, 'id' | 'status'>[] = [
  { description: 'Windows Update KB5034122', type: 'update', eventType: 'Windows Update', isAutomatic: true, created: daysAgo(2), sizeMB: 450 },
  { description: 'Windows Update KB5034441', type: 'update', eventType: 'Windows Update', isAutomatic: true, created: daysAgo(4), sizeMB: 380 },
  { description: 'NVIDIA Driver 551.23', type: 'install', eventType: 'Application Install', isAutomatic: false, created: daysAgo(7), sizeMB: 1200 },
  { description: 'Pre-uninstall Visual C++ Redist', type: 'install', eventType: 'Application Install', isAutomatic: false, created: daysAgo(10), sizeMB: 250 },
  { description: 'Windows Update KB5034203', type: 'update', eventType: 'Windows Update', isAutomatic: true, created: daysAgo(14), sizeMB: 520 },
  { description: 'Manual — Before registry cleanup', type: 'manual', eventType: 'Manual', isAutomatic: false, created: daysAgo(16), sizeMB: 2100 },
  { description: 'Adobe Photoshop 2025 install', type: 'install', eventType: 'Application Install', isAutomatic: false, created: daysAgo(20), sizeMB: 1800 },
  { description: 'Windows Update KB5033560', type: 'update', eventType: 'Windows Update', isAutomatic: true, created: daysAgo(23), sizeMB: 340 },
  { description: 'System Restore (Scheduled)', type: 'system', eventType: 'System Restore', isAutomatic: true, created: daysAgo(28), sizeMB: 2500 },
  { description: 'Intel Bluetooth driver update', type: 'install', eventType: 'Application Install', isAutomatic: false, created: daysAgo(35), sizeMB: 150 },
  { description: 'Windows Update KB5032189', type: 'update', eventType: 'Windows Update', isAutomatic: true, created: daysAgo(42), sizeMB: 620 },
  { description: 'Manual — Before OS upgrade', type: 'manual', eventType: 'Manual', isAutomatic: false, created: daysAgo(56), sizeMB: 2800 },
];

export class RestoreManager {
  private points: RestorePoint[] = [];
  private settings: RestoreSettings;
  private nextId = 100;

  constructor() {
    this.points = BASE_POINTS.map((p, i) => ({
      ...p,
      id: 100 + i,
      status: i < 2 || i === 11 ? 'available' : (Math.random() > 0.3 ? 'available' : 'deleted') as 'available' | 'deleted',
    }));
    this.nextId = 100 + this.points.length;

    const totalUsed = this.points
      .filter((p) => p.status === 'available')
      .reduce((sum, p) => sum + p.sizeMB, 0);

    this.settings = {
      enabled: true,
      diskSpaceUsed: totalUsed,
      maxUsage: 3,
      lastRestore: daysAgo(14),
      nextScheduled: new Date(Date.now() + 7 * 86400000).toISOString(),
      drives: ['C:'],
    };
  }

  getRestorePoints(): RestorePoint[] {
    return [...this.points].sort((a, b) => b.created.localeCompare(a.created));
  }

  getSettings(): RestoreSettings {
    return { ...this.settings };
  }

  createRestorePoint(description: string): { success: boolean; message: string; point?: RestorePoint } {
    const point: RestorePoint = {
      id: this.nextId++,
      description: `Manual — ${description}`,
      type: 'manual',
      created: new Date().toISOString(),
      status: 'available',
      sizeMB: randomBetween(200, 3000),
      eventType: 'Manual',
      isAutomatic: false,
    };
    this.points.push(point);
    this.recalcUsage();
    return { success: true, message: `Restore point "${description}" created successfully.`, point };
  }

  restoreToPoint(id: number): { success: boolean; message: string } {
    const point = this.points.find((p) => p.id === id);
    if (!point) return { success: false, message: 'Restore point not found.' };
    if (point.status === 'deleted') return { success: false, message: 'This restore point has been deleted.' };
    return { success: true, message: `System will now restore to "${point.description}" and restart.` };
  }

  deleteRestorePoint(id: number): { success: boolean; message: string } {
    const idx = this.points.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, message: 'Restore point not found.' };
    this.points[idx].status = 'deleted';
    this.recalcUsage();
    return { success: true, message: 'Restore point deleted.' };
  }

  toggleProtection(enabled: boolean): { success: boolean } {
    this.settings.enabled = enabled;
    return { success: true };
  }

  setMaxUsage(percentage: number): { success: boolean } {
    this.settings.maxUsage = percentage;
    return { success: true };
  }

  private recalcUsage(): void {
    this.settings.diskSpaceUsed = this.points
      .filter((p) => p.status === 'available')
      .reduce((sum, p) => sum + p.sizeMB, 0);
  }
}
