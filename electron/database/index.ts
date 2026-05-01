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
