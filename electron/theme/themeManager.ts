import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { ThemeConfig, DASHBOARD_THEME_DEFAULTS } from './types';

const dbPath = path.join(app.getPath('userData'), 'theme.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS theme (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        config TEXT NOT NULL
      )
    `);
  }
  return db;
}

export function getTheme(): ThemeConfig {
  const d = getDb().prepare('SELECT config FROM theme WHERE id = 1').get() as { config: string } | undefined;
  if (d) return JSON.parse(d.config);
  return { ...DASHBOARD_THEME_DEFAULTS };
}

export function saveTheme(config: ThemeConfig): void {
  getDb().prepare('INSERT INTO theme (id, config) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET config = excluded.config').run(JSON.stringify(config));
}

export function getThemeDefaults(): ThemeConfig {
  return { ...DASHBOARD_THEME_DEFAULTS };
}
