import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { WidgetLayout, DEFAULT_WIDGETS } from './types';

const dbPath = path.join(app.getPath('userData'), 'widget.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS widget_layout (id INTEGER PRIMARY KEY CHECK (id = 1), config TEXT NOT NULL)`);
  }
  return db;
}

export function getWidgetLayout(): WidgetLayout {
  const d = getDb().prepare('SELECT config FROM widget_layout WHERE id = 1').get() as { config: string } | undefined;
  if (d) return JSON.parse(d.config);
  return { widgets: DEFAULT_WIDGETS };
}

export function saveWidgetLayout(layout: WidgetLayout): void {
  getDb().prepare('INSERT INTO widget_layout (id, config) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET config = excluded.config').run(JSON.stringify(layout));
}

export function getWidgetDefaults(): WidgetLayout {
  return { widgets: DEFAULT_WIDGETS };
}
