import { app } from 'electron';
import Database from 'better-sqlite3';
import path from 'path';

export interface GameOverlayConfig {
  id?: number;
  gameName: string;
  showFps: boolean;
  showCpu: boolean;
  showGpu: boolean;
  showRam: boolean;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  fontSize: number;
}

const DEFAULT_CONFIG: Omit<GameOverlayConfig, 'gameName'> = {
  showFps: true,
  showCpu: true,
  showGpu: true,
  showRam: true,
  opacity: 0.8,
  position: 'top-left',
  color: '#4fc3f7',
  fontSize: 14,
};

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'game_configs.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS game_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_name TEXT UNIQUE NOT NULL,
      show_fps INTEGER DEFAULT 1,
      show_cpu INTEGER DEFAULT 1,
      show_gpu INTEGER DEFAULT 1,
      show_ram INTEGER DEFAULT 1,
      opacity REAL DEFAULT 0.8,
      position TEXT DEFAULT 'top-left',
      color TEXT DEFAULT '#4fc3f7',
      font_size INTEGER DEFAULT 14
    )`);
  }
  return db;
}

export function getGameConfig(gameName: string): GameOverlayConfig {
  const database = getDb();
  const row = database.prepare('SELECT * FROM game_configs WHERE game_name = ?').get(gameName) as any;
  if (!row) {
    return { gameName, ...DEFAULT_CONFIG };
  }
  return rowToConfig(row);
}

export function getAllGameConfigs(): GameOverlayConfig[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM game_configs ORDER BY game_name').all() as any[];
  return rows.map(rowToConfig);
}

export function saveGameConfig(config: GameOverlayConfig): void {
  const database = getDb();
  database.prepare(`INSERT INTO game_configs (game_name, show_fps, show_cpu, show_gpu, show_ram, opacity, position, color, font_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(game_name) DO UPDATE SET
      show_fps=excluded.show_fps, show_cpu=excluded.show_cpu, show_gpu=excluded.show_gpu,
      show_ram=excluded.show_ram, opacity=excluded.opacity, position=excluded.position,
      color=excluded.color, font_size=excluded.font_size
  `).run(
    config.gameName,
    config.showFps ? 1 : 0,
    config.showCpu ? 1 : 0,
    config.showGpu ? 1 : 0,
    config.showRam ? 1 : 0,
    config.opacity,
    config.position,
    config.color,
    config.fontSize,
  );
}

export function deleteGameConfig(gameName: string): void {
  const database = getDb();
  database.prepare('DELETE FROM game_configs WHERE game_name = ?').run(gameName);
}

function rowToConfig(row: any): GameOverlayConfig {
  return {
    id: row.id,
    gameName: row.game_name,
    showFps: row.show_fps === 1,
    showCpu: row.show_cpu === 1,
    showGpu: row.show_gpu === 1,
    showRam: row.show_ram === 1,
    opacity: row.opacity,
    position: row.position,
    color: row.color,
    fontSize: row.font_size,
  };
}
