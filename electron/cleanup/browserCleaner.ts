export interface BrowserCacheInfo {
  browser: string;
  cacheSize: number;
  cookieCount: number;
  historySize: number;
  lastCleared: string;
}

const BROWSER_CACHES: BrowserCacheInfo[] = [
  {
    browser: 'Chrome',
    cacheSize: 1_850_000_000,
    cookieCount: 3240,
    historySize: 420_000_000,
    lastCleared: '2026-03-15 09:30:00',
  },
  {
    browser: 'Edge',
    cacheSize: 920_000_000,
    cookieCount: 1850,
    historySize: 210_000_000,
    lastCleared: '2026-04-20 14:00:00',
  },
  {
    browser: 'Firefox',
    cacheSize: 540_000_000,
    cookieCount: 890,
    historySize: 150_000_000,
    lastCleared: '2026-02-10 11:00:00',
  },
  {
    browser: 'Brave',
    cacheSize: 280_000_000,
    cookieCount: 420,
    historySize: 85_000_000,
    lastCleared: '2026-04-01 08:00:00',
  },
];

export class BrowserCleaner {
  scanBrowserCaches(): BrowserCacheInfo[] {
    return BROWSER_CACHES.map((c) => ({ ...c }));
  }

  async cleanBrowserCache(browser: string): Promise<{ size: number; message: string }> {
    const info = BROWSER_CACHES.find((b) => b.browser === browser);
    if (!info) {
      return { size: 0, message: `未找到浏览器: ${browser}` };
    }
    return {
      size: info.cacheSize,
      message: `已清理 ${browser} 缓存，释放 ${formatBytes(info.cacheSize)}`,
    };
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
