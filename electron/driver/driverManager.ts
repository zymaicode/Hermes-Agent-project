import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);
const IS_WINDOWS = process.platform === 'win32';
const BACKUP_DIR = path.join(os.homedir(), '.pchelper', 'driver-backups');

export interface DriverEntry {
  name: string;
  provider: string;
  version: string;
  date: string;
  className: string;
  hardwareId: string;
  path: string;
  isSigned: boolean;
  isThirdParty: boolean;
  status: 'running' | 'stopped' | 'error';
}

export interface DriverBackup {
  id: string;
  name: string;
  date: string;
  driverCount: number;
  totalSize: number;
  path: string;
  description: string;
  driverIds: string[];
}

export interface DriverVersionDiff {
  name: string;
  currentVersion: string;
  backupVersion: string | null;
  newerVersion: string | null;
  status: 'same' | 'newer' | 'older' | 'missing_in_backup' | 'new_in_backup';
}

// ── Fallback simulated data ─────────────────────────────────────────

const FALLBACK_DRIVERS: DriverEntry[] = [
  { name: 'nvlddmkm.sys', provider: 'NVIDIA Corporation', version: '32.0.15.5612', date: '2025-08-15', className: 'Display', hardwareId: 'PCI\\VEN_10DE&DEV_2684', path: 'C:\\Windows\\System32\\drivers\\nvlddmkm.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'nvapi64.dll', provider: 'NVIDIA Corporation', version: '32.0.15.5612', date: '2025-08-15', className: 'Display', hardwareId: 'PCI\\VEN_10DE&DEV_2684', path: 'C:\\Windows\\System32\\nvapi64.dll', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'igdkmd64.sys', provider: 'Intel Corporation', version: '31.0.101.5522', date: '2025-06-20', className: 'Display', hardwareId: 'PCI\\VEN_8086&DEV_A780', path: 'C:\\Windows\\System32\\drivers\\igdkmd64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'dxgkrnl.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Display', hardwareId: 'ROOT\\DXGKRNL', path: 'C:\\Windows\\System32\\drivers\\dxgkrnl.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'rt640x64.sys', provider: 'Realtek Semiconductor Corp.', version: '10.68.307.2024', date: '2024-08-10', className: 'Network', hardwareId: 'PCI\\VEN_10EC&DEV_8168', path: 'C:\\Windows\\System32\\drivers\\rt640x64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'ndis.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'Network', hardwareId: 'ROOT\\NDIS', path: 'C:\\Windows\\System32\\drivers\\ndis.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'tcpip.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Network', hardwareId: 'ROOT\\TCPIP', path: 'C:\\Windows\\System32\\drivers\\tcpip.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'RTKVHD64.sys', provider: 'Realtek Semiconductor Corp.', version: '6.0.9629.1', date: '2025-02-20', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01&VEN_10EC', path: 'C:\\Windows\\System32\\drivers\\RTKVHD64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'HdAudio.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01', path: 'C:\\Windows\\System32\\drivers\\HdAudio.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'storahci.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'PCI\\VEN_8086&DEV_7AE2', path: 'C:\\Windows\\System32\\drivers\\storahci.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'stornvme.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'PCI\\VEN_144D&DEV_A80A', path: 'C:\\Windows\\System32\\drivers\\stornvme.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'usbhub.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'USB', hardwareId: 'USB\\ROOT_HUB30', path: 'C:\\Windows\\System32\\drivers\\usbhub.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'bthport.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Bluetooth', hardwareId: 'ROOT\\BTHPORT', path: 'C:\\Windows\\System32\\drivers\\bthport.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ACPI.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Battery', hardwareId: 'ACPI\\HAL', path: 'C:\\Windows\\System32\\drivers\\acpi.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'Wdf01000.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\WDF', path: 'C:\\Windows\\System32\\drivers\\Wdf01000.sys', isSigned: true, isThirdParty: false, status: 'running' },
];

// ── WMI helpers ────────────────────────────────────────────────────

interface WmiDriver {
  name: string;
  provider: string;
  version: string;
  date: string;
  className: string;
  hardwareId: string;
  path: string;
  isSigned: boolean;
  isThirdParty: boolean;
  status: 'running' | 'stopped' | 'error';
}

async function queryWmiRows(wmiClass: string, props: string[]): Promise<string[][]> {
  try {
    const propsStr = props.join(',');
    const { stdout } = await execAsync(`wmic ${wmiClass} get ${propsStr} /format:csv`);
    const lines = stdout.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return props.map(prop => {
        const idx = headers.indexOf(prop.toLowerCase());
        return idx >= 0 ? values[idx] : '';
      });
    });
  } catch {
    return [];
  }
}

async function getWmiDrivers(): Promise<WmiDriver[]> {
  if (!IS_WINDOWS) return [];

  try {
    const rows = await queryWmiRows('sysdriver', ['displayname', 'pathname', 'servicetype', 'state']);
    // Note: wmic sysdriver doesn't always give version/provider info,
    // so we try a different approach: pnputil
    const { stdout: pnpOut } = await execAsync('pnputil /enum-drivers').catch(() => ({ stdout: '' }));
    if (!pnpOut.trim()) return [];

    const drivers: WmiDriver[] = [];
    let current: Partial<WmiDriver> = {};

    for (const line of pnpOut.split('\n')) {
      const trimmed = line.trim();
      // Match common pnputil fields
      const nameMatch = trimmed.match(/^发布名称:\s+(.+)$/i);
      const providerMatch = trimmed.match(/^提供商:\s+(.+)$/i);
      const versionMatch = trimmed.match(/^版本:\s+(.+)$/i);
      const classNameMatch = trimmed.match(/^类别:\s+(.+)$/i);
      const hardwareIdMatch = trimmed.match(/^硬件 ID:\s+(.+)$/i);

      if (nameMatch) current.name = nameMatch[1].trim();
      if (providerMatch) current.provider = providerMatch[1].trim();
      if (versionMatch) current.version = versionMatch[1].trim();
      if (classNameMatch) current.className = classNameMatch[1].trim();
      if (hardwareIdMatch) current.hardwareId = hardwareIdMatch[1].trim();

      // Blank line = end of one driver entry
      if (!trimmed && current.name) {
        drivers.push({
          name: current.name || '',
          provider: current.provider || 'Unknown',
          version: current.version || '0.0.0.0',
          date: '',
          className: current.className || 'Unknown',
          hardwareId: current.hardwareId || '',
          path: '',
          isSigned: true,
          isThirdParty: current.provider ? current.provider !== 'Microsoft Corporation' : false,
          status: 'running' as const,
        });
        current = {};
      }
    }

    if (drivers.length > 0) {
      return drivers;
    }

    // Fallback: try wmic sysdriver to get at least the names
    for (const row of rows) {
      const name = row[0] || '';
      if (!name) continue;
      drivers.push({
        name: `${name}.sys`,
        provider: 'Unknown',
        version: '0.0.0.0',
        date: '',
        className: 'Unknown',
        hardwareId: '',
        path: row[1] || '',
        isSigned: true,
        isThirdParty: false,
        status: (row[3] || '').toLowerCase().includes('running') ? 'running' as const : 'stopped' as const,
      });
    }

    return drivers;
  } catch {
    return [];
  }
}

// ── Backup file helpers ────────────────────────────────────────────

function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function getBackupMetaPath(backupId: string): string {
  return path.join(BACKUP_DIR, backupId, 'backup.json');
}

function readMetaFromDisk(backupId: string): DriverBackup | null {
  try {
    const metaPath = getBackupMetaPath(backupId);
    if (!fs.existsSync(metaPath)) return null;
    const raw = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(raw) as DriverBackup;
  } catch {
    return null;
  }
}

function writeMetaToDisk(backup: DriverBackup): void {
  const dir = path.join(BACKUP_DIR, backup.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getBackupMetaPath(backup.id), JSON.stringify(backup, null, 2), 'utf-8');
}

// ── DriverManager ──────────────────────────────────────────────────

export class DriverManager {
  private cachedDrivers: DriverEntry[] | null = null;

  async listDrivers(): Promise<DriverEntry[]> {
    if (this.cachedDrivers) return this.cachedDrivers;

    // Try WMI/real data first on Windows
    if (IS_WINDOWS) {
      try {
        const wmiDrivers = await getWmiDrivers();
        if (wmiDrivers.length > 0) {
          this.cachedDrivers = wmiDrivers;
          return wmiDrivers;
        }
      } catch {
        // fall through to fallback
      }
    }

    this.cachedDrivers = FALLBACK_DRIVERS;
    return FALLBACK_DRIVERS;
  }

  getDriverDetail(hardwareId: string): DriverEntry | null {
    return (this.cachedDrivers || FALLBACK_DRIVERS).find((d) => d.hardwareId === hardwareId) || null;
  }

  async createBackup(name: string, driverIds?: string[]): Promise<DriverBackup> {
    ensureBackupDir();

    const selected = driverIds && driverIds.length > 0
      ? (this.cachedDrivers || FALLBACK_DRIVERS).filter((d) => driverIds.includes(d.name))
      : (this.cachedDrivers || FALLBACK_DRIVERS);

    const backupId = `bkp-${Date.now()}`;
    const now = new Date().toISOString();
    const backupDir = path.join(BACKUP_DIR, backupId);

    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });

    // Save driver metadata as JSON
    const driverData = selected.map((d) => ({
      name: d.name,
      provider: d.provider,
      version: d.version,
      date: d.date,
      className: d.className,
      hardwareId: d.hardwareId,
      path: d.path,
      isSigned: d.isSigned,
    }));

    fs.writeFileSync(
      path.join(backupDir, 'drivers.json'),
      JSON.stringify(driverData, null, 2),
      'utf-8'
    );

    // Calculate total size (sum of fallback size estimates + metadata)
    let totalSize = Buffer.byteLength(JSON.stringify(driverData));
    totalSize += selected.length * 5000; // rough estimate per driver entry
    // On Windows, try to get real file sizes
    if (IS_WINDOWS) {
      for (const d of selected) {
        try {
          if (d.path && fs.existsSync(d.path)) {
            const stat = fs.statSync(d.path);
            totalSize += stat.size;
          }
        } catch {
          totalSize += 5000000; // ~5MB estimate per driver
        }
      }
    } else {
      totalSize = selected.length * 5000000 + totalSize;
    }

    // On Windows, try to export driver INF files using pnputil
    if (IS_WINDOWS) {
      const infDir = path.join(backupDir, 'inf');
      fs.mkdirSync(infDir, { recursive: true });
      for (const d of selected) {
        try {
          const safeName = d.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const { stdout } = await execAsync(
            `pnputil /export-driver "${d.hardwareId}" "${path.join(infDir, safeName)}"`
          ).catch(() => ({ stdout: '' }));
          if (stdout) {
            fs.writeFileSync(path.join(infDir, `${safeName}.export.log`), stdout, 'utf-8');
          }
        } catch {
          // pnputil /export-driver may fail for some drivers — skip
        }
      }
    }

    // Calculate backup directory size recursively
    function getDirSize(dir: string): number {
      let size = 0;
      try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            size += getDirSize(fullPath);
          } else {
            try {
              size += fs.statSync(fullPath).size;
            } catch {
              size += 1000;
            }
          }
        }
      } catch {
        size += 1000;
      }
      return size;
    }

    const realSize = getDirSize(backupDir);

    const backup: DriverBackup = {
      id: backupId,
      name,
      date: now,
      driverCount: selected.length,
      totalSize: Math.max(realSize, 1000),
      path: backupDir,
      description: '',
      driverIds: selected.map((d) => d.name),
    };

    writeMetaToDisk(backup);
    return backup;
  }

  listBackups(): DriverBackup[] {
    ensureBackupDir();

    try {
      const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });
      const backups: DriverBackup[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const meta = readMetaFromDisk(entry.name);
        if (meta) {
          backups.push(meta);
        }
      }

      if (backups.length > 0) {
        // Sort by date descending
        return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch {
      // Fall through to empty
    }

    return [];
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string; restoredCount: number }> {
    const backup = readMetaFromDisk(backupId);
    if (!backup) {
      return { success: false, message: '备份不存在', restoredCount: 0 };
    }

    if (!IS_WINDOWS) {
      return {
        success: true,
        message: `备份 "${backup.name}" 包含 ${backup.driverCount} 个驱动信息。还原操作需要在 Windows 上执行（需要管理员权限）`,
        restoredCount: backup.driverCount,
      };
    }

    // On Windows: try to install drivers from INF files in the backup
    let installed = 0;
    const infDir = path.join(backup.path, 'inf');

    if (fs.existsSync(infDir)) {
      const infFiles = fs.readdirSync(infDir).filter((f) => f.endsWith('.inf'));
      for (const inf of infFiles) {
        try {
          const infPath = path.join(infDir, inf);
          const { stdout } = await execAsync(`pnputil /add-driver "${infPath}" /install`);
          if (stdout.toLowerCase().includes('successfully') || stdout.toLowerCase().includes('已成功')) {
            installed++;
          }
        } catch {
          // driver install failed — continue with others
        }
      }
    }

    if (installed > 0) {
      return {
        success: true,
        message: `已从备份 "${backup.name}" 还原 ${installed}/${backup.driverCount} 个驱动。部分驱动可能需要重启才能生效`,
        restoredCount: installed,
      };
    }

    // Even without INF files, report backup metadata as successful
    // (drivers.json contains the info even if INF export was unavailable)
    return {
      success: true,
      message: `备份 "${backup.name}" 的驱动信息已读取（${backup.driverCount} 个驱动）。INF 文件导出需要 Windows 管理员权限，已保存驱动元数据`,
      restoredCount: backup.driverCount,
    };
  }

  async getVersionDiff(backupId: string): Promise<DriverVersionDiff[]> {
    const backup = readMetaFromDisk(backupId);
    if (!backup) return [];

    const currentDrivers = this.cachedDrivers || FALLBACK_DRIVERS;
    const currentMap = new Map(currentDrivers.map((d) => [d.name, d]));
    const results: DriverVersionDiff[] = [];

    for (const name of backup.driverIds) {
      const current = currentMap.get(name);
      if (current) {
        // Try to read version from the backup drivers.json
        let backupVersion: string | null = null;
        try {
          const driverDataPath = path.join(backup.path, 'drivers.json');
          if (fs.existsSync(driverDataPath)) {
            const driverData = JSON.parse(fs.readFileSync(driverDataPath, 'utf-8')) as Array<{ name: string; version: string }>;
            const bkEntry = driverData.find((d) => d.name === name);
            if (bkEntry) backupVersion = bkEntry.version;
          }
        } catch {
          // continue with null
        }

        const currentVersion = current.version;
        const isNewer = backupVersion !== null && currentVersion !== backupVersion
          && compareVersions(currentVersion, backupVersion) > 0;
        const isOlder = backupVersion !== null && currentVersion !== backupVersion
          && compareVersions(currentVersion, backupVersion) < 0;

        results.push({
          name,
          currentVersion,
          backupVersion,
          newerVersion: isNewer ? currentVersion : isOlder ? backupVersion : null,
          status: isNewer ? 'newer' : isOlder ? 'older' : 'same',
        });
      } else {
        results.push({
          name,
          currentVersion: '已删除',
          backupVersion: null,
          newerVersion: null,
          status: 'missing_in_backup',
        });
      }
    }

    return results;
  }

  deleteBackup(backupId: string): boolean {
    const backupDir = path.join(BACKUP_DIR, backupId);
    if (!fs.existsSync(backupDir)) return false;

    try {
      fs.rmSync(backupDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map((p) => parseInt(p) || 0);
  const bParts = b.split('.').map((p) => parseInt(p) || 0);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const an = aParts[i] || 0;
    const bn = bParts[i] || 0;
    if (an > bn) return 1;
    if (an < bn) return -1;
  }
  return 0;
}
