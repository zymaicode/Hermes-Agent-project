import type { PrivacyScanResult, BrowserTrace, RecentFileEntry, PrivacyRiskItem } from './types';

const BROWSER_ORDER = ['Chrome', 'Firefox', 'Edge', 'Brave'];
const TRACE_TYPES: Array<{ type: BrowserTrace['traceType']; label: string }> = [
  { type: 'history',    label: 'Browsing History' },
  { type: 'cache',      label: 'Cache' },
  { type: 'cookies',    label: 'Cookies' },
  { type: 'passwords',  label: 'Saved Passwords' },
  { type: 'downloads',  label: 'Download History' },
  { type: 'autofill',   label: 'Autofill Data' },
  { type: 'sessions',   label: 'Session Data' },
];

function randomTraceCount(): number {
  return Math.floor(10 + Math.random() * 5000);
}
function randomTraceSize(): number {
  return Math.round((Math.random() * 200 + 1) * 10) / 10;
}

export class PrivacyScanner {
  scan(): PrivacyScanResult {
    const browsers: BrowserTrace[] = [];
    let totalCleanableMB = 0;

    for (const browser of BROWSER_ORDER) {
      for (const { type } of TRACE_TYPES) {
        const count = randomTraceCount();
        const canClean = type !== 'sessions' || Math.random() > 0.5;
        const sizeMB = canClean ? randomTraceSize() : 0;
        totalCleanableMB += sizeMB;
        browsers.push({
          browser,
          traceType: type,
          count,
          sizeMB,
          canClean,
          lastCleaned: null,
        });
      }
    }

    // Recent files
    const recentFiles: RecentFileEntry[] = [
      { path: 'C:\\Users\\User\\Documents\\report.docx',         name: 'report.docx',         lastAccessed: new Date(Date.now() - 60000).toISOString(),      appName: 'Microsoft Word',   sizeKB: 2450 },
      { path: 'C:\\Users\\User\\Downloads\\setup.exe',           name: 'setup.exe',           lastAccessed: new Date(Date.now() - 300000).toISOString(),     appName: 'File Explorer',    sizeKB: 12800 },
      { path: 'C:\\Users\\User\\Pictures\\screenshot.png',       name: 'screenshot.png',      lastAccessed: new Date(Date.now() - 900000).toISOString(),     appName: 'Photos',           sizeKB: 3400 },
      { path: 'C:\\Users\\User\\Desktop\\notes.txt',             name: 'notes.txt',           lastAccessed: new Date(Date.now() - 1800000).toISOString(),    appName: 'Notepad',          sizeKB: 12 },
      { path: 'C:\\Users\\User\\AppData\\Local\\Temp\\tmp123.tmp', name: 'tmp123.tmp',      lastAccessed: new Date(Date.now() - 3600000).toISOString(),    appName: 'System',           sizeKB: 560 },
      { path: 'C:\\Users\\User\\Documents\\invoice.pdf',         name: 'invoice.pdf',         lastAccessed: new Date(Date.now() - 7200000).toISOString(),    appName: 'Adobe Acrobat',    sizeKB: 1800 },
    ];

    // Risk assessment
    const risks: PrivacyRiskItem[] = [
      {
        category: 'Browser Cache',
        risk: browsers.filter(b => b.traceType === 'cache').reduce((sum, b) => sum + b.sizeMB, 0) > 500 ? 'high' : 'medium',
        description: `${browsers.filter(b => b.traceType === 'cache').length} browsers have cached data`,
        details: `Total cache size: ${browsers.filter(b => b.traceType === 'cache').reduce((s, b) => s + b.sizeMB, 0).toFixed(1)} MB. Data can be used to track browsing habits.`,
        recommendation: 'Clear browser cache regularly (recommended: weekly).',
      },
      {
        category: 'Saved Passwords',
        risk: browsers.some(b => b.traceType === 'passwords' && b.count > 0) ? 'critical' : 'low',
        description: `Saved passwords found in ${browsers.filter(b => b.traceType === 'passwords' && b.count > 0).length} browsers`,
        details: `${browsers.filter(b => b.traceType === 'passwords').reduce((s, b) => s + b.count, 0)} saved credentials. These are stored insecurely by default.`,
        recommendation: 'Use a dedicated password manager instead of browser storage.',
      },
      {
        category: 'Recent Files',
        risk: 'medium',
        description: `${recentFiles.length} recently accessed files are tracked`,
        details: `Recent file history can reveal work habits and sensitive documents. Last activity: ${recentFiles[0]?.name}`,
        recommendation: 'Clear Recent Files history after sensitive work sessions.',
      },
      {
        category: 'Browsing History',
        risk: 'high',
        description: `Browsing history across ${browsers.filter(b => b.traceType === 'history').reduce((s, b) => s + b.count, 0)} entries`,
        details: `Complete browsing history can reveal visited sites, search queries, and online activity patterns.`,
        recommendation: 'Use private/incognito mode for sensitive browsing, or clear history regularly.',
      },
    ];

    const privacyScore = Math.max(10, Math.min(95, 100 - (totalCleanableMB / 10) - (recentFiles.length * 3) - (risks.filter(r => r.risk === 'critical').length * 20)));
    const privacyGrade = privacyScore >= 90 ? 'Excellent' : privacyScore >= 70 ? 'Good' : privacyScore >= 50 ? 'Fair' : privacyScore >= 25 ? 'Poor' : 'Critical';

    return {
      timestamp: Date.now(),
      browsers,
      recentFilesCount: recentFiles.length,
      recentFiles,
      risks,
      totalCleanableMB: Math.round(totalCleanableMB * 10) / 10,
      privacyScore,
      privacyGrade,
    };
  }

  cleanBrowserTrace(browser: string, traceType: BrowserTrace['traceType']): { success: boolean; freedMB: number } {
    return { success: true, freedMB: Math.round(Math.random() * 200 * 10) / 10 };
  }

  cleanAllBrowserTraces(): { totalFreedMB: number; results: Array<{ browser: string; traceType: string; success: boolean; freedMB: number }> } {
    const results: Array<{ browser: string; traceType: string; success: boolean; freedMB: number }> = [];
    let totalFreedMB = 0;
    for (const browser of BROWSER_ORDER) {
      for (const { type } of TRACE_TYPES) {
        if (Math.random() > 0.1) {
          const freed = Math.round(Math.random() * 200 * 10) / 10;
          totalFreedMB += freed;
          results.push({ browser, traceType: type, success: true, freedMB: freed });
        } else {
          results.push({ browser, traceType: type, success: false, freedMB: 0 });
        }
      }
    }
    return { totalFreedMB: Math.round(totalFreedMB * 10) / 10, results };
  }

  clearRecentFiles(): { cleared: number } {
    return { cleared: Math.floor(6 + Math.random() * 20) };
  }
}
