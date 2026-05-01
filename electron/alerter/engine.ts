import { EventEmitter } from 'events';

export interface Alert {
  id: string;
  type: 'local_rule' | 'ai_analysis';
  severity: 'info' | 'warning' | 'critical';
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

export interface HardwareSnapshot {
  cpu: { name: string; cores: number; threads: number; baseClock: number; currentClock: number; usage: number; temp: number; power: number; voltage: number };
  memory: { total: number; used: number; available: number; usagePercent: number; speed: number; type: string; slots: number };
  disks: Array<{ name: string; model: string; type: string; total: number; used: number; free: number; usagePercent: number; temp: number; health: string }>;
  gpu: { name: string; vramTotal: number; vramUsed: number; usage: number; temp: number; clock: number; power: number };
  motherboard: { manufacturer: string; model: string; bios: string; chipset: string };
}

interface Threshold {
  warning: number;
  critical: number;
}

interface ActiveAlert {
  alert: Alert;
  metricKey: string;
  snoozedUntil: number;
}

export class AlertEngine extends EventEmitter {
  private activeAlerts: Map<string, ActiveAlert> = new Map();
  private alertHistory: Alert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastAiAnalysis = 0;
  private aiAnalysisInterval = 5 * 60 * 1000; // 5 minutes

  private thresholds: Record<string, Threshold> = {
    cpuTemp: { warning: 75, critical: 85 },
    gpuTemp: { warning: 80, critical: 88 },
    memoryUsage: { warning: 80, critical: 90 },
    diskUsage: { warning: 85, critical: 95 },
    cpuUsage: { warning: 90, critical: 98 },
    gpuUsage: { warning: 90, critical: 98 },
  };

  private static idCounter = 0;

  private generateId(): string {
    AlertEngine.idCounter += 1;
    return `alert_${Date.now()}_${AlertEngine.idCounter}`;
  }

  checkLocalRules(snapshot: HardwareSnapshot): Alert[] {
    const newAlerts: Alert[] = [];
    const checks: Array<{
      metricKey: string;
      value: number;
      threshold: number;
      label: string;
      unit: string;
      detailSuffix: string;
    }> = [];

    // CPU temp
    checks.push({
      metricKey: 'cpu.temp',
      value: snapshot.cpu.temp,
      threshold: snapshot.cpu.temp >= this.thresholds.cpuTemp.critical ? this.thresholds.cpuTemp.critical : this.thresholds.cpuTemp.warning,
      label: 'CPU Temperature',
      unit: '°C',
      detailSuffix: 'Prolonged high temperatures may cause thermal throttling or hardware damage.',
    });

    // GPU temp
    checks.push({
      metricKey: 'gpu.temp',
      value: snapshot.gpu.temp,
      threshold: snapshot.gpu.temp >= this.thresholds.gpuTemp.critical ? this.thresholds.gpuTemp.critical : this.thresholds.gpuTemp.warning,
      label: 'GPU Temperature',
      unit: '°C',
      detailSuffix: 'Ensure proper ventilation and check fan operation.',
    });

    // Memory usage
    checks.push({
      metricKey: 'memory.usage',
      value: snapshot.memory.usagePercent,
      threshold: snapshot.memory.usagePercent >= this.thresholds.memoryUsage.critical ? this.thresholds.memoryUsage.critical : this.thresholds.memoryUsage.warning,
      label: 'Memory Usage',
      unit: '%',
      detailSuffix: 'Consider closing unused applications or upgrading RAM.',
    });

    // Disk usage (worst disk)
    let maxDiskUsage = 0;
    let maxDiskName = '';
    for (const disk of snapshot.disks) {
      if (disk.usagePercent > maxDiskUsage) {
        maxDiskUsage = disk.usagePercent;
        maxDiskName = disk.name;
      }
    }
    checks.push({
      metricKey: 'disk.usage',
      value: maxDiskUsage,
      threshold: maxDiskUsage >= this.thresholds.diskUsage.critical ? this.thresholds.diskUsage.critical : this.thresholds.diskUsage.warning,
      label: `Disk Usage (${maxDiskName})`,
      unit: '%',
      detailSuffix: 'Free up disk space to avoid performance degradation.',
    });

    // CPU usage
    checks.push({
      metricKey: 'cpu.usage',
      value: snapshot.cpu.usage,
      threshold: snapshot.cpu.usage >= this.thresholds.cpuUsage.critical ? this.thresholds.cpuUsage.critical : this.thresholds.cpuUsage.warning,
      label: 'CPU Usage',
      unit: '%',
      detailSuffix: 'High CPU usage may indicate a runaway process or insufficient cooling.',
    });

    // GPU usage
    checks.push({
      metricKey: 'gpu.usage',
      value: snapshot.gpu.usage,
      threshold: snapshot.gpu.usage >= this.thresholds.gpuUsage.critical ? this.thresholds.gpuUsage.critical : this.thresholds.gpuUsage.warning,
      label: 'GPU Usage',
      unit: '%',
      detailSuffix: 'Sustained high GPU usage may affect system responsiveness.',
    });

    for (const check of checks) {
      const isAboveCritical = check.value >= (this.thresholds[this.metricKeyToThresholdKey(check.metricKey)]?.critical ?? 100);
      const isAboveWarning = check.value >= (this.thresholds[this.metricKeyToThresholdKey(check.metricKey)]?.warning ?? 100);

      if (!isAboveWarning) {
        // Auto-resolve: metric returned to normal
        this.resolveByMetric(check.metricKey);
        continue;
      }

      if (!isAboveWarning) continue;

      // Check if alert for this metric is already active
      const existingEntry = this.findByMetric(check.metricKey);
      if (existingEntry) {
        if (existingEntry.snoozedUntil > Date.now()) continue;
        // Update existing alert value
        existingEntry.alert.currentValue = check.value;
        continue;
      }

      const severity: Alert['severity'] = isAboveCritical ? 'critical' : 'warning';
      const id = this.generateId();
      const alert: Alert = {
        id,
        type: 'local_rule',
        severity,
        title: `${check.label} ${severity === 'critical' ? 'Critical' : 'Warning'}`,
        message: `${check.label} is at ${check.value.toFixed(1)}${check.unit} (threshold: ${check.threshold}${check.unit})`,
        detail: `${check.detailSuffix} Current value: ${check.value.toFixed(1)}${check.unit}. Threshold: ${check.threshold}${check.unit}.`,
        timestamp: Date.now(),
        dismissed: false,
        autoResolve: true,
        sourceMetric: check.metricKey,
        currentValue: check.value,
        threshold: check.threshold,
      };

      this.activeAlerts.set(id, { alert, metricKey: check.metricKey, snoozedUntil: 0 });
      this.alertHistory.push(alert);
      newAlerts.push(alert);
      this.emit('alert', alert);
    }

    return newAlerts;
  }

  private metricKeyToThresholdKey(metricKey: string): string {
    const map: Record<string, string> = {
      'cpu.temp': 'cpuTemp',
      'gpu.temp': 'gpuTemp',
      'memory.usage': 'memoryUsage',
      'disk.usage': 'diskUsage',
      'cpu.usage': 'cpuUsage',
      'gpu.usage': 'gpuUsage',
    };
    return map[metricKey] || '';
  }

  private findByMetric(metricKey: string): ActiveAlert | undefined {
    for (const entry of this.activeAlerts.values()) {
      if (entry.metricKey === metricKey) return entry;
    }
    return undefined;
  }

  private resolveByMetric(metricKey: string): void {
    for (const [id, entry] of this.activeAlerts) {
      if (entry.metricKey === metricKey && entry.alert.autoResolve) {
        this.activeAlerts.delete(id);
        this.emit('resolved', entry.alert.id);
      }
    }
  }

  async analyzeWithAI(snapshot: HardwareSnapshot, apiKey: string, endpoint: string, model: string): Promise<Alert | null> {
    if (!apiKey) return null;

    const hw = snapshot;
    const prompt = `Analyze the following hardware metrics and identify any potential issues or warnings:

CPU: ${hw.cpu.name}
  - Usage: ${hw.cpu.usage.toFixed(1)}%
  - Temperature: ${hw.cpu.temp.toFixed(1)}°C
  - Clock: ${hw.cpu.currentClock.toFixed(1)} GHz
  - Power: ${hw.cpu.power.toFixed(1)}W

Memory:
  - Total: ${hw.memory.total.toFixed(1)} GB
  - Used: ${hw.memory.used.toFixed(1)} GB (${hw.memory.usagePercent.toFixed(1)}%)
  - Available: ${hw.memory.available.toFixed(1)} GB

GPU: ${hw.gpu.name}
  - Usage: ${hw.gpu.usage.toFixed(1)}%
  - Temperature: ${hw.gpu.temp.toFixed(1)}°C
  - VRAM: ${hw.gpu.vramUsed.toFixed(1)} / ${hw.gpu.vramTotal.toFixed(1)} GB
  - Power: ${hw.gpu.power.toFixed(1)}W

Disks:
${hw.disks.map(d => `  ${d.name} (${d.model}): ${d.used.toFixed(1)}/${d.total.toFixed(1)} GB (${d.usagePercent.toFixed(1)}%) - ${d.temp.toFixed(1)}°C - Health: ${d.health}`).join('\n')}

Respond in this exact JSON format with no other text:
{"hasIssue": true|false, "severity": "info"|"warning"|"critical", "title": "short title", "message": "concise message", "detail": "detailed analysis and recommendations"}`;

    try {
      const url = `${endpoint}/v1/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 512,
          temperature: 0.3,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
      };
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]) as {
        hasIssue: boolean;
        severity?: 'info' | 'warning' | 'critical';
        title?: string;
        message?: string;
        detail?: string;
      };

      if (!parsed.hasIssue) return null;

      const id = this.generateId();
      const alert: Alert = {
        id,
        type: 'ai_analysis',
        severity: parsed.severity || 'info',
        title: parsed.title || 'AI System Analysis',
        message: parsed.message || 'AI analysis detected potential issues.',
        detail: parsed.detail || content,
        timestamp: Date.now(),
        dismissed: false,
        autoResolve: false,
      };

      this.activeAlerts.set(id, { alert, metricKey: `ai_${id}`, snoozedUntil: 0 });
      this.alertHistory.push(alert);
      this.emit('alert', alert);
      return alert;
    } catch {
      return null;
    }
  }

  shouldRunAiAnalysis(): boolean {
    return Date.now() - this.lastAiAnalysis >= this.aiAnalysisInterval;
  }

  markAiAnalysisRun(): void {
    this.lastAiAnalysis = Date.now();
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter((entry) => entry.snoozedUntil <= Date.now())
      .map((entry) => entry.alert);
  }

  getAlertHistory(): Alert[] {
    return this.alertHistory;
  }

  dismissAlert(id: string): void {
    const entry = this.activeAlerts.get(id);
    if (entry) {
      entry.alert.dismissed = true;
      this.activeAlerts.delete(id);
      this.emit('dismissed', id);
    }
  }

  snoozeAlert(id: string, minutes: number): void {
    const entry = this.activeAlerts.get(id);
    if (entry) {
      entry.snoozedUntil = Date.now() + minutes * 60 * 1000;
      this.emit('snoozed', { id, until: entry.snoozedUntil });
    }
  }

  dismissAll(): void {
    for (const [id, entry] of this.activeAlerts) {
      entry.alert.dismissed = true;
    }
    this.activeAlerts.clear();
    this.emit('dismissedAll');
  }

  getActiveAlertCount(): number {
    return this.getActiveAlerts().length;
  }

  getCriticalAlertCount(): number {
    return this.getActiveAlerts().filter((a) => a.severity === 'critical').length;
  }

  startMonitoring(intervalMs: number): void {
    this.stopMonitoring();
    this.monitoringInterval = setInterval(() => {
      this.emit('tick');
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}
