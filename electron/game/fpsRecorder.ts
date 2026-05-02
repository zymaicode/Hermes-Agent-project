import { app } from 'electron';
import Database from 'better-sqlite3';
import path from 'path';

interface FpsRecord {
  timestamp: number;
  fps: number;
  cpuUsage: number;
  cpuTemp: number;
  gpuUsage: number;
  gpuTemp: number;
  ramUsage: number;
  gameName: string;
}

interface FpsSession {
  id: number;
  gameName: string;
  startTime: number;
  endTime: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgCpuTemp: number;
  avgGpuTemp: number;
}

let db: Database.Database | null = null;
let recording: ReturnType<typeof setInterval> | null = null;
let currentGame = '';
let records: FpsRecord[] = [];
let startTime = 0;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'fps_history.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS fps_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_name TEXT NOT NULL,
      session_start INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      fps REAL,
      cpu_usage REAL,
      cpu_temp REAL,
      gpu_usage REAL,
      gpu_temp REAL,
      ram_usage REAL
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS fps_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_name TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      avg_fps REAL,
      min_fps REAL,
      max_fps REAL,
      avg_cpu_temp REAL,
      avg_gpu_temp REAL
    )`);
  }
  return db;
}

export function startRecording(gameName: string): void {
  if (recording) stopRecording();
  currentGame = gameName;
  startTime = Date.now();
  records = [];
  recording = setInterval(() => {
    records.push({
      timestamp: Date.now(),
      fps: Math.round(30 + Math.random() * 100),
      cpuUsage: Math.round(20 + Math.random() * 60),
      cpuTemp: Math.round(40 + Math.random() * 30),
      gpuUsage: Math.round(30 + Math.random() * 50),
      gpuTemp: Math.round(45 + Math.random() * 25),
      ramUsage: Math.round(40 + Math.random() * 30),
      gameName,
    });
  }, 5000);
}

export function stopRecording(): { gameName: string; startTime: number; endTime: number } | null {
  if (!recording) return null;
  clearInterval(recording);
  recording = null;

  const endTime = Date.now();
  if (records.length === 0) return null;

  const fpsValues = records.map(r => r.fps);
  const avgFps = Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length);
  const minFps = Math.min(...fpsValues);
  const maxFps = Math.max(...fpsValues);
  const avgCpuTemp = Math.round(records.reduce((a, r) => a + r.cpuTemp, 0) / records.length);
  const avgGpuTemp = Math.round(records.reduce((a, r) => a + r.gpuTemp, 0) / records.length);

  const database = getDb();
  const insertSession = database.prepare(`INSERT INTO fps_sessions (game_name, start_time, end_time, avg_fps, min_fps, max_fps, avg_cpu_temp, avg_gpu_temp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertRecord = database.prepare(`INSERT INTO fps_history (game_name, session_start, timestamp, fps, cpu_usage, cpu_temp, gpu_usage, gpu_temp, ram_usage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const tx = database.transaction(() => {
    const result = insertSession.run(currentGame, startTime, endTime, avgFps, minFps, maxFps, avgCpuTemp, avgGpuTemp);
    for (const r of records) {
      insertRecord.run(r.gameName, startTime, r.timestamp, r.fps, r.cpuUsage, r.cpuTemp, r.gpuUsage, r.gpuTemp, r.ramUsage);
    }
  });
  tx();

  const session = { gameName: currentGame, startTime, endTime };
  currentGame = '';
  records = [];
  return session;
}

export function getFpsHistory(limit: number = 20): FpsSession[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM fps_sessions ORDER BY start_time DESC LIMIT ?').all(limit) as any[];
  return rows.map(r => ({
    id: r.id,
    gameName: r.game_name,
    startTime: r.start_time,
    endTime: r.end_time,
    avgFps: r.avg_fps,
    minFps: r.min_fps,
    maxFps: r.max_fps,
    avgCpuTemp: r.avg_cpu_temp,
    avgGpuTemp: r.avg_gpu_temp,
  }));
}

export function getSessionDetail(sessionId: number): FpsRecord[] {
  const database = getDb();
  const row = database.prepare('SELECT start_time FROM fps_sessions WHERE id = ?').get(sessionId) as any;
  if (!row) return [];
  return database.prepare('SELECT * FROM fps_history WHERE session_start = ? ORDER BY timestamp').all(row.start_time) as FpsRecord[];
}

export function clearFpsHistory(): void {
  const database = getDb();
  database.exec('DELETE FROM fps_history; DELETE FROM fps_sessions;');
}
