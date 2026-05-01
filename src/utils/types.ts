export interface CPUInfo {
  name: string;
  cores: number;
  threads: number;
  baseClock: number;
  currentClock: number;
  usage: number;
  temp: number;
  power: number;
  voltage: number;
}

export interface MemoryInfo {
  total: number;
  used: number;
  available: number;
  usagePercent: number;
  speed: number;
  type: string;
  slots: number;
}

export interface DiskInfo {
  name: string;
  model: string;
  type: string;
  total: number;
  used: number;
  free: number;
  usagePercent: number;
  temp: number;
  health: string;
}

export interface GPUInfo {
  name: string;
  vramTotal: number;
  vramUsed: number;
  usage: number;
  temp: number;
  clock: number;
  power: number;
}

export interface MotherboardInfo {
  manufacturer: string;
  model: string;
  bios: string;
  chipset: string;
}

export interface HardwareSnapshot {
  cpu: CPUInfo;
  memory: MemoryInfo;
  disks: DiskInfo[];
  gpu: GPUInfo;
  motherboard: MotherboardInfo;
}

export interface SoftwareEntry {
  id: number;
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  sizeMB: number;
}

export interface ChatMessage {
  id: number;
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ConflictType = 'install_conflict' | 'residual_files' | 'residual_registry' | 'process_conflict';
export type ConflictSeverity = 'low' | 'medium' | 'high';

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  details: string[];
  resolution: string;
}

export interface ConflictReport {
  timestamp: number;
  conflicts: ConflictItem[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AppEntry {
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: number; // MB
  installPath: string;
  uninstallString: string;
  isSelected: boolean;
  category?: string;
  description?: string;
  dependencies?: string[];
}

export interface UninstallResult {
  success: number;
  failed: number;
  errors: string[];
}

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

export type AlertType = 'local_rule' | 'ai_analysis';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  detail: string;
  timestamp: number;
  dismissed: boolean;
  autoResolve: boolean;
  sourceMetric?: string;
  currentValue?: number;
  threshold?: number;
}

export type NavPage = 'dashboard' | 'repair' | 'overlay' | 'hardware' | 'software' | 'apps' | 'conflicts' | 'updates' | 'alerts' | 'health' | 'ai' | 'settings' | 'startup' | 'network' | 'temperatures' | 'process' | 'system' | 'benchmark' | 'scheduler' | 'firewall' | 'usb' | 'cleanup' | 'security' | 'clipboard' | 'drivers' | 'services' | 'eventlog' | 'battery' | 'perflog' | 'registry' | 'netconn' | 'filetypes' | 'display' | 'power' | 'restore' | 'filescanner' | 'remote' | 'report' | 'memory' | 'features' | 'sounds' | 'fonts' | 'accounts' | 'netdiag';

export interface StartupEntry {
  name: string;
  path: string;
  enabled: boolean;
  type: 'registry' | 'startup_folder' | 'service' | 'scheduled_task';
  publisher: string;
  description: string;
  startupImpact: 'low' | 'medium' | 'high';
}

export interface StartupImpact {
  bootTime: number;
  impactSources: { name: string; seconds: number }[];
}

export interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'bluetooth' | 'virtual';
  status: 'connected' | 'disconnected' | 'limited';
  ipAddress: string;
  subnet: string;
  gateway: string;
  dns: string[];
  macAddress: string;
  speed: number;
  signalStrength?: number;
  ssid?: string;
}

export interface NetworkTraffic {
  downloadSpeed: number;
  uploadSpeed: number;
  totalDownload: number;
  totalUpload: number;
  activeConnections: number;
}

export interface SpeedTestResult {
  download: number;
  upload: number;
  ping: number;
  timestamp: number;
}

export interface TemperatureReading {
  timestamp: number;
  cpuTemp: number;
  gpuTemp: number;
  diskTemp: number;
}

export interface HealthCategory {
  score: number;
  maxScore: number;
  details: string[];
}

export type HealthGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export interface HealthScore {
  total: number;
  grade: HealthGrade;
  categories: {
    cpu: HealthCategory;
    memory: HealthCategory;
    disk: HealthCategory;
    gpu: HealthCategory;
    software: HealthCategory;
    updates: HealthCategory;
    alerts: HealthCategory;
  };
  recommendations: string[];
  timestamp: number;
}

export interface AppSettings {
  ai_endpoint: string;
  ai_model: string;
  ai_api_key: string;
  refresh_interval: string;
}

export interface ProcessEntry {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMB: number;
  memoryPercent: number;
  status: 'running' | 'suspended' | 'stopped';
  user: string;
  priority: string;
  startTime: string;
  threads: number;
  handles: number;
  commandLine: string;
  description: string;
  path: string;
}

export interface SystemInfo {
  os: {
    name: string;
    version: string;
    buildNumber: string;
    architecture: string;
    edition: string;
    installDate: string;
    uptime: string;
    lastBoot: string;
  };
  computer: {
    name: string;
    manufacturer: string;
    model: string;
    biosVendor: string;
    biosVersion: string;
    biosDate: string;
    serialNumber: string;
  };
  environment: {
    variables: Array<{ name: string; value: string }>;
    processorCount: number;
    logicalProcessors: number;
  };
  power: {
    powerSource: 'AC' | 'Battery';
    batteryPercent?: number;
    batteryRemaining?: string;
    batteryHealth?: string;
  };
}

export interface BenchmarkResult {
  cpu: {
    singleCore: { score: number; operations: number; ms: number };
    multiCore: { score: number; operations: number; ms: number };
    description: string;
  };
  memory: {
    readSpeed: { score: number; mbps: number };
    writeSpeed: { score: number; mbps: number };
    latency: { score: number; ns: number };
  };
  disk: {
    sequentialRead: { score: number; mbps: number };
    sequentialWrite: { score: number; mbps: number };
    randomRead: { score: number; iops: number };
    randomWrite: { score: number; iops: number };
  };
  overall: {
    score: number;
    grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    percentile: number;
  };
  timestamp: number;
}

export interface ScheduledTask {
  name: string;
  path: string;
  status: 'ready' | 'running' | 'disabled';
  triggers: string[];
  nextRun: string | null;
  lastRun: string | null;
  lastResult: 'success' | 'failure' | 'no_info';
  author: string;
  created: string;
  description: string;
  actions: string[];
}

export interface LocalUser {
  name: string;
  fullName: string;
  description: string;
  sid: string;
  enabled: boolean;
  passwordAge: number;
  lastLogon: string;
  groups: string[];
  isAdmin: boolean;
  accountType: 'administrator' | 'standard' | 'guest';
}

export interface LocalGroup {
  name: string;
  description: string;
  sid: string;
  memberCount: number;
  members: string[];
}

export interface UacSettings {
  level: number;
  levelLabel: string;
  adminApprovalMode: boolean;
  secureDesktop: boolean;
  installerDetection: boolean;
  virtualization: boolean;
}

export interface CredentialEntry {
  targetName: string;
  type: 'generic' | 'domain' | 'certificate' | 'generic_certificate';
  persistence: 'session' | 'local_machine' | 'enterprise';
  userName: string;
  lastModified: string;
  comment: string;
}
