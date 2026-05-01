export interface UpdateInfo {
  appName: string;
  currentVersion: string;
  latestVersion: string;
  publisher: string;
  releaseDate: string;
  changelog: string;
  downloadUrl: string;
  isCritical: boolean;
}

export interface UpdateScanResult {
  timestamp: number;
  totalApps: number;
  updatesAvailable: number;
  criticalUpdates: number;
  updates: UpdateInfo[];
}

interface LatestVersionEntry {
  version: string;
  date: string;
  changelog: string;
  isCritical: boolean;
  downloadUrl: string;
}

const latestVersions: Record<string, LatestVersionEntry> = {
  'node.js': {
    version: '22.0.0',
    date: '2026-04-15',
    changelog: 'Major update with V8 engine improvements, built-in WebSocket client, updated npm, and enhanced ESM support.',
    isCritical: true,
    downloadUrl: 'https://nodejs.org/en/download/',
  },
  'google chrome': {
    version: '125.0.6422.142',
    date: '2026-04-10',
    changelog: 'Security fixes and performance improvements. Updated rendering engine with faster page loads.',
    isCritical: true,
    downloadUrl: 'https://www.google.com/chrome/',
  },
  'mozilla firefox': {
    version: '126.0',
    date: '2026-04-12',
    changelog: 'Improved privacy protections, faster JavaScript engine, and new developer tools.',
    isCritical: false,
    downloadUrl: 'https://www.mozilla.org/firefox/',
  },
  'visual studio code': {
    version: '1.95.0',
    date: '2026-04-08',
    changelog: 'New AI-powered refactoring tools, improved TypeScript 5.7 support, and faster startup time.',
    isCritical: false,
    downloadUrl: 'https://code.visualstudio.com/',
  },
  'python': {
    version: '3.13.0',
    date: '2026-03-20',
    changelog: 'Performance improvements with adaptive specializing interpreter, new typing features, and improved error messages.',
    isCritical: false,
    downloadUrl: 'https://www.python.org/downloads/',
  },
  'discord': {
    version: '1.0.9156',
    date: '2026-04-18',
    changelog: 'Stability fixes, improved voice chat quality, and new overlay features for supported games.',
    isCritical: false,
    downloadUrl: 'https://discord.com/download',
  },
  '7-zip': {
    version: '24.08',
    date: '2026-02-28',
    changelog: 'New compression algorithms, faster extraction speeds, and improved archive format support.',
    isCritical: false,
    downloadUrl: 'https://www.7-zip.org/download.html',
  },
  'notepad++': {
    version: '8.7.0',
    date: '2026-03-15',
    changelog: 'Multi-edit enhancements, new dark mode themes, and improved large file handling.',
    isCritical: false,
    downloadUrl: 'https://notepad-plus-plus.org/downloads/',
  },
};

function parseVersion(version: string): number[] {
  return version
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map(Number)
    .filter((n) => !isNaN(n));
}

function compareVersions(current: string, latest: string): boolean {
  const cur = parseVersion(current);
  const lat = parseVersion(latest);
  const len = Math.max(cur.length, lat.length);

  for (let i = 0; i < len; i++) {
    const c = cur[i] || 0;
    const l = lat[i] || 0;
    if (c < l) return true;
    if (c > l) return false;
  }

  return false;
}

export class SoftwareUpdater {
  getLatestVersion(
    appName: string
  ): { version: string; date: string; changelog: string; isCritical: boolean; downloadUrl: string } | null {
    const key = appName.toLowerCase().trim();
    const entry = latestVersions[key];
    if (!entry) return null;
    return { ...entry };
  }

  async scanForUpdates(
    installedApps: { name: string; version: string }[]
  ): Promise<UpdateScanResult> {
    const updates: UpdateInfo[] = [];

    for (const app of installedApps) {
      const latest = this.getLatestVersion(app.name);
      if (!latest) continue;

      if (compareVersions(app.version, latest.version)) {
        updates.push({
          appName: app.name,
          currentVersion: app.version,
          latestVersion: latest.version,
          publisher: '',
          releaseDate: latest.date,
          changelog: latest.changelog,
          downloadUrl: latest.downloadUrl,
          isCritical: latest.isCritical,
        });
      }
    }

    return {
      timestamp: Date.now(),
      totalApps: installedApps.length,
      updatesAvailable: updates.length,
      criticalUpdates: updates.filter((u) => u.isCritical).length,
      updates,
    };
  }
}
