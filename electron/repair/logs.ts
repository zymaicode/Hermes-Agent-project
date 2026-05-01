export interface RepairLogEntry {
  id: number;
  timestamp: string;
  issueId: string;
  issueTitle: string;
  category: string;
  severity: string;
  fixAction: string;
  fixResult: 'success' | 'failed' | 'partial';
  details: string;
  userApproved: boolean;
  requiresRestart: boolean;
  restartPerformed: boolean;
  rollbackAvailable: boolean;
  duration: number;
  adminElevated: boolean;
}

export class RepairLogManager {
  private logs: RepairLogEntry[] = [];
  private nextId = 1;

  addLog(entry: Omit<RepairLogEntry, 'id' | 'timestamp'>): RepairLogEntry {
    const log: RepairLogEntry = {
      ...entry,
      id: this.nextId++,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(log);
    return log;
  }

  getLogs(): RepairLogEntry[] {
    return [...this.logs].reverse(); // Newest first
  }

  getLastLog(): RepairLogEntry | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }

  getLogsByIssue(issueId: string): RepairLogEntry[] {
    return this.logs.filter((l) => l.issueId === issueId);
  }
}
