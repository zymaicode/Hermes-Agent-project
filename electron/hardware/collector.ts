import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

const BASE_CPU_TEMP = 52;
const BASE_GPU_TEMP = 61;

export class HardwareCollector {
  private intervalId: NodeJS.Timeout | null = null;
  private snapshot: HardwareSnapshot;

  constructor() {
    this.snapshot = this.generateBaseSnapshot();
  }

  private generateBaseSnapshot(): HardwareSnapshot {
    return {
      cpu: {
        name: 'Intel Core i9-13900K',
        cores: 24,
        threads: 32,
        baseClock: 3.0,
        currentClock: 5.5,
        usage: 23,
        temp: BASE_CPU_TEMP,
        power: 95,
        voltage: 1.28,
      },
      memory: {
        total: 32,
        used: 18.4,
        available: 13.6,
        usagePercent: 57.5,
        speed: 5600,
        type: 'DDR5',
        slots: 4,
      },
      disks: [
        {
          name: 'C:',
          model: 'Samsung 990 Pro 1TB',
          type: 'NVMe SSD',
          total: 931,
          used: 512,
          free: 419,
          usagePercent: 55,
          temp: 38,
          health: 'Good',
        },
        {
          name: 'D:',
          model: 'WD Black 4TB',
          type: 'HDD',
          total: 3726,
          used: 2145,
          free: 1581,
          usagePercent: 58,
          temp: 34,
          health: 'Good',
        },
      ],
      gpu: {
        name: 'NVIDIA GeForce RTX 4090',
        vramTotal: 24,
        vramUsed: 6.8,
        usage: 18,
        temp: BASE_GPU_TEMP,
        clock: 2520,
        power: 120,
      },
      motherboard: {
        manufacturer: 'ASUS',
        model: 'ROG MAXIMUS Z790 HERO',
        bios: '1202',
        chipset: 'Z790',
      },
    };
  }

  getSnapshot(): HardwareSnapshot {
    // Simulate real-time fluctuations
    this.snapshot.cpu.usage = this.vary(this.snapshot.cpu.usage, 5, 1, 100);
    this.snapshot.cpu.currentClock = this.vary(
      this.snapshot.cpu.currentClock,
      0.3,
      3.0,
      5.8
    );
    this.snapshot.cpu.temp = this.vary(this.snapshot.cpu.temp, 3, 30, 95);
    this.snapshot.cpu.power = this.vary(this.snapshot.cpu.power, 10, 15, 253);
    this.snapshot.cpu.voltage = this.vary(
      this.snapshot.cpu.voltage,
      0.02,
      0.8,
      1.5
    );

    const memPressure = this.snapshot.cpu.usage / 100;
    this.snapshot.memory.used = this.vary(
      this.snapshot.memory.used,
      0.5,
      4,
      this.snapshot.memory.total - 0.5
    );
    this.snapshot.memory.available =
      this.snapshot.memory.total - this.snapshot.memory.used;
    this.snapshot.memory.usagePercent =
      (this.snapshot.memory.used / this.snapshot.memory.total) * 100;

    this.snapshot.disks.forEach((disk) => {
      disk.temp = this.vary(disk.temp, 1, 25, 60);
    });

    this.snapshot.gpu.usage = this.vary(this.snapshot.gpu.usage, 8, 0, 100);
    this.snapshot.gpu.temp = this.vary(this.snapshot.gpu.temp, 3, 30, 88);
    this.snapshot.gpu.clock = this.vary(this.snapshot.gpu.clock, 50, 210, 2800);
    this.snapshot.gpu.power = this.vary(this.snapshot.gpu.power, 15, 10, 450);
    this.snapshot.gpu.vramUsed = this.vary(
      this.snapshot.gpu.vramUsed,
      0.5,
      0.5,
      24
    );

    return this.snapshot;
  }

  private vary(
    value: number,
    range: number,
    min: number,
    max: number
  ): number {
    const delta = (Math.random() - 0.5) * 2 * range;
    return Math.round((Math.max(min, Math.min(max, value + delta)) + Number.EPSILON) * 100) / 100;
  }

  startPolling(callback: (snapshot: HardwareSnapshot) => void, interval = 1000): void {
    this.intervalId = setInterval(() => {
      callback(this.getSnapshot());
    }, interval);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async queryWMI(wmiClass: string, props: string[]): Promise<string[][]> {
    try {
      const propsStr = props.join(',');
      const { stdout } = await execAsync(
        `wmic ${wmiClass} get ${propsStr} /format:csv`
      );
      const lines = stdout.trim().split('\n').filter((l) => l.trim());
      if (lines.length < 2) return [];
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      return lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        return props.map((prop) => {
          const idx = headers.indexOf(prop.toLowerCase());
          return idx >= 0 ? values[idx] : '';
        });
      });
    } catch {
      return [];
    }
  }

  async getRealHardwareSnapshot(): Promise<HardwareSnapshot | null> {
    try {
      const cpuData = await this.queryWMI('cpu', [
        'name',
        'numberofcores',
        'numberoflogicalprocessors',
        'maxclockspeed',
        'loadpercentage',
      ]);
      if (cpuData.length === 0) return null;

      const cpuRow = cpuData[0];
      const memData = await this.queryWMI('os', [
        'totalvisiblememorysize',
        'freephysicalmemory',
      ]);
      const diskData = await this.queryWMI('logicaldisk', [
        'name',
        'size',
        'freespace',
        'description',
      ]);
      const gpuData = await this.queryWMI('path win32_videocontroller', [
        'name',
        'adapterram',
      ]);

      const cpu: CPUInfo = {
        name: cpuRow[0] || 'Unknown CPU',
        cores: parseInt(cpuRow[1]) || 4,
        threads: parseInt(cpuRow[2]) || 8,
        baseClock: (parseInt(cpuRow[3]) || 3000) / 1000,
        currentClock: (parseInt(cpuRow[3]) || 3000) / 1000,
        usage: parseFloat(cpuRow[4]) || 0,
        temp: 0,
        power: 0,
        voltage: 0,
      };

      let memTotal = 32;
      let memFree = 13.6;
      if (memData.length > 0) {
        const totalKB = parseInt(memData[0][0]) || 0;
        const freeKB = parseInt(memData[0][1]) || 0;
        memTotal = totalKB / (1024 * 1024);
        memFree = freeKB / (1024 * 1024);
      }

      const memory: MemoryInfo = {
        total: Math.round(memTotal * 10) / 10,
        used: Math.round((memTotal - memFree) * 10) / 10,
        available: Math.round(memFree * 10) / 10,
        usagePercent:
          memTotal > 0
            ? Math.round(((memTotal - memFree) / memTotal) * 1000) / 10
            : 0,
        speed: 0,
        type: 'DDR5',
        slots: 0,
      };

      const disks: DiskInfo[] = diskData
        .filter((row) => {
          const desc = (row[3] || '').toLowerCase();
          return (
            desc.includes('local') ||
            desc.includes('fixed') ||
            desc.includes('removable')
          );
        })
        .map((row) => {
          const sizeBytes = parseInt(row[1]) || 0;
          const freeBytes = parseInt(row[2]) || 0;
          const totalGB =
            Math.round((sizeBytes / (1024 * 1024 * 1024)) * 10) / 10;
          const freeGB =
            Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10;
          return {
            name: row[0] || '?:',
            model: row[0] || '',
            type: totalGB > 500 ? 'SSD' : 'HDD',
            total: totalGB,
            used: Math.round((totalGB - freeGB) * 10) / 10,
            free: freeGB,
            usagePercent:
              totalGB > 0
                ? Math.round(((totalGB - freeGB) / totalGB) * 1000) / 10
                : 0,
            temp: 0,
            health: 'Good',
          };
        });

      const gpuRow =
        gpuData.length > 0 ? gpuData[0] : ['Unknown GPU', '0'];
      const vramBytes = parseInt(gpuRow[1]) || 0;
      const gpu: GPUInfo = {
        name: gpuRow[0] || 'Unknown GPU',
        vramTotal: Math.round((vramBytes / (1024 * 1024 * 1024)) * 10) / 10,
        vramUsed: 0,
        usage: 0,
        temp: 0,
        clock: 0,
        power: 0,
      };

      return {
        cpu,
        memory,
        disks: disks.length > 0 ? disks : this.snapshot.disks,
        gpu,
        motherboard: this.snapshot.motherboard,
      };
    } catch {
      return null;
    }
  }

  async init(): Promise<void> {
    try {
      const realSnapshot = await this.getRealHardwareSnapshot();
      if (realSnapshot) {
        console.log('[HardwareCollector] WMI hardware detection succeeded');
        this.snapshot = realSnapshot;
      } else {
        console.log(
          '[HardwareCollector] WMI not available, using simulated data'
        );
      }
    } catch {
      console.log(
        '[HardwareCollector] WMI not available, using simulated data'
      );
    }
  }
}
