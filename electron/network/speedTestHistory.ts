import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import type { SpeedTestResult } from '../../src/utils/types';

const dbPath = path.join(app.getPath('userData'), 'speedtest.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS speedtest_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        download REAL NOT NULL,
        upload REAL NOT NULL,
        ping INTEGER NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
  }
  return db;
}

export function saveSpeedTest(result: SpeedTestResult): void {
  getDb().prepare(
    'INSERT INTO speedtest_history (download, upload, ping, timestamp) VALUES (?, ?, ?, ?)'
  ).run(result.download, result.upload, result.ping, result.timestamp);
}

export function getSpeedTestHistory(limit: number = 20): SpeedTestResult[] {
  const rows = getDb().prepare(
    'SELECT download, upload, ping, timestamp FROM speedtest_history ORDER BY timestamp DESC LIMIT ?'
  ).all(limit) as SpeedTestResult[];
  return rows;
}

export function clearSpeedTestHistory(): void {
  getDb().prepare('DELETE FROM speedtest_history').run();
}

export function getSpeedTestStats(): { avgDownload: number; avgUpload: number; avgPing: number; count: number } {
  const row = getDb().prepare(
    'SELECT AVG(download) as avgDownload, AVG(upload) as avgUpload, AVG(ping) as avgPing, COUNT(*) as count FROM speedtest_history'
  ).get() as { avgDownload: number; avgUpload: number; avgPing: number; count: number };
  return row || { avgDownload: 0, avgUpload: 0, avgPing: 0, count: 0 };
}

export function getSpeedTestTopResults(): { maxDownload: SpeedTestResult | null; maxUpload: SpeedTestResult | null; minPing: SpeedTestResult | null } {
  const maxDl = getDb().prepare('SELECT download, upload, ping, timestamp FROM speedtest_history ORDER BY download DESC LIMIT 1').get() as SpeedTestResult | undefined;
  const maxUl = getDb().prepare('SELECT download, upload, ping, timestamp FROM speedtest_history ORDER BY upload DESC LIMIT 1').get() as SpeedTestResult | undefined;
  const minPg = getDb().prepare('SELECT download, upload, ping, timestamp FROM speedtest_history ORDER BY ping ASC LIMIT 1').get() as SpeedTestResult | undefined;
  return { maxDownload: maxDl ?? null, maxUpload: maxUl ?? null, minPing: minPg ?? null };
}
