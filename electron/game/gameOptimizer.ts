import { OPTIMIZATION_SERVICES, OPTIMIZATION_PROCESSES } from './gameDetector';

export interface OptimizationSnapshot {
  suspendedServices: string[];
  terminatedProcesses: string[];
  originalPowerPlan: string;
  optimizedAt: number;
}

let activeOptimization: OptimizationSnapshot | null = null;

export function getActiveOptimization(): OptimizationSnapshot | null {
  return activeOptimization;
}

export async function optimizeForGaming(): Promise<OptimizationSnapshot> {
  const snapshot: OptimizationSnapshot = {
    suspendedServices: [],
    terminatedProcesses: [],
    originalPowerPlan: 'balanced',
    optimizedAt: Date.now(),
  };

  // 1. Save current power plan
  try {
    const { execSync } = require('child_process');
    const powerPlan = execSync('powercfg /getactivescheme 2>&1', { timeout: 5000 }).toString().trim();
    snapshot.originalPowerPlan = powerPlan;

    // Set high performance
    try {
      execSync('powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c 2>&1', { timeout: 5000 });
    } catch {
      // powercfg may not be available on non-Windows
    }
  } catch {
    // powercfg may not be available on non-Windows
  }

  // 2. Record non-essential services for suspension
  for (const svc of OPTIMIZATION_SERVICES) {
    snapshot.suspendedServices.push(svc.name);
  }

  // 3. Record optimization processes
  snapshot.terminatedProcesses = [...OPTIMIZATION_PROCESSES];

  activeOptimization = snapshot;
  return snapshot;
}

export async function restoreAfterGaming(): Promise<void> {
  if (!activeOptimization) return;

  try {
    // Restore power plan
    if (activeOptimization.originalPowerPlan !== 'balanced') {
      const { execSync } = require('child_process');
      try {
        execSync(`powercfg /setactive ${activeOptimization.originalPowerPlan} 2>&1`, { timeout: 5000 });
      } catch {
        // powercfg may not be available on non-Windows
      }
    }
  } catch {
    // powercfg may not be available on non-Windows
  }

  activeOptimization = null;
}
