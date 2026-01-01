import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'

export interface FavoritePlugin {
  pluginId: string
  addedAt: number
}

export interface RecentPlugin {
  pluginId: string
  lastAccessedAt: number
  accessCount: number
}

export class DatabaseManager {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'unihub.db')
    
    this.db = new Database(dbPath)
    this.initTables()
  }

  private initTables(): void {
    // 收藏表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        plugin_id TEXT PRIMARY KEY,
        added_at INTEGER NOT NULL
      )
    `)

    // 最近使用表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recents (
        plugin_id TEXT PRIMARY KEY,
        last_accessed_at INTEGER NOT NULL,
        access_count INTEGER DEFAULT 1
      )
    `)

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recents_last_accessed 
      ON recents(last_accessed_at DESC)
    `)
  }

  // ========== 收藏相关 ==========
  
  addFavorite(pluginId: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO favorites (plugin_id, added_at)
      VALUES (?, ?)
    `)
    stmt.run(pluginId, Date.now())
  }

  removeFavorite(pluginId: string): void {
    const stmt = this.db.prepare('DELETE FROM favorites WHERE plugin_id = ?')
    stmt.run(pluginId)
  }

  isFavorite(pluginId: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM favorites WHERE plugin_id = ?')
    return stmt.get(pluginId) !== undefined
  }

  getFavorites(): FavoritePlugin[] {
    const stmt = this.db.prepare(`
      SELECT plugin_id as pluginId, added_at as addedAt
      FROM favorites
      ORDER BY added_at DESC
    `)
    return stmt.all() as FavoritePlugin[]
  }

  // ========== 最近使用相关 ==========
  
  addRecent(pluginId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO recents (plugin_id, last_accessed_at, access_count)
      VALUES (?, ?, 1)
      ON CONFLICT(plugin_id) DO UPDATE SET
        last_accessed_at = ?,
        access_count = access_count + 1
    `)
    const now = Date.now()
    stmt.run(pluginId, now, now)
  }

  getRecents(limit = 10): RecentPlugin[] {
    const stmt = this.db.prepare(`
      SELECT 
        plugin_id as pluginId,
        last_accessed_at as lastAccessedAt,
        access_count as accessCount
      FROM recents
      ORDER BY last_accessed_at DESC
      LIMIT ?
    `)
    return stmt.all(limit) as RecentPlugin[]
  }

  clearRecents(): void {
    this.db.exec('DELETE FROM recents')
  }

  // ========== 清理相关 ==========
  
  close(): void {
    this.db.close()
  }
}

export const dbManager = new DatabaseManager()
