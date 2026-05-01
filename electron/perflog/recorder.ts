export interface PerfLogEntry {
  timestamp: number;
  cpu: { usage: number; temp: number; clock: number };
  memory: { used: number; available: number; percent: number };
  disk: { readMbps: number; writeMbps: number; activeTime: number };
  gpu: { usage: number; temp: number; vramUsed: number };
  network: { download: number; upload: number };
}

export interface PerfLogSession {
  id: string;
  name: string;
  startTime: number;
  endTime: number | null;
  duration: string;
  entries: number;
  status: 'recording' | 'completed' | 'stopped';
  summary: {
    avgCpu: number;
    maxCpu: number;
    avgMem: number;
    maxMem: number;
    avgDiskRead: number;
    avgDiskWrite: number;
    avgGpu: number;
    maxGpu: number;
    avgNetDownload: number;
    avgNetUpload: number;
    maxTemp: number;
  };
}

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function generateEntry(t: number): PerfLogEntry {
  return {
    timestamp: t,
    cpu: { usage: rand(5, 95), temp: rand(35, 85), clock: rand(2.5, 4.8) },
    memory: { used: rand(8, 14), available: rand(2, 8), percent: rand(40, 80) },
    disk: { readMbps: rand(0, 150), writeMbps: rand(0, 80), activeTime: rand(20, 95) },
    gpu: { usage: rand(0, 98), temp: rand(30, 78), vramUsed: rand(2, 7) },
    network: { download: rand(0, 500), upload: rand(0, 50) },
  };
}

function computeSummary(entries: PerfLogEntry[]): PerfLogSession['summary'] {
  if (entries.length === 0) {
    return { avgCpu: 0, maxCpu: 0, avgMem: 0, maxMem: 0, avgDiskRead: 0, avgDiskWrite: 0, avgGpu: 0, maxGpu: 0, avgNetDownload: 0, avgNetUpload: 0, maxTemp: 0 };
  }
  const avg = (vals: number[]) => Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  const max = (vals: number[]) => Math.max(...vals);

  const cpuUsages = entries.map((e) => e.cpu.usage);
  const memPcts = entries.map((e) => e.memory.percent);
  const diskReads = entries.map((e) => e.disk.readMbps);
  const diskWrites = entries.map((e) => e.disk.writeMbps);
  const gpuUsages = entries.map((e) => e.gpu.usage);
  const netDowns = entries.map((e) => e.network.download);
  const netUps = entries.map((e) => e.network.upload);
  const temps = entries.map((e) => Math.max(e.cpu.temp, e.gpu.temp));

  return {
    avgCpu: avg(cpuUsages),
    maxCpu: max(cpuUsages),
    avgMem: avg(memPcts),
    maxMem: max(memPcts),
    avgDiskRead: avg(diskReads),
    avgDiskWrite: avg(diskWrites),
    avgGpu: avg(gpuUsages),
    maxGpu: max(gpuUsages),
    avgNetDownload: avg(netDowns),
    avgNetUpload: avg(netUps),
    maxTemp: max(temps),
  };
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}

// Pre-populated past sessions
const NOW = Date.now();

function generateSessionEntries(startTime: number, durationMs: number, intervalMs: number): PerfLogEntry[] {
  const entries: PerfLogEntry[] = [];
  for (let t = startTime; t <= startTime + durationMs; t += intervalMs) {
    entries.push(generateEntry(t));
  }
  return entries;
}

const PAST_SESSIONS: { session: PerfLogSession; entries: PerfLogEntry[] }[] = [
  (() => {
    const start = NOW - 4 * 3600000;
    const duration = 45 * 60000;
    const entries = generateSessionEntries(start, duration, 5000);
    return {
      session: {
        id: 'sess-1',
        name: 'Gaming Session - Cyberpunk 2077',
        startTime: start,
        endTime: start + duration,
        duration: '45m 0s',
        entries: entries.length,
        status: 'completed',
        summary: computeSummary(entries),
      },
      entries,
    };
  })(),
  (() => {
    const start = NOW - 8 * 3600000;
    const duration = 12 * 60000;
    const entries = generateSessionEntries(start, duration, 5000);
    return {
      session: {
        id: 'sess-2',
        name: 'Build Benchmark',
        startTime: start,
        endTime: start + duration,
        duration: '12m 0s',
        entries: entries.length,
        status: 'completed',
        summary: computeSummary(entries),
      },
      entries,
    };
  })(),
  (() => {
    const start = NOW - 24 * 3600000;
    const duration = 60 * 60000;
    const entries = generateSessionEntries(start, duration, 5000);
    return {
      session: {
        id: 'sess-3',
        name: 'Idle Monitoring - Background',
        startTime: start,
        endTime: start + duration,
        duration: '1h 0m',
        entries: entries.length,
        status: 'stopped',
        summary: computeSummary(entries),
      },
      entries,
    };
  })(),
];

export class PerfLogRecorder {
  private sessions: PerfLogSession[] = PAST_SESSIONS.map((s) => s.session);
  private allEntries: Map<string, PerfLogEntry[]> = new Map(
    PAST_SESSIONS.map((s) => [s.session.id, s.entries])
  );
  private activeSession: PerfLogSession | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private activeEntries: PerfLogEntry[] = [];
  private recordingStart: number = 0;
  private nextId = 4;

  getSessions(): PerfLogSession[] {
    // Update active session duration
    const sessions = this.sessions.map((s) => {
      if (s.status === 'recording' && s.endTime === null) {
        const elapsed = Date.now() - this.recordingStart;
        return { ...s, duration: formatDuration(elapsed) };
      }
      return s;
    });
    return sessions;
  }

  startRecording(name: string): PerfLogSession {
    const id = `sess-${this.nextId++}`;
    this.recordingStart = Date.now();
    this.activeEntries = [];

    const session: PerfLogSession = {
      id,
      name,
      startTime: this.recordingStart,
      endTime: null,
      duration: '0s',
      entries: 0,
      status: 'recording',
      summary: computeSummary([]),
    };

    this.activeSession = session;
    this.sessions.unshift(session);

    // Record first entry immediately
    this.activeEntries.push(generateEntry(this.recordingStart));

    // Record every 5 seconds
    this.interval = setInterval(() => {
      if (!this.activeSession) return;
      const t = Date.now();
      this.activeEntries.push(generateEntry(t));
      this.activeSession = {
        ...this.activeSession,
        entries: this.activeEntries.length,
        duration: formatDuration(t - this.recordingStart),
      };
      // Patch in sessions list
      const idx = this.sessions.findIndex((s) => s.id === id);
      if (idx >= 0) this.sessions[idx] = this.activeSession;
    }, 5000);

    return session;
  }

  stopRecording(): PerfLogSession | null {
    if (!this.activeSession) return null;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    const summary = computeSummary(this.activeEntries);
    const endTime = Date.now();
    const updated: PerfLogSession = {
      ...this.activeSession,
      endTime,
      duration: formatDuration(endTime - this.recordingStart),
      entries: this.activeEntries.length,
      status: 'completed',
      summary,
    };

    this.allEntries.set(updated.id, this.activeEntries);
    const idx = this.sessions.findIndex((s) => s.id === this.activeSession!.id);
    if (idx >= 0) this.sessions[idx] = updated;

    this.activeSession = null;
    this.activeEntries = [];

    return updated;
  }

  getActiveSession(): PerfLogSession | null {
    if (!this.activeSession) return null;
    const elapsed = Date.now() - this.recordingStart;
    return {
      ...this.activeSession,
      duration: formatDuration(elapsed),
    };
  }

  getSessionData(sessionId: string): PerfLogEntry[] {
    // If it's the active session, return live data
    if (this.activeSession?.id === sessionId) {
      return this.activeEntries;
    }
    // Check stored
    const stored = this.allEntries.get(sessionId);
    if (stored) return stored;
    // For demo past sessions without stored data, generate on demand
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session && session.startTime && session.endTime) {
      const count = Math.min(session.entries || 50, 200);
      const duration = session.endTime - session.startTime;
      const interval = Math.max(1000, duration / count);
      const entries = generateSessionEntries(session.startTime, duration, interval);
      this.allEntries.set(sessionId, entries);
      return entries;
    }
    return [];
  }

  deleteSession(sessionId: string): void {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    this.allEntries.delete(sessionId);
  }
}
