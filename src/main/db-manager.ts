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

export interface CachedApp {
  id: string
  name: string
  displayName?: string
  path: string
  icon?: string
  version?: string
  bundleId?: string
  category?: string
  lastModified: number // 应用最后修改时间
  cachedAt: number // 缓存时间
}

export class DatabaseManager {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'unihub.db')

    this.db = new Database(dbPath)

    // 性能优化：启用 WAL 模式
    this.db.pragma('journal_mode = WAL')
    // 同步模式：NORMAL 提供更好的性能，同时保持数据安全
    this.db.pragma('synchronous = NORMAL')
    // 缓存大小：增加到 10MB
    this.db.pragma('cache_size = -10000')
    // 内存映射 I/O：提升读取性能
    this.db.pragma('mmap_size = 30000000000')

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

    // 应用缓存表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cached_apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT,
        path TEXT NOT NULL,
        icon TEXT,
        version TEXT,
        bundle_id TEXT,
        category TEXT,
        last_modified INTEGER NOT NULL,
        cached_at INTEGER NOT NULL
      )
    `)

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recents_last_accessed 
      ON recents(last_accessed_at DESC)
    `)

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cached_apps_path 
      ON cached_apps(path)
    `)

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cached_apps_cached_at 
      ON cached_apps(cached_at DESC)
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

  // ========== 应用缓存相关 ==========

  /**
   * 缓存应用信息
   */
  cacheApps(apps: CachedApp[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO cached_apps (
        id, name, display_name, path, icon, version, bundle_id, category, last_modified, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const transaction = this.db.transaction((apps: CachedApp[]) => {
      for (const app of apps) {
        stmt.run(
          app.id,
          app.name,
          app.displayName || null,
          app.path,
          app.icon || null,
          app.version || null,
          app.bundleId || null,
          app.category || null,
          app.lastModified,
          app.cachedAt
        )
      }
    })

    transaction(apps)
  }

  /**
   * 获取缓存的应用
   */
  getCachedApps(): CachedApp[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        name,
        display_name as displayName,
        path,
        icon,
        version,
        bundle_id as bundleId,
        category,
        last_modified as lastModified,
        cached_at as cachedAt
      FROM cached_apps
      ORDER BY name ASC
    `)
    return stmt.all() as CachedApp[]
  }

  /**
   * 获取缓存的应用（不包含图标，减少内存占用）
   */
  getCachedAppsWithoutIcons(): Omit<CachedApp, 'icon'>[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        name,
        display_name as displayName,
        path,
        version,
        bundle_id as bundleId,
        category,
        last_modified as lastModified,
        cached_at as cachedAt
      FROM cached_apps
      ORDER BY name ASC
    `)
    return stmt.all() as Omit<CachedApp, 'icon'>[]
  }

  /**
   * 获取单个应用的图标
   */
  getAppIcon(appPath: string): string | null {
    const stmt = this.db.prepare(`
      SELECT icon
      FROM cached_apps
      WHERE path = ?
    `)
    const result = stmt.get(appPath) as { icon: string | null } | undefined
    return result?.icon || null
  }

  /**
   * 检查应用是否需要更新（基于文件修改时间）
   */
  getAppsNeedingUpdate(pathModifiedMap: Map<string, number>): string[] {
    const stmt = this.db.prepare(`
      SELECT path, last_modified
      FROM cached_apps
    `)

    const cachedApps = stmt.all() as { path: string; last_modified: number }[]
    const needUpdate: string[] = []

    for (const cached of cachedApps) {
      const currentModified = pathModifiedMap.get(cached.path)
      if (currentModified && currentModified > cached.last_modified) {
        needUpdate.push(cached.path)
      }
    }

    // 检查是否有新应用
    for (const [path] of pathModifiedMap) {
      const exists = cachedApps.some((cached) => cached.path === path)
      if (!exists) {
        needUpdate.push(path)
      }
    }

    return needUpdate
  }

  /**
   * 删除不存在的应用缓存
   */
  removeDeletedApps(existingPaths: string[]): void {
    const placeholders = existingPaths.map(() => '?').join(',')
    const stmt = this.db.prepare(`
      DELETE FROM cached_apps 
      WHERE path NOT IN (${placeholders})
    `)
    stmt.run(...existingPaths)
  }

  /**
   * 清除应用缓存
   */
  clearAppCache(): void {
    this.db.exec('DELETE FROM cached_apps')
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { appCount: number; oldestCache: number; newestCache: number } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as appCount,
        MIN(cached_at) as oldestCache,
        MAX(cached_at) as newestCache
      FROM cached_apps
    `)
    const result = stmt.get() as { appCount: number; oldestCache: number; newestCache: number }
    return {
      appCount: result.appCount || 0,
      oldestCache: result.oldestCache || 0,
      newestCache: result.newestCache || 0
    }
  }

  // ========== 清理相关 ==========

  close(): void {
    this.db.close()
  }
}

export const dbManager = new DatabaseManager()
