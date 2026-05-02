import path from 'path';

export interface LockedFile {
  path: string;
  name: string;
  sizeKB: number;
  lockedBy: string;
  lockedSince: string;
  pid: number;
}

const MOCK_LOCKED_FILES: LockedFile[] = [
  { path: 'C:\\Windows\\System32\\config\\SAM',               name: 'SAM',               sizeKB: 128,    lockedBy: 'System',       lockedSince: new Date(Date.now() - 86400000 * 30).toISOString(), pid: 4 },
  { path: 'C:\\Windows\\System32\\config\\SYSTEM',            name: 'SYSTEM',            sizeKB: 24576,  lockedBy: 'System',       lockedSince: new Date(Date.now() - 86400000 * 30).toISOString(), pid: 4 },
  { path: 'C:\\pagefile.sys',                                 name: 'pagefile.sys',      sizeKB: 8388608, lockedBy: 'System',      lockedSince: new Date(Date.now() - 86400000).toISOString(),     pid: 4 },
  { path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Current Session', name: 'Current Session', sizeKB: 2048, lockedBy: 'chrome.exe', lockedSince: new Date(Date.now() - 3600000).toISOString(),   pid: 12345 },
  { path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Outlook\\test.ost',  name: 'test.ost', sizeKB: 512000, lockedBy: 'outlook.exe', lockedSince: new Date(Date.now() - 7200000).toISOString(), pid: 9876 },
  { path: 'C:\\Users\\User\\Documents\\locked_doc.docx',       name: 'locked_doc.docx',   sizeKB: 340,   lockedBy: 'WINWORD.EXE',  lockedSince: new Date(Date.now() - 1800000).toISOString(), pid: 23456 },
  { path: 'C:\\Program Files\\Windows Defender\\MsMpEng.exe', name: 'MsMpEng.exe',       sizeKB: 56700,  lockedBy: 'System',       lockedSince: new Date(Date.now() - 86400000).toISOString(),     pid: 1012 },
];

const CRITICAL_SYSTEM_FILES = ['pagefile.sys', 'SAM', 'SYSTEM', 'MsMpEng.exe'];

export class LockManager {
  getLockedFiles(): LockedFile[] {
    return [...MOCK_LOCKED_FILES];
  }

  isCriticalFile(filePath: string): boolean {
    return CRITICAL_SYSTEM_FILES.includes(path.basename(filePath));
  }

  unlockFile(filePath: string): { success: boolean; message: string } {
    if (this.isCriticalFile(filePath)) {
      return { success: false, message: `Cannot unlock ${path.basename(filePath)} — file is held by a critical system process` };
    }
    if (Math.random() > 0.3) {
      return { success: true, message: `Successfully released lock on ${path.basename(filePath)}` };
    }
    return { success: false, message: `Cannot unlock ${path.basename(filePath)} — file is held by a critical system process` };
  }

  unlockSelected(paths: string[]): { unlocked: number; failed: number; errors: string[] } {
    let unlocked = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const p of paths) {
      const result = this.unlockFile(p);
      if (result.success) unlocked++;
      else { failed++; errors.push(result.message); }
    }
    return { unlocked, failed, errors };
  }
}
