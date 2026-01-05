import { createLogger } from '../shared/logger'
import { fileIconToBuffer } from 'file-icon'
import { getWinInstalledApps } from 'get-installed-apps'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { dbManager, type CachedApp } from './db-manager'

const execAsync = promisify(exec)

// Windows 应用信息类型
interface WindowsAppInfo {
  DisplayName?: string
  name?: string
  DisplayVersion?: string
  version?: string
  InstallLocation?: string
  path?: string
  [key: string]: unknown
}

const logger = createLogger('app-scanner')

export interface LocalApp {
  id: string
  name: string
  displayName?: string // 显示名称
  path: string
  icon?: string // base64 编码的图标数据
  version?: string // 应用版本
  bundleId?: string // Bundle ID (macOS) 或应用标识符
  category?: string // 应用分类
  lastUsed?: string // 最后使用时间
  useCount?: number // 使用次数
  type: 'app'
}

export class AppScanner {
  private apps: LocalApp[] = []
  private isScanning = false
  private lastScanTime = 0
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时缓存
  private readonly MEMORY_CACHE_DURATION = 5 * 60 * 1000 // 内存缓存5分钟

  async getApps(): Promise<LocalApp[]> {
    const now = Date.now()

    // 如果内存中有缓存且未过期，直接返回
    if (this.apps.length > 0 && now - this.lastScanTime < this.MEMORY_CACHE_DURATION) {
      logger.debug('使用内存缓存的应用列表')
      return this.apps
    }

    // 清理内存缓存，从数据库重新加载
    if (this.apps.length > 0) {
      logger.debug('清理内存缓存，从数据库重新加载')
      this.apps = []
    }

    // 尝试从数据库加载缓存
    const cachedApps = dbManager.getCachedApps()
    if (cachedApps.length > 0) {
      // 检查缓存是否还有效（24小时内）
      const oldestCache = Math.min(...cachedApps.map((app) => app.cachedAt))
      if (now - oldestCache < this.CACHE_DURATION) {
        logger.info({ count: cachedApps.length }, '使用数据库缓存的应用列表')
        this.apps = this.convertCachedAppsToLocalApps(cachedApps)
        this.lastScanTime = now
        return this.apps
      }
    }

    // 缓存过期或不存在，执行扫描
    if (this.isScanning) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isScanning) {
            clearInterval(checkInterval)
            resolve(this.apps)
          }
        }, 100)
      })
    }

    await this.scan()
    return this.apps
  }

  /**
   * 获取应用列表（快速模式：不包含图标）
   */
  async getAppsQuick(): Promise<Omit<LocalApp, 'icon'>[]> {
    const now = Date.now()

    // 尝试从数据库快速加载（不包含图标）
    const cachedApps = dbManager.getCachedAppsWithoutIcons()
    if (cachedApps.length > 0) {
      const oldestCache = Math.min(...cachedApps.map((app) => app.cachedAt))
      if (now - oldestCache < this.CACHE_DURATION) {
        logger.info({ count: cachedApps.length }, '快速加载应用列表（无图标）')
        return cachedApps.map((cached) => ({
          id: cached.id,
          name: cached.name,
          displayName: cached.displayName,
          path: cached.path,
          version: cached.version,
          bundleId: cached.bundleId,
          category: cached.category,
          type: 'app' as const
        }))
      }
    }

    // 如果没有缓存，返回完整扫描结果（但去掉图标）
    const fullApps = await this.getApps()
    return fullApps.map((app) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, ...appWithoutIcon } = app
      return appWithoutIcon
    })
  }

  /**
   * 批量获取应用图标（用于预加载）
   */
  async preloadIcons(appPaths: string[]): Promise<Map<string, string>> {
    const iconMap = new Map<string, string>()

    // 批量从数据库获取图标
    const batchSize = 20
    for (let i = 0; i < appPaths.length; i += batchSize) {
      const batch = appPaths.slice(i, i + batchSize)
      const promises = batch.map(async (path) => {
        const icon = dbManager.getAppIcon(path)
        if (icon) {
          iconMap.set(path, icon)
        }
        return { path }
      })

      await Promise.all(promises)
    }

    logger.debug(
      {
        requested: appPaths.length,
        loaded: iconMap.size
      },
      '批量预加载图标完成'
    )

    return iconMap
  }

  /**
   * 获取应用列表（不缓存图标到内存）
   */
  async getAppsWithoutIcons(): Promise<Omit<LocalApp, 'icon'>[]> {
    const apps = await this.getApps()
    return apps.map((app) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, ...appWithoutIcon } = app
      return appWithoutIcon
    })
  }

  /**
   * 按需获取单个应用图标
   */
  async getAppIcon(appPath: string): Promise<string | undefined> {
    // 先从数据库查找
    const cachedApps = dbManager.getCachedApps()
    const cachedApp = cachedApps.find((app) => app.path === appPath)

    if (cachedApp?.icon) {
      return cachedApp.icon
    }

    // 如果数据库中没有，实时提取
    return await this.extractAppIcon(appPath)
  }

  /**
   * 将缓存的应用转换为 LocalApp 格式
   */
  private convertCachedAppsToLocalApps(cachedApps: CachedApp[]): LocalApp[] {
    return cachedApps.map((cached) => ({
      id: cached.id,
      name: cached.name,
      displayName: cached.displayName,
      path: cached.path,
      icon: cached.icon,
      version: cached.version,
      bundleId: cached.bundleId,
      category: cached.category,
      type: 'app' as const
    }))
  }

  /**
   * 将 LocalApp 转换为缓存格式
   */
  private convertLocalAppsToCached(
    apps: LocalApp[],
    pathModifiedMap: Map<string, number>
  ): CachedApp[] {
    const now = Date.now()
    return apps.map((app) => ({
      id: app.id,
      name: app.name,
      displayName: app.displayName,
      path: app.path,
      icon: app.icon,
      version: app.version,
      bundleId: app.bundleId,
      category: app.category,
      lastModified: pathModifiedMap.get(app.path) || now,
      cachedAt: now
    }))
  }

  private async scan(): Promise<void> {
    this.isScanning = true
    const startTime = performance.now()

    try {
      const apps: LocalApp[] = []
      const pathModifiedMap = new Map<string, number>()

      if (process.platform === 'darwin') {
        const { apps: macApps, pathModifiedMap: macPathMap } = await this.scanMacOSApps()
        apps.push(...macApps)
        for (const [path, modified] of macPathMap) {
          pathModifiedMap.set(path, modified)
        }
      } else if (process.platform === 'win32') {
        const winApps = await this.scanWindowsApps()
        apps.push(...winApps)
        // Windows 应用修改时间处理可以后续添加
      }

      this.apps = apps
      this.lastScanTime = Date.now()

      // 保存到数据库缓存
      const cachedApps = this.convertLocalAppsToCached(apps, pathModifiedMap)
      dbManager.cacheApps(cachedApps)

      const endTime = performance.now()
      logger.info(
        {
          count: apps.length,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          cached: true
        },
        '应用扫描完成并已缓存'
      )
    } catch (error) {
      logger.error({ err: error }, '扫描应用失败')
    } finally {
      this.isScanning = false
    }
  }

  /**
   * 扫描 macOS 应用
   */
  private async scanMacOSApps(): Promise<{
    apps: LocalApp[]
    pathModifiedMap: Map<string, number>
  }> {
    try {
      logger.info('开始扫描 macOS 应用')
      const apps: LocalApp[] = []
      const pathModifiedMap = new Map<string, number>()

      // 扫描多个应用目录
      const appDirs = ['/Applications', '/System/Applications', '/System/Applications/Utilities']

      for (const dir of appDirs) {
        try {
          const { apps: dirApps, pathModifiedMap: dirPathMap } = await this.scanMacOSDirectory(dir)
          apps.push(...dirApps)
          for (const [path, modified] of dirPathMap) {
            pathModifiedMap.set(path, modified)
          }
        } catch (error) {
          logger.warn({ err: error, dir }, '扫描目录失败')
        }
      }

      logger.info({ count: apps.length }, 'macOS 应用扫描完成')
      return { apps, pathModifiedMap }
    } catch (error) {
      logger.error({ err: error }, '扫描 macOS 应用失败')
      return { apps: [], pathModifiedMap: new Map() }
    }
  }

  /**
   * 扫描 macOS 目录中的应用（并行优化）
   */
  private async scanMacOSDirectory(
    dir: string
  ): Promise<{ apps: LocalApp[]; pathModifiedMap: Map<string, number> }> {
    try {
      const entries = await readdir(dir)
      const appEntries = entries.filter((entry) => entry.endsWith('.app'))
      const pathModifiedMap = new Map<string, number>()

      if (appEntries.length === 0) return { apps: [], pathModifiedMap }

      logger.debug({ dir, count: appEntries.length }, '开始并行处理应用')

      // 并行处理所有应用，限制并发数为 10
      const batchSize = 10
      const apps: LocalApp[] = []

      for (let i = 0; i < appEntries.length; i += batchSize) {
        const batch = appEntries.slice(i, i + batchSize)
        const batchPromises = batch.map(async (entry) => {
          const appPath = join(dir, entry)

          try {
            const stats = await stat(appPath)
            if (!stats.isDirectory()) return null

            // 记录修改时间
            pathModifiedMap.set(appPath, stats.mtime.getTime())

            // 并行获取应用信息和图标
            const [appInfo, iconData] = await Promise.all([
              this.getMacOSAppInfo(appPath),
              this.extractAppIcon(appPath)
            ])

            if (!appInfo) return null

            return {
              id: `app:${appInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
              name: appInfo.name,
              displayName: appInfo.displayName !== appInfo.name ? appInfo.displayName : undefined,
              path: appPath,
              icon: iconData,
              version: appInfo.version,
              bundleId: appInfo.bundleId,
              category: appInfo.category,
              type: 'app' as const
            }
          } catch (error) {
            logger.warn({ err: error, appPath }, '处理应用失败')
            return null
          }
        })

        // 等待当前批次完成
        const batchResults = await Promise.all(batchPromises)
        const validApps = batchResults.filter((app) => app !== null) as LocalApp[]
        apps.push(...validApps)

        logger.debug(
          {
            dir,
            batch: i / batchSize + 1,
            processed: validApps.length,
            total: batch.length
          },
          '批次处理完成'
        )
      }

      return { apps, pathModifiedMap }
    } catch (error) {
      logger.warn({ err: error, dir }, '读取目录失败')
      return { apps: [], pathModifiedMap: new Map() }
    }
  }

  /**
   * 使用 mdls 获取 macOS 应用信息（优化版）
   */
  private async getMacOSAppInfo(appPath: string): Promise<{
    name: string
    displayName: string
    bundleId?: string
    version?: string
    category?: string
  } | null> {
    try {
      // 使用 mdls 获取应用元数据，设置超时避免卡住
      const { stdout } = await execAsync(
        `mdls -name kMDItemDisplayName -name kMDItemFSName -name kMDItemCFBundleIdentifier -name kMDItemVersion -name kMDItemAppStoreCategory "${appPath}"`,
        { timeout: 5000 } // 5秒超时
      )

      // 解析输出
      const info: Record<string, string> = {}
      const lines = stdout.trim().split('\n')

      for (const line of lines) {
        const match = line.match(/^(\w+)\s*=\s*"?([^"]*)"?$/)
        if (match) {
          const [, key, value] = match
          if (value && value !== '(null)') {
            info[key] = value
          }
        }
      }

      // 提取信息
      const fsName = info.kMDItemFSName
      const displayName = info.kMDItemDisplayName
      const bundleId = info.kMDItemCFBundleIdentifier
      const version = info.kMDItemVersion
      const category = info.kMDItemAppStoreCategory

      if (!fsName) return null

      // 提取应用名称（去掉 .app 后缀）
      const name = fsName.replace(/\.app$/, '')
      const finalDisplayName = displayName ? displayName.replace(/\.app$/, '') : name

      return {
        name,
        displayName: finalDisplayName,
        bundleId: bundleId || undefined,
        version: version || undefined,
        category: category || undefined
      }
    } catch (error) {
      // 超时或其他错误时，尝试从路径提取基本信息
      const name =
        appPath
          .split('/')
          .pop()
          ?.replace(/\.app$/, '') || 'Unknown'
      logger.warn({ err: error, appPath, name }, '获取应用信息失败，使用基本信息')

      return {
        name,
        displayName: name
      }
    }
  }

  /**
   * 扫描 Windows 应用
   */
  private async scanWindowsApps(): Promise<LocalApp[]> {
    try {
      logger.info('开始扫描 Windows 应用')
      const rawApps = (await getWinInstalledApps()) as WindowsAppInfo[]
      const apps: LocalApp[] = []

      for (const rawApp of rawApps) {
        try {
          // Windows 应用信息结构可能不同，需要根据实际返回调整
          const appName = rawApp.DisplayName || rawApp.name || 'Unknown'
          const version = rawApp.DisplayVersion || rawApp.version
          const installLocation = rawApp.InstallLocation || rawApp.path

          if (!installLocation) continue

          // 提取图标
          const iconData = await this.extractAppIcon(installLocation)

          apps.push({
            id: `app:${appName.toLowerCase().replace(/\s+/g, '-')}`,
            name: appName,
            path: installLocation,
            icon: iconData,
            version,
            type: 'app'
          })

          logger.debug({ appName, version }, '处理 Windows 应用')
        } catch (error) {
          logger.warn({ err: error, app: rawApp }, '处理应用失败')
          continue
        }
      }

      logger.info({ count: apps.length }, 'Windows 应用扫描完成')
      return apps
    } catch (error) {
      logger.error({ err: error }, '扫描 Windows 应用失败')
      return []
    }
  }

  async refresh(): Promise<void> {
    logger.info('强制刷新应用列表')
    this.apps = []
    this.lastScanTime = 0
    // 清除数据库缓存
    dbManager.clearAppCache()
    await this.scan()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { appCount: number; oldestCache: number; newestCache: number } {
    return dbManager.getCacheStats()
  }

  /**
   * 提取应用图标（跨平台）
   */
  private async extractAppIcon(appPath: string): Promise<string | undefined> {
    try {
      if (process.platform === 'darwin') {
        return await this.extractMacOSIcon(appPath)
      } else if (process.platform === 'win32') {
        return await this.extractWindowsIcon(appPath)
      }
      return undefined
    } catch (error) {
      logger.warn({ err: error, appPath }, '提取应用图标失败')
      return undefined
    }
  }

  /**
   * 提取 macOS 应用图标（优化版）
   */
  private async extractMacOSIcon(appPath: string): Promise<string | undefined> {
    try {
      // 确保路径以 .app 结尾
      if (!appPath.endsWith('.app')) {
        return undefined
      }

      // 使用 file-icon 库提取图标，添加超时处理
      const iconPromise = fileIconToBuffer(appPath, { size: 64 })
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('图标提取超时')), 3000) // 3秒超时
      })

      const iconBuffer = await Promise.race([iconPromise, timeoutPromise])

      if (!iconBuffer || iconBuffer.length === 0) {
        return undefined
      }

      // 转换为 base64
      const base64Data = Buffer.from(iconBuffer).toString('base64')
      return `data:image/png;base64,${base64Data}`
    } catch (error) {
      logger.warn({ err: error, appPath }, '提取 macOS 应用图标失败')
      return undefined
    }
  }

  /**
   * 提取 Windows 应用图标
   */
  private async extractWindowsIcon(appPath: string): Promise<string | undefined> {
    try {
      // 使用 Electron 的 app.getFileIcon API（Windows 支持）
      const { app } = await import('electron')
      const icon = await app.getFileIcon(appPath, { size: 'normal' })

      if (icon.isEmpty()) {
        return undefined
      }

      // 调整图标大小为 64x64 并转换为 PNG base64
      const resizedIcon = icon.resize({ width: 64, height: 64 })
      const pngData = resizedIcon.toPNG()
      const base64Data = pngData.toString('base64')

      return `data:image/png;base64,${base64Data}`
    } catch (error) {
      logger.warn({ err: error, appPath }, '提取 Windows 应用图标失败')
      return undefined
    }
  }
}

export const appScanner = new AppScanner()
