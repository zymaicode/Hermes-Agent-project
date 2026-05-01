export interface BatteryStatus {
  acConnected: boolean;
  chargePercent: number;
  chargeRate: number;
  dischargeRate: number;
  voltage: number;
  capacity: {
    design: number;
    fullCharge: number;
    current: number;
    wearLevel: number;
  };
  estimatedRemaining: string;
  estimatedFullCharge: string | null;
  cycleCount: number;
  temperature: number;
  chemistry: string;
  manufacturer: string;
  serialNumber: string;
  manufactureDate: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BatteryHistoryPoint {
  timestamp: number;
  chargePercent: number;
  capacity: number;
  dischargeRate: number;
}

const NOW = Date.now();

function generateHistory(hours: number): BatteryHistoryPoint[] {
  const points: BatteryHistoryPoint[] = [];
  const intervalMs = (hours * 3600000) / (hours * 2); // 2 points per hour
  const designCapacity = 50000;
  const fullCharge = 44200;

  for (let i = hours * 2; i >= 0; i--) {
    const t = NOW - i * 1800000; // 30 min intervals
    // Simulate a discharge/charge cycle over 12 hours
    const cycleProgress = (i % 48) / 48; // 0-1 over 24 hours
    let charge: number;
    if (cycleProgress < 0.35) {
      // AC charging
      charge = 20 + (cycleProgress / 0.35) * 80; // 20% -> 100%
    } else if (cycleProgress < 0.4) {
      // Fully charged plateau
      charge = 98 + Math.random() * 2;
    } else {
      // Discharging on battery
      const dischargeProgress = (cycleProgress - 0.4) / 0.6;
      charge = 100 - dischargeProgress * 70 - Math.random() * 5; // 100% -> ~25%
    }
    charge = Math.max(10, Math.min(100, charge));

    const capacity = fullCharge - Math.random() * 200;
    const dischargeRate = 8000 + Math.random() * 12000; // mW

    points.push({
      timestamp: t,
      chargePercent: Math.round(charge * 10) / 10,
      capacity: Math.round(capacity),
      dischargeRate: Math.round(dischargeRate),
    });
  }

  return points;
}

const HISTORY = generateHistory(12);

export class BatteryReporter {
  getBatteryStatus(): BatteryStatus {
    const designCapacity = 50000;
    const fullCharge = 44200;
    const current = 34600;
    const wearLevel = Math.round(((designCapacity - fullCharge) / designCapacity) * 100);

    return {
      acConnected: true,
      chargePercent: 78,
      chargeRate: 45000,
      dischargeRate: 0,
      voltage: 11800,
      capacity: {
        design: designCapacity,
        fullCharge: fullCharge,
        current: current,
        wearLevel: wearLevel,
      },
      estimatedRemaining: '2h 34m',
      estimatedFullCharge: '1h 18m',
      cycleCount: 68,
      temperature: 31,
      chemistry: 'Li-Po',
      manufacturer: 'Dell',
      serialNumber: 'DELL-1234-5678-ABCD',
      manufactureDate: '2024-06-15',
      health: 'good',
    };
  }

  getBatteryHistory(hours?: number): BatteryHistoryPoint[] {
    const h = hours ?? 12;
    const cutoff = NOW - h * 3600000;
    return HISTORY.filter((p) => p.timestamp >= cutoff);
  }

  getBatteryReport(): { design: number; actual: number; wear: number; cycles: number; estimatedLife: number } {
    return {
      design: 50000,
      actual: 44200,
      wear: 12,
      cycles: 68,
      estimatedLife: 85, // estimated % of original life remaining
    };
  }
}
