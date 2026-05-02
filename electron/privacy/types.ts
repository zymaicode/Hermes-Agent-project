export type BrowserTraceType = 'history' | 'cache' | 'cookies' | 'passwords' | 'downloads' | 'autofill' | 'sessions';
export type PrivacyCategory = 'browser' | 'recentFiles' | 'clipboard' | 'dnsCache';

export interface BrowserTrace {
  browser: string;
  traceType: BrowserTraceType;
  count: number;
  sizeMB: number;
  canClean: boolean;
  lastCleaned: string | null;
}

export interface RecentFileEntry {
  path: string;
  name: string;
  lastAccessed: string;
  appName: string;
  sizeKB: number;
}

export interface PrivacyRiskItem {
  category: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: string;
  recommendation: string;
}

export interface PrivacyScanResult {
  timestamp: number;
  browsers: BrowserTrace[];
  recentFilesCount: number;
  recentFiles: RecentFileEntry[];
  risks: PrivacyRiskItem[];
  totalCleanableMB: number;
  privacyScore: number;
  privacyGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
}

export interface CleanResult {
  category: string;
  itemsCleaned: number;
  freedMB: number;
  errors: string[];
}
