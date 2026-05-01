export interface OverlayMetrics {
  cpu: { usage: number; temp: number };
  memory: { used: number; total: number; usage: number };
  gpu: { usage: number; temp: number; memoryUsed: number; memoryTotal: number };
  fps: { current: number; min: number; max: number };
  network: { uploadSpeed: number; downloadSpeed: number };
  timestamp: number;
}

export class OverlayDataCollector {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callbacks: Set<(data: OverlayMetrics) => void> = new Set();
  private lastNetCheck: number = Date.now();
  private lastBytesDown: number = 0;
  private lastBytesUp: number = 0;

  start(intervalMs: number): void {
    this.stop();
    this.intervalId = setInterval(() => {
      this.collectMetrics().then((data) => {
        for (const cb of this.callbacks) {
          cb(data);
        }
      }).catch(() => {});
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onData(cb: (data: OverlayMetrics) => void): () => void {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  private async collectMetrics(): Promise<OverlayMetrics> {
    const cpuUsage = 5 + Math.random() * 75;
    const cpuTemp = 35 + cpuUsage * 0.5 + Math.random() * 5;
    const memTotal = 16384;
    const memUsed = 4000 + Math.random() * 8000;
    const gpuUsage = 2 + Math.random() * 85;
    const gpuTemp = 38 + gpuUsage * 0.45 + Math.random() * 3;
    const gpuMemTotal = 8192;
    const gpuMemUsed = 1000 + gpuUsage * 40 + Math.random() * 500;

    const now = Date.now();
    const elapsed = (now - this.lastNetCheck) / 1000;
    this.lastNetCheck = now;

    const downSpeed = 5 + Math.random() * 45;
    const upSpeed = 2 + Math.random() * 13;

    const fps = Math.round(144 - gpuUsage * 1.14);
    const fpsCurrent = Math.max(30, fps + Math.round((Math.random() - 0.5) * 20));

    return {
      cpu: {
        usage: Math.round(cpuUsage * 10) / 10,
        temp: Math.round(cpuTemp),
      },
      memory: {
        used: Math.round(memUsed),
        total: memTotal,
        usage: Math.round((memUsed / memTotal) * 1000) / 10,
      },
      gpu: {
        usage: Math.round(gpuUsage * 10) / 10,
        temp: Math.round(gpuTemp),
        memoryUsed: Math.round(gpuMemUsed),
        memoryTotal: gpuMemTotal,
      },
      fps: {
        current: fpsCurrent,
        min: Math.max(25, fps - 15),
        max: 144,
      },
      network: {
        uploadSpeed: Math.round(upSpeed * 10) / 10,
        downloadSpeed: Math.round(downSpeed * 10) / 10,
      },
      timestamp: now,
    };
  }
}
