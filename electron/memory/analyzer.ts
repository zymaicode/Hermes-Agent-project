export interface MemoryModule {
  slot: string;
  type: string;
  sizeGB: number;
  speed: number;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
  voltage: number;
  rank: 'Single' | 'Dual' | 'Quad';
  formFactor: 'DIMM' | 'SO-DIMM';
  isActive: boolean;
}

export interface MemoryAllocation {
  category: string;
  sizeMB: number;
  percentage: number;
  description: string;
  color: string;
}

export interface MemoryTiming {
  casLatency: number;
  tRCD: number;
  tRP: number;
  tRAS: number;
  commandRate: number;
}

export interface MemoryHealth {
  totalSlots: number;
  usedSlots: number;
  totalGB: number;
  maxCapacity: number;
  isDualChannel: boolean;
  isQuadChannel: boolean;
  xmpProfile: string | null;
  speedMismatch: boolean;
  healthScore: number;
  errors: string[];
}

export interface PageFileInfo {
  path: string;
  initialMB: number;
  maximumMB: number;
  currentMB: number;
  isManaged: boolean;
}

export class MemoryAnalyzer {
  getModules(): MemoryModule[] {
    return [
      {
        slot: 'DIMM_A1',
        type: 'DDR5',
        sizeGB: 16,
        speed: 6000,
        manufacturer: 'Samsung',
        partNumber: 'M323R2GA3BB0-CQK',
        serialNumber: 'S5M3XK2R91',
        voltage: 1.1,
        rank: 'Dual',
        formFactor: 'DIMM',
        isActive: true,
      },
      {
        slot: 'DIMM_A2',
        type: 'DDR5',
        sizeGB: 16,
        speed: 6000,
        manufacturer: 'Samsung',
        partNumber: 'M323R2GA3BB0-CQK',
        serialNumber: 'S5M3XK2R92',
        voltage: 1.1,
        rank: 'Dual',
        formFactor: 'DIMM',
        isActive: true,
      },
      {
        slot: 'DIMM_B1',
        type: 'DDR5',
        sizeGB: 16,
        speed: 6000,
        manufacturer: 'Samsung',
        partNumber: 'M323R2GA3BB0-CQK',
        serialNumber: 'S5M3XK2R93',
        voltage: 1.1,
        rank: 'Dual',
        formFactor: 'DIMM',
        isActive: true,
      },
      {
        slot: 'DIMM_B2',
        type: 'DDR5',
        sizeGB: 16,
        speed: 6000,
        manufacturer: 'Samsung',
        partNumber: 'M323R2GA3BB0-CQK',
        serialNumber: 'S5M3XK2R94',
        voltage: 1.1,
        rank: 'Dual',
        formFactor: 'DIMM',
        isActive: true,
      },
    ];
  }

  getAllocation(): MemoryAllocation[] {
    return [
      {
        category: 'Applications',
        sizeMB: 12288,
        percentage: 30,
        description: 'Memory actively used by running applications and processes',
        color: '#3fb950',
      },
      {
        category: 'Cache',
        sizeMB: 4096,
        percentage: 10,
        description: 'System file cache - recently accessed disk data kept in memory',
        color: '#58a6ff',
      },
      {
        category: 'Standby',
        sizeMB: 8192,
        percentage: 20,
        description: 'Cached data that can be reclaimed when needed',
        color: '#a371f7',
      },
      {
        category: 'Modified',
        sizeMB: 1024,
        percentage: 2.5,
        description: 'Modified pages waiting to be written to disk',
        color: '#d29922',
      },
      {
        category: 'Free',
        sizeMB: 14336,
        percentage: 35,
        description: 'Completely unused memory available for allocation',
        color: '#8b949e',
      },
      {
        category: 'Hardware Reserved',
        sizeMB: 1024,
        percentage: 2.5,
        description: 'Memory reserved for hardware devices and BIOS',
        color: '#f85149',
      },
    ];
  }

  getTimings(): MemoryTiming {
    return {
      casLatency: 30,
      tRCD: 38,
      tRP: 38,
      tRAS: 76,
      commandRate: 2,
    };
  }

  getHealth(): MemoryHealth {
    return {
      totalSlots: 4,
      usedSlots: 4,
      totalGB: 64,
      maxCapacity: 128,
      isDualChannel: true,
      isQuadChannel: false,
      xmpProfile: 'XMP 3.0 - DDR5-6000 CL30-38-38-76 1.1V',
      speedMismatch: false,
      healthScore: 100,
      errors: [],
    };
  }

  getPageFile(): PageFileInfo {
    return {
      path: 'C:\\pagefile.sys',
      initialMB: 4096,
      maximumMB: 16384,
      currentMB: 6144,
      isManaged: true,
    };
  }
}
