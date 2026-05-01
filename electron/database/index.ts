import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function initDatabase(): Database.Database {
  const dbPath = path.join(app.getPath('userData'), 'pchelper.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS hardware_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      cpu_usage REAL,
      cpu_temp REAL,
      memory_used REAL,
      memory_total REAL,
      disk_used REAL,
      disk_total REAL,
      gpu_usage REAL,
      gpu_temp REAL
    );

    CREATE TABLE IF NOT EXISTS software_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      version TEXT,
      publisher TEXT,
      install_date TEXT,
      size_mb REAL,
      UNIQUE(name, version)
    );

    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conflict_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      resolved INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS update_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      scan_result TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alert_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      detail TEXT,
      dismissed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS health_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      overall_score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      breakdown TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert defaults if not exist
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  insertSetting.run('ai_endpoint', 'https://api.deepseek.com');
  insertSetting.run('ai_model', 'deepseek-v4-pro');
  insertSetting.run('ai_api_key', '');
  insertSetting.run('refresh_interval', '1000');

  return db;
}

export function getDatabase(): Database.Database {
  return db;
}

export function saveHardwareSnapshot(data: {
  cpu_usage: number;
  cpu_temp: number;
  memory_used: number;
  memory_total: number;
  disk_used: number;
  disk_total: number;
  gpu_usage: number;
  gpu_temp: number;
}): void {
  const stmt = db.prepare(`
    INSERT INTO hardware_history (timestamp, cpu_usage, cpu_temp, memory_used, memory_total, disk_used, disk_total, gpu_usage, gpu_temp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    Date.now(),
    data.cpu_usage,
    data.cpu_temp,
    data.memory_used,
    data.memory_total,
    data.disk_used,
    data.disk_total,
    data.gpu_usage,
    data.gpu_temp
  );
}

export function getHardwareHistory(limit = 60): unknown[] {
  return db
    .prepare(
      'SELECT * FROM hardware_history ORDER BY id DESC LIMIT ?'
    )
    .all(limit);
}

export function saveChatMessage(role: string, content: string): void {
  db.prepare(
    'INSERT INTO ai_chat_history (timestamp, role, content) VALUES (?, ?, ?)'
  ).run(Date.now(), role, content);
}

export function getChatHistory(limit = 100): unknown[] {
  return db
    .prepare(
      'SELECT * FROM ai_chat_history ORDER BY id ASC LIMIT ?'
    )
    .all(limit);
}

export function getSetting(key: string): string | undefined {
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    key,
    value
  );
}

export function logConflict(conflict: {
  type: string;
  severity: string;
  title: string;
  description: string;
}): void {
  db.prepare(
    'INSERT INTO conflict_log (timestamp, type, severity, title, description) VALUES (?, ?, ?, ?, ?)'
  ).run(Date.now(), conflict.type, conflict.severity, conflict.title, conflict.description);
}

export function dismissConflict(id: number): void {
  db.prepare('UPDATE conflict_log SET resolved = 1 WHERE id = ?').run(id);
}

export function getConflictHistory(limit = 50): unknown[] {
  return db
    .prepare('SELECT * FROM conflict_log ORDER BY id DESC LIMIT ?')
    .all(limit);
}

export function saveUpdateHistory(scanResultJson: string): void {
  db.prepare(
    'INSERT INTO update_history (timestamp, scan_result) VALUES (?, ?)'
  ).run(Date.now(), scanResultJson);
}

export function getUpdateHistory(limit = 10): unknown[] {
  return db
    .prepare('SELECT * FROM update_history ORDER BY id DESC LIMIT ?')
    .all(limit);
}

export function saveAlert(alert: {
  timestamp: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  detail?: string;
}): void {
  db.prepare(
    'INSERT INTO alert_history (timestamp, type, severity, title, message, detail) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(alert.timestamp, alert.type, alert.severity, alert.title, alert.message, alert.detail || null);
}

export function dismissAlertInDb(id: number): void {
  db.prepare('UPDATE alert_history SET dismissed = 1 WHERE id = ?').run(id);
}

export function getAlertHistoryFromDb(limit = 100): unknown[] {
  return db
    .prepare('SELECT * FROM alert_history ORDER BY id DESC LIMIT ?')
    .all(limit);
}

export function saveHealthScore(score: {
  total: number;
  grade: string;
  categories: unknown;
}): void {
  db.prepare(
    'INSERT INTO health_history (timestamp, overall_score, grade, breakdown) VALUES (?, ?, ?, ?)'
  ).run(Date.now(), score.total, score.grade, JSON.stringify(score.categories));
}

export function getHealthHistoryFromDb(limit = 24): unknown[] {
  return db
    .prepare(
      'SELECT timestamp, overall_score AS score, grade FROM health_history ORDER BY id DESC LIMIT ?'
    )
    .all(limit);
}
