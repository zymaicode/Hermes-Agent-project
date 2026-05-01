export interface HealthCategory {
  score: number;
  maxScore: number;
  details: string[];
}

export interface HealthScore {
  total: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
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

export interface HealthScoreParams {
  cpu: { usage: number; temp: number; currentClock: number; baseClock: number };
  memory: { usagePercent: number };
  disks: Array<{ usagePercent: number; temp: number }>;
  gpu: { temp: number; usage: number };
  outdatedApps: number;
  highSeverityConflicts: number;
  criticalUpdates: number;
  normalUpdates: number;
  activeCriticalAlerts: number;
  activeWarningAlerts: number;
}

function scoreCpu(
  cpu: HealthScoreParams['cpu']
): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  // Temp scoring
  if (cpu.temp >= 85) {
    penalty += 15;
    details.push(`CPU temp ${cpu.temp}°C — critically high (-15)`);
  } else if (cpu.temp >= 75) {
    penalty += 10;
    details.push(`CPU temp ${cpu.temp}°C — high (-10)`);
  } else if (cpu.temp >= 60) {
    penalty += 5;
    details.push(`CPU temp ${cpu.temp}°C — elevated (-5)`);
  } else {
    details.push(`CPU temp ${cpu.temp}°C — normal`);
  }

  // Usage scoring
  if (cpu.usage >= 90) {
    penalty += 10;
    details.push(`CPU usage ${cpu.usage.toFixed(1)}% — critical (-10)`);
  } else if (cpu.usage >= 80) {
    penalty += 5;
    details.push(`CPU usage ${cpu.usage.toFixed(1)}% — high (-5)`);
  } else if (cpu.usage >= 60) {
    penalty += 2;
    details.push(`CPU usage ${cpu.usage.toFixed(1)}% — elevated (-2)`);
  } else {
    details.push(`CPU usage ${cpu.usage.toFixed(1)}% — normal`);
  }

  // Clock speed scoring
  const clockRatio = cpu.baseClock > 0 ? cpu.currentClock / cpu.baseClock : 1;
  if (clockRatio < 0.7) {
    penalty += 2;
    details.push(`CPU clock ${cpu.currentClock}GHz below base ${cpu.baseClock}GHz (-2)`);
  } else {
    details.push(`CPU clock ${cpu.currentClock}GHz — near max`);
  }

  const score = Math.max(0, 20 - penalty);
  return { score, details };
}

function scoreMemory(usagePercent: number): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  if (usagePercent >= 95) {
    penalty = 10;
    details.push(`Memory usage ${usagePercent.toFixed(1)}% — critical (-10)`);
  } else if (usagePercent >= 85) {
    penalty = 5;
    details.push(`Memory usage ${usagePercent.toFixed(1)}% — high (-5)`);
  } else if (usagePercent >= 75) {
    penalty = 3;
    details.push(`Memory usage ${usagePercent.toFixed(1)}% — elevated (-3)`);
  } else {
    details.push(`Memory usage ${usagePercent.toFixed(1)}% — normal`);
  }

  const score = Math.max(0, 15 - penalty);
  return { score, details };
}

function scoreDisk(
  disks: Array<{ usagePercent: number; temp: number }>
): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  const primaryDisk = disks[0];
  if (primaryDisk) {
    // Usage scoring
    if (primaryDisk.usagePercent >= 95) {
      penalty += 10;
      details.push(`Disk usage ${primaryDisk.usagePercent}% — critical (-10)`);
    } else if (primaryDisk.usagePercent >= 85) {
      penalty += 5;
      details.push(`Disk usage ${primaryDisk.usagePercent}% — high (-5)`);
    } else if (primaryDisk.usagePercent >= 70) {
      penalty += 2;
      details.push(`Disk usage ${primaryDisk.usagePercent}% — elevated (-2)`);
    } else {
      details.push(`Disk usage ${primaryDisk.usagePercent}% — normal`);
    }

    // Temp scoring
    if (primaryDisk.temp >= 50) {
      penalty += 5;
      details.push(`Disk temp ${primaryDisk.temp}°C — high (-5)`);
    } else if (primaryDisk.temp >= 40) {
      penalty += 2;
      details.push(`Disk temp ${primaryDisk.temp}°C — elevated (-2)`);
    } else {
      details.push(`Disk temp ${primaryDisk.temp}°C — normal`);
    }
  } else {
    details.push('No disk data available');
  }

  const score = Math.max(0, 20 - penalty);
  return { score, details };
}

function scoreGpu(
  gpu: HealthScoreParams['gpu']
): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  // Temp scoring
  if (gpu.temp >= 85) {
    penalty += 10;
    details.push(`GPU temp ${gpu.temp}°C — critical (-10)`);
  } else if (gpu.temp >= 80) {
    penalty += 7;
    details.push(`GPU temp ${gpu.temp}°C — high (-7)`);
  } else if (gpu.temp >= 70) {
    penalty += 5;
    details.push(`GPU temp ${gpu.temp}°C — elevated (-5)`);
  } else {
    details.push(`GPU temp ${gpu.temp}°C — normal`);
  }

  // Usage scoring
  if (gpu.usage >= 90) {
    penalty += 5;
    details.push(`GPU usage ${gpu.usage.toFixed(1)}% — high (-5)`);
  } else if (gpu.usage >= 80) {
    penalty += 2;
    details.push(`GPU usage ${gpu.usage.toFixed(1)}% — elevated (-2)`);
  } else {
    details.push(`GPU usage ${gpu.usage.toFixed(1)}% — normal`);
  }

  const score = Math.max(0, 15 - penalty);
  return { score, details };
}

function scoreSoftware(params: HealthScoreParams): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  if (params.outdatedApps > 0) {
    penalty += Math.min(params.outdatedApps, 5);
    details.push(`Outdated apps: ${params.outdatedApps} (-${Math.min(params.outdatedApps, 5)})`);
  } else {
    details.push('All apps up to date');
  }

  if (params.highSeverityConflicts > 0) {
    const conflictPenalty = Math.min(params.highSeverityConflicts * 3, 5);
    penalty += conflictPenalty;
    details.push(`High-severity conflicts: ${params.highSeverityConflicts} (-${conflictPenalty})`);
  }

  const score = Math.max(0, 10 - penalty);
  return { score, details };
}

function scoreUpdates(params: HealthScoreParams): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  if (params.criticalUpdates > 0) {
    penalty += Math.min(params.criticalUpdates * 5, 10);
    details.push(`Critical updates pending: ${params.criticalUpdates} (-${Math.min(params.criticalUpdates * 5, 10)})`);
  }

  if (params.normalUpdates > 0) {
    const normalPenalty = Math.min(params.normalUpdates * 1, 5);
    penalty += normalPenalty;
    details.push(`Normal updates pending: ${params.normalUpdates} (-${normalPenalty})`);
  }

  if (penalty === 0) {
    details.push('All software up to date');
  }

  const score = Math.max(0, 10 - penalty);
  return { score, details };
}

function scoreAlerts(params: HealthScoreParams): { score: number; details: string[] } {
  const details: string[] = [];
  let penalty = 0;

  if (params.activeCriticalAlerts > 0) {
    penalty += Math.min(params.activeCriticalAlerts * 3, 10);
    details.push(`Critical alerts: ${params.activeCriticalAlerts} (-${Math.min(params.activeCriticalAlerts * 3, 10)})`);
  }

  if (params.activeWarningAlerts > 0) {
    const warnPenalty = Math.min(params.activeWarningAlerts * 1, 5);
    penalty += warnPenalty;
    details.push(`Warning alerts: ${params.activeWarningAlerts} (-${warnPenalty})`);
  }

  if (penalty === 0) {
    details.push('No active alerts');
  }

  const score = Math.max(0, 10 - penalty);
  return { score, details };
}

function getGrade(total: number): HealthScore['grade'] {
  if (total >= 90) return 'Excellent';
  if (total >= 75) return 'Good';
  if (total >= 55) return 'Fair';
  if (total >= 35) return 'Poor';
  return 'Critical';
}

function generateRecommendations(
  categories: HealthScore['categories']
): string[] {
  const recs: string[] = [];

  if (categories.cpu.score < 12) {
    recs.push('CPU health is poor — check cooling, reduce load, or consider an upgrade.');
  }
  if (categories.memory.score < 9) {
    recs.push('Memory usage is high — close unused applications or consider adding RAM.');
  }
  if (categories.disk.score < 12) {
    recs.push('Disk health is degraded — free up space and check drive temperature.');
  }
  if (categories.gpu.score < 9) {
    recs.push('GPU is under stress — verify cooling and reduce graphics load.');
  }
  if (categories.software.score < 6) {
    recs.push('Several apps are outdated — update them to improve stability and security.');
  }
  if (categories.updates.score < 6) {
    recs.push('Pending updates need attention — install critical updates as soon as possible.');
  }
  if (categories.alerts.score < 6) {
    recs.push('Active alerts require attention — review and resolve them in the Alerts panel.');
  }

  if (recs.length === 0) {
    recs.push('System is in good health. Keep up with regular maintenance.');
  }

  return recs;
}

export function calculateHealthScore(params: HealthScoreParams): HealthScore {
  const cpuResult = scoreCpu(params.cpu);
  const memoryResult = scoreMemory(params.memory.usagePercent);
  const diskResult = scoreDisk(params.disks);
  const gpuResult = scoreGpu(params.gpu);
  const softwareResult = scoreSoftware(params);
  const updatesResult = scoreUpdates(params);
  const alertsResult = scoreAlerts(params);

  const categories = {
    cpu: { score: cpuResult.score, maxScore: 20, details: cpuResult.details },
    memory: { score: memoryResult.score, maxScore: 15, details: memoryResult.details },
    disk: { score: diskResult.score, maxScore: 20, details: diskResult.details },
    gpu: { score: gpuResult.score, maxScore: 15, details: gpuResult.details },
    software: { score: softwareResult.score, maxScore: 10, details: softwareResult.details },
    updates: { score: updatesResult.score, maxScore: 10, details: updatesResult.details },
    alerts: { score: alertsResult.score, maxScore: 10, details: alertsResult.details },
  };

  const total = Math.max(0, Math.min(100,
    categories.cpu.score +
    categories.memory.score +
    categories.disk.score +
    categories.gpu.score +
    categories.software.score +
    categories.updates.score +
    categories.alerts.score
  ));

  const grade = getGrade(total);
  const recommendations = generateRecommendations(categories);

  return {
    total,
    grade,
    categories,
    recommendations,
    timestamp: Date.now(),
  };
}

export class HealthScorer {
  calculateScore(params: HealthScoreParams): HealthScore {
    return calculateHealthScore(params);
  }
}
