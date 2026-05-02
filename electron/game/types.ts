export type OptimizationStatus = 'idle' | 'optimizing' | 'optimized' | 'restoring' | 'restored';

export interface OptimizationConfig {
  autoOptimize: boolean;
  suspendServices: boolean;
  terminateProcesses: boolean;
  setPowerPlan: boolean;
  excludedProcesses: string[];
}
