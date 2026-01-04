import { app, net } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import AdmZip from 'adm-zip'
import { pluginDevServer } from './plugin-dev-server'
import { permissionManager } from './permission-manager'
import { webContentsViewManager } from './webcontents-view-manager'
import { createLogger } from '../shared/logger'

const logger = createLogger('plugin-manager')

interface PackageJson {
  name: string
  version: string
  description?: string
  author?: string | { name: string; email?: string }
  license?: string
  keywords?: string[]
  homepage?: string
  repository?: string | { type: string; url: string }
  unihub?: {
    id: string
    name?: string
    version?: string
    description?: string
    author?: string | { name: string; email?: string }
    icon?: string
    category?: string
    entry: string
    keywords?: string[]
    permissions?: string[]
    screenshots?: string[]
    homepage?: string
    repository?: string
    license?: string
    dev?: {
      enabled?: boolean
      url?: string
      autoReload?: boolean
    }
  }
}

interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string | { name: string; email?: string }
  entry: string
  icon?: string
  category: string
  keywords?: string[]
  permissions?: string[]
  isThirdParty?: boolean // 标记是否为第三方插件
  homepage?: string
  repository?: string
  license?: string
  dev?: {
    enabled?: boolean
    url?: string
    autoReload?: boolean
  }
}

interface InstalledPlugin {
  id: string
  version: string
  enabled: boolean
  installedAt: string
  source: string
  sourceUrl?: string
  metadata: PluginMetadata
}

export class PluginManager {
  private pluginsDir: string
  private pluginsDataFile: string
  private cachedPlugins: InstalledPlugin[] | null = null

  constructor() {
    const userDataPath = app.getPath('userData')
    this.pluginsDir = join(userDataPath, 'plugins')
    this.pluginsDataFile = join(userDataPath, 'plugins-data.json')

    if (!existsSync(this.pluginsDir)) {
      mkdirSync(this.pluginsDir, { recursive: true })
    }
  }

  async installPlugin(
    url: string
  ): Promise<{ success: boolean; message: string; pluginId?: string }> {
    try {
      logger.info({ url }, '开始安装插件')

      const buffer = await this.downloadWithRetry(url, 3)
      return await this.installFromBuffer(buffer, url)
    } catch (error) {
      logger.error({ err: error }, '安装插件失败')
      return { success: false, message: (error as Error).message }
    }
  }

  /**
   * 带重试机制的下载函数（使用 Electron net 模块，无超时限制）
   */
  private async downloadWithRetry(url: string, maxRetries: number = 3): Promise<Buffer> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug({ attempt, maxRetries, url }, '下载尝试')

        // 使用 Electron 的 net.fetch，它没有内置的超时限制
        const response = await net.fetch(url, {
          headers: {
            'User-Agent': 'UniHub/1.0',
            Accept: 'application/zip,application/octet-stream,*/*'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        logger.info({ size: `${(buffer.length / 1024).toFixed(2)} KB` }, '下载成功')
        return buffer
      } catch (error) {
        lastError = error as Error
        logger.warn({ attempt, maxRetries, error: lastError.message }, '下载失败')

        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const delay = 2000 * attempt // 递增延迟：2s, 4s, 6s
          logger.debug({ delay }, '等待后重试')
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // 所有重试都失败了
    const errorMessage = lastError?.message || '未知错误'
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      throw new Error(
        `下载超时，已重试 ${maxRetries} 次。请检查网络连接或稍后重试。\n提示：如果在中国大陆，可能需要配置代理访问 cdn.jsdelivr.net`
      )
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error(`无法连接到服务器，已重试 ${maxRetries} 次。请检查网络连接或 DNS 设置。`)
    } else {
      throw new Error(`下载失败: ${errorMessage}（已重试 ${maxRetries} 次）`)
    }
  }

  async installFromBuffer(
    buffer: Buffer | number[],
    filename: string
  ): Promise<{ success: boolean; message: string; pluginId?: string }> {
    try {
      logger.info({ filename }, '开始安装插件')

      // 如果是数组，转换为 Buffer
      const zipBuffer = Array.isArray(buffer) ? Buffer.from(buffer) : buffer

      const tempZip = join(app.getPath('temp'), 'plugin-temp.zip')
      const tempExtract = join(app.getPath('temp'), 'plugin-extract')

      writeFileSync(tempZip, zipBuffer)

      if (existsSync(tempExtract)) {
        rmSync(tempExtract, { recursive: true, force: true })
      }
      mkdirSync(tempExtract, { recursive: true })

      const zip = new AdmZip(tempZip)
      zip.extractAllTo(tempExtract, true)

      // 优先读取 package.json，兼容旧的 manifest.json
      let manifest: PluginMetadata
      const packageJsonPath = join(tempExtract, 'package.json')
      const manifestPath = join(tempExtract, 'manifest.json')

      if (existsSync(packageJsonPath)) {
        // 新格式：使用 package.json
        const pkg: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

        if (!pkg.unihub) {
          throw new Error('package.json 中缺少 unihub 配置')
        }

        // 自动继承 package.json 字段到 unihub 配置
        manifest = this.mergePackageJsonWithUnihub(pkg)
      } else if (existsSync(manifestPath)) {
        // 旧格式：兼容 manifest.json
        const oldManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
        manifest = {
          ...oldManifest,
          entry: oldManifest.main || oldManifest.frontend?.entry || 'frontend/index.html'
        }
      } else {
        throw new Error('插件包中缺少 package.json 或 manifest.json')
      }

      const installed = this.getInstalledPlugins()
      if (installed.some((p) => p.id === manifest.id)) {
        throw new Error('插件已安装，请先卸载旧版本')
      }

      const pluginDir = join(this.pluginsDir, manifest.id)
      if (existsSync(pluginDir)) {
        rmSync(pluginDir, { recursive: true, force: true })
      }

      const fs = await import('fs/promises')
      await fs.cp(tempExtract, pluginDir, { recursive: true })

      // 给 sidecar 可执行文件添加执行权限
      const sidecarDir = join(pluginDir, 'sidecar')
      if (existsSync(sidecarDir)) {
        const { chmod } = await import('fs/promises')
        const { readdir } = await import('fs/promises')

        try {
          const files = await readdir(sidecarDir)
          for (const file of files) {
            const filePath = join(sidecarDir, file)
            // 给所有可执行文件添加执行权限
            if (file.endsWith('.exe') || !file.includes('.')) {
              await chmod(filePath, 0o755)
              logger.debug({ file }, '已添加执行权限')
            }
          }
        } catch (error) {
          logger.warn({ error }, '添加执行权限失败')
        }
      }

      const pluginInfo: InstalledPlugin = {
        id: manifest.id,
        version: manifest.version,
        enabled: true,
        installedAt: new Date().toISOString(),
        source: filename.startsWith('http') ? 'url' : 'local',
        sourceUrl: filename.startsWith('http') ? filename : undefined,
        metadata: manifest
      }

      this.savePluginInfo(pluginInfo)

      // 注册插件权限
      permissionManager.registerPlugin(manifest.id, manifest.permissions || [])

      logger.info({ name: manifest.name, id: manifest.id }, '插件安装成功')
      return { success: true, message: `插件 ${manifest.name} 安装成功`, pluginId: manifest.id }
    } catch (error) {
      logger.error({ error }, '安装插件失败')
      return { success: false, message: (error as Error).message }
    }
  }

  async uninstallPlugin(pluginId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 关闭插件视图（如果打开的话）
      webContentsViewManager.removePluginView(pluginId)

      // 从已安装列表中移除
      const installed = this.getInstalledPlugins()
      const filtered = installed.filter((p) => p.id !== pluginId)
      writeFileSync(this.pluginsDataFile, JSON.stringify(filtered, null, 2))

      // 清除缓存
      this.cachedPlugins = null

      // 删除插件目录
      const pluginDir = join(this.pluginsDir, pluginId)
      if (existsSync(pluginDir)) {
        rmSync(pluginDir, { recursive: true, force: true })
      }

      // 移除插件权限
      permissionManager.unregisterPlugin(pluginId)

      logger.info({ pluginId }, '插件已卸载')

      return {
        success: true,
        message: '插件已卸载'
      }
    } catch (error) {
      logger.error({ err: error, pluginId }, '卸载插件失败')
      return { success: false, message: (error as Error).message }
    }
  }

  async listPlugins(): Promise<InstalledPlugin[]> {
    return this.getInstalledPlugins()
  }

  /**
   * 初始化已安装插件的权限
   */
  initializePermissions(): void {
    const installed = this.getInstalledPlugins()
    installed.forEach((plugin) => {
      if (plugin.enabled && plugin.metadata.permissions) {
        permissionManager.registerPlugin(plugin.id, plugin.metadata.permissions)
        logger.info(
          { pluginName: plugin.metadata.name, permissions: plugin.metadata.permissions },
          '已加载插件权限'
        )
      }
    })
  }

  async loadPlugin(
    pluginId: string
  ): Promise<{ success: boolean; htmlPath?: string; devUrl?: string; message?: string }> {
    try {
      // 检查是否为开发模式
      if (pluginDevServer.isDevMode(pluginId)) {
        const devUrl = pluginDevServer.getDevUrl(pluginId)
        if (devUrl) {
          return { success: true, devUrl }
        }
      }

      const installed = this.getInstalledPlugins()
      const plugin = installed.find((p) => p.id === pluginId)

      if (!plugin) {
        throw new Error('插件未安装')
      }

      // 检查插件配置中的开发模式
      if (plugin.metadata.dev?.enabled && plugin.metadata.dev?.url) {
        pluginDevServer.registerDevPlugin(
          pluginId,
          plugin.metadata.dev.url,
          plugin.metadata.dev.autoReload !== false
        )
        return { success: true, devUrl: plugin.metadata.dev.url }
      }

      const pluginDir = join(this.pluginsDir, pluginId)
      const htmlPath = join(pluginDir, plugin.metadata.entry)

      if (!existsSync(htmlPath)) {
        throw new Error('插件入口文件不存在')
      }

      return { success: true, htmlPath }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  /**
   * 将 package.json 字段自动继承到 unihub 配置中
   * 只有当 unihub 字段未提供时才会继承
   */
  private mergePackageJsonWithUnihub(pkg: PackageJson): PluginMetadata {
    const unihub = pkg.unihub!

    // 处理 author 字段的继承
    const getAuthorInfo = (
      unihubAuthor?: string | { name: string; email?: string },
      pkgAuthor?: string | { name: string; email?: string }
    ): string | { name: string; email?: string } => {
      if (unihubAuthor) return unihubAuthor
      if (pkgAuthor) return pkgAuthor
      return 'Unknown'
    }

    // 处理 repository 字段的继承
    const getRepositoryUrl = (
      unihubRepo?: string,
      pkgRepo?: string | { type: string; url: string }
    ): string | undefined => {
      if (unihubRepo) return unihubRepo
      if (typeof pkgRepo === 'string') return pkgRepo
      if (pkgRepo && typeof pkgRepo === 'object' && pkgRepo.url) return pkgRepo.url
      return undefined
    }

    return {
      // 必填字段
      id: unihub.id,
      entry: unihub.entry,

      // 可继承字段
      name: unihub.name || pkg.name,
      version: unihub.version || pkg.version,
      description: unihub.description || pkg.description || '',
      author: getAuthorInfo(unihub.author, pkg.author),

      // 可选字段的继承
      icon: unihub.icon,
      category: unihub.category || 'tool',
      keywords: unihub.keywords || pkg.keywords || [],
      permissions: unihub.permissions || [],

      // 扩展字段的继承
      homepage: unihub.homepage || pkg.homepage,
      repository: getRepositoryUrl(unihub.repository, pkg.repository),
      license: unihub.license || pkg.license,

      // 开发配置
      dev: unihub.dev
    }
  }

  private getInstalledPlugins(): InstalledPlugin[] {
    // 使用缓存
    if (this.cachedPlugins !== null) {
      return this.cachedPlugins as InstalledPlugin[]
    }

    if (!existsSync(this.pluginsDataFile)) {
      this.cachedPlugins = []
      return this.cachedPlugins as InstalledPlugin[]
    }

    try {
      const data = readFileSync(this.pluginsDataFile, 'utf-8')
      this.cachedPlugins = JSON.parse(data) as InstalledPlugin[]
      return this.cachedPlugins as InstalledPlugin[]
    } catch {
      this.cachedPlugins = []
      return this.cachedPlugins as InstalledPlugin[]
    }
  }

  /**
   * 预热缓存 - 在应用启动时调用
   */
  warmupCache(): void {
    this.getInstalledPlugins()
  }

  private savePluginInfo(plugin: InstalledPlugin): void {
    // 先清除缓存，确保读取最新数据
    this.cachedPlugins = null

    const installed = this.getInstalledPlugins()

    // 检查是否已存在（防止重复）
    const existingIndex = installed.findIndex((p) => p.id === plugin.id)
    if (existingIndex >= 0) {
      // 更新现有插件
      installed[existingIndex] = plugin
      logger.info({ pluginName: plugin.metadata.name }, '更新插件信息')
    } else {
      // 添加新插件
      installed.push(plugin)
      logger.info({ pluginName: plugin.metadata.name }, '添加新插件')
    }

    writeFileSync(this.pluginsDataFile, JSON.stringify(installed, null, 2))

    // 清除缓存
    this.cachedPlugins = null
  }
}
