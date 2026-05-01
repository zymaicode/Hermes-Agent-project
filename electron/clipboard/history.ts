export interface ClipboardEntry {
  id: string;
  type: 'text' | 'image' | 'file' | 'link';
  content: string;
  fullContent?: string;
  source: string;
  timestamp: number;
  size: number;
  isPinned: boolean;
}

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

const HISTORY_DATA: ClipboardEntry[] = [
  { id: 'c1', type: 'text', content: 'const result = await fetchData(userId, { timeout: 5000, retries: 3 });', fullContent: 'const result = await fetchData(userId, { timeout: 5000, retries: 3 });\nif (result.status === "ok") {\n  return result.data;\n}\nthrow new Error(`Fetch failed: ${result.error}`);', source: 'VS Code', timestamp: NOW - 2 * MIN, size: 186, isPinned: false },
  { id: 'c2', type: 'link', content: 'https://github.com/anthropics/claude-code/issues/482', fullContent: 'https://github.com/anthropics/claude-code/issues/482', source: 'Google Chrome', timestamp: NOW - 5 * MIN, size: 57, isPinned: false },
  { id: 'c3', type: 'text', content: 'API_KEY=sk-deepseek-v4-pro-8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c', fullContent: 'API_KEY=sk-deepseek-v4-pro-8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c', source: 'Windows Terminal', timestamp: NOW - 8 * MIN, size: 60, isPinned: true },
  { id: 'c4', type: 'file', content: 'C:\\Users\\User\\Documents\\Projects\\pc-toolkit\\electron\\main.ts', fullContent: 'C:\\Users\\User\\Documents\\Projects\\pc-toolkit\\electron\\main.ts', source: 'File Explorer', timestamp: NOW - 12 * MIN, size: 78, isPinned: false },
  { id: 'c5', type: 'text', content: 'Fix the memory leak in HardwareCollector.startPolling() — the interval is never cleared when component unmounts with React 19 strict mode. The cleanup function should check this._pollTimer before setting a new one.', fullContent: 'Fix the memory leak in HardwareCollector.startPolling() — the interval is never cleared when component unmounts with React 19 strict mode. The cleanup function should check this._pollTimer before setting a new one.', source: 'Slack', timestamp: NOW - 15 * MIN, size: 248, isPinned: false },
  { id: 'c6', type: 'link', content: 'https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process', fullContent: 'https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process', source: 'Firefox', timestamp: NOW - 22 * MIN, size: 75, isPinned: false },
  { id: 'c7', type: 'text', content: 'npx tsc --noEmit && npm run build', fullContent: 'npx tsc --noEmit && npm run build', source: 'Windows Terminal', timestamp: NOW - 28 * MIN, size: 32, isPinned: true },
  { id: 'c8', type: 'text', content: 'BUG-482: Users report dashboard shows NaN% when hardware polling first starts. Root cause is initial snapshot has zero totals for memory/disk, causing division by zero.', fullContent: 'BUG-482: Users report dashboard shows NaN% when hardware polling first starts. Root cause is initial snapshot has zero totals for memory/disk, causing division by zero.', source: 'Linear', timestamp: NOW - 35 * MIN, size: 205, isPinned: false },
  { id: 'c9', type: 'file', content: 'C:\\Users\\User\\Pictures\\Screenshots\\dashboard-bug-2026-05-01.png', fullContent: 'C:\\Users\\User\\Pictures\\Screenshots\\dashboard-bug-2026-05-01.png', source: 'Snipping Tool', timestamp: NOW - 40 * MIN, size: 85, isPinned: false },
  { id: 'c10', type: 'link', content: 'https://deepseek.ai/docs/api/chat-completions', fullContent: 'https://deepseek.ai/docs/api/chat-completions', source: 'Google Chrome', timestamp: NOW - 48 * MIN, size: 46, isPinned: false },
  { id: 'c11', type: 'text', content: 'John — can you review PR #284 when you get a chance? The firewall IPC changes need a second set of eyes before we merge.', fullContent: 'John — can you review PR #284 when you get a chance? The firewall IPC changes need a second set of eyes before we merge.', source: 'Discord', timestamp: NOW - 55 * MIN, size: 135, isPinned: false },
  { id: 'c12', type: 'text', content: 'git commit -m "feat: add WMI fallback for systems without LibreHardwareMonitor"', fullContent: 'git commit -m "feat: add WMI fallback for systems without LibreHardwareMonitor"', source: 'Windows Terminal', timestamp: NOW - 62 * MIN, size: 90, isPinned: false },
  { id: 'c13', type: 'file', content: 'C:\\Users\\User\\Documents\\Projects\\pc-toolkit\\src\\utils\\types.ts', fullContent: 'C:\\Users\\User\\Documents\\Projects\\pc-toolkit\\src\\utils\\types.ts', source: 'VS Code', timestamp: NOW - 70 * MIN, size: 72, isPinned: false },
  { id: 'c14', type: 'text', content: 'The health score calculation should weight CPU temp more heavily than disk temp since thermal throttling has a bigger performance impact. Current weights: CPU 25%, Memory 20%, Disk 15%, GPU 20%, Software 10%, Updates 5%, Alerts 5%.', fullContent: 'The health score calculation should weight CPU temp more heavily than disk temp since thermal throttling has a bigger performance impact. Current weights: CPU 25%, Memory 20%, Disk 15%, GPU 20%, Software 10%, Updates 5%, Alerts 5%.', source: 'Notion', timestamp: NOW - 75 * MIN, size: 287, isPinned: false },
  { id: 'c15', type: 'link', content: 'https://www.npmjs.com/package/better-sqlite3/v/11.7.0', fullContent: 'https://www.npmjs.com/package/better-sqlite3/v/11.7.0', source: 'Firefox', timestamp: NOW - 80 * MIN, size: 52, isPinned: false },
  { id: 'c16', type: 'text', content: 'Room 4B — Standup in 5 minutes', fullContent: 'Room 4B — Standup in 5 minutes', source: 'Slack', timestamp: NOW - 85 * MIN, size: 32, isPinned: false },
  { id: 'c17', type: 'text', content: 'export interface ClipboardEntry {\n  id: string;\n  type: \'text\' | \'image\' | \'file\' | \'link\';\n  content: string;\n}', fullContent: 'export interface ClipboardEntry {\n  id: string;\n  type: \'text\' | \'image\' | \'file\' | \'link\';\n  content: string;\n  fullContent?: string;\n  source: string;\n  timestamp: number;\n  size: number;\n  isPinned: boolean;\n}', source: 'VS Code', timestamp: NOW - 90 * MIN, size: 205, isPinned: false },
  { id: 'c18', type: 'file', content: 'C:\\Users\\User\\Downloads\\pc-toolkit-setup-1.0.0.exe', fullContent: 'C:\\Users\\User\\Downloads\\pc-toolkit-setup-1.0.0.exe', source: 'File Explorer', timestamp: NOW - 95 * MIN, size: 53, isPinned: false },
  { id: 'c19', type: 'text', content: 'PCHelper Phase 5 scope: Firewall, USB, Disk Cleanup, Security Center, Clipboard History', fullContent: 'PCHelper Phase 5 scope: Firewall Rules Viewer, USB Device Manager, Disk Cleanup Analyzer, Security Center, Clipboard History', source: 'Notion', timestamp: NOW - 105 * MIN, size: 95, isPinned: false },
  { id: 'c20', type: 'link', content: 'https://www.electronjs.org/docs/latest/tutorial/ipc', fullContent: 'https://www.electronjs.org/docs/latest/tutorial/ipc', source: 'Google Chrome', timestamp: NOW - 120 * MIN, size: 50, isPinned: false },
];

export class ClipboardManager {
  private history: ClipboardEntry[];

  constructor() {
    this.history = HISTORY_DATA.map((h) => ({ ...h }));
  }

  getHistory(): ClipboardEntry[] {
    return [...this.history].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.timestamp - a.timestamp;
    });
  }

  clearHistory(): void {
    this.history = [];
  }

  addToHistory(entry: Omit<ClipboardEntry, 'id' | 'timestamp'>): void {
    const newEntry: ClipboardEntry = {
      ...entry,
      id: `c${Date.now()}`,
      timestamp: Date.now(),
    };
    this.history.unshift(newEntry);
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
  }

  removeEntry(id: string): void {
    this.history = this.history.filter((e) => e.id !== id);
  }

  togglePin(id: string): void {
    const entry = this.history.find((e) => e.id === id);
    if (entry) {
      entry.isPinned = !entry.isPinned;
    }
  }
}
