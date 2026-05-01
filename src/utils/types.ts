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

export type NavPage = 'dashboard' | 'hardware' | 'software' | 'apps' | 'ai' | 'settings';

export interface AppSettings {
  ai_endpoint: string;
  ai_model: string;
  ai_api_key: string;
  refresh_interval: string;
}
