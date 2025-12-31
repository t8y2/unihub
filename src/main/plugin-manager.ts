import { BrowserWindow } from 'electron'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import AdmZip from 'adm-zip'
import { pluginDevServer } from './plugin-dev-server'

interface PackageJson {
  name: string
  version: string
  description: string
  author: string | { name: string; email?: string }
  license?: string
  keywords?: string[]
  homepage?: string
  repository?: string | { type: string; url: string }
  unihub?: {
    id: string
    icon?: string
    category?: string
    entry: string
    backend?: {
      entry: string
      type: 'python' | 'node' | 'go' | 'binary'
    }
    permissions?: string[]
    screenshots?: string[]
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
  backend?: {
    entry: string
    type: string
  }
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
  private mainWindow: BrowserWindow | null = null
  private pluginsDir: string
  private pluginsDataFile: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.pluginsDir = join(userDataPath, 'plugins')
    this.pluginsDataFile = join(userDataPath, 'plugins-data.json')

    if (!existsSync(this.pluginsDir)) {
      mkdirSync(this.pluginsDir, { recursive: true })
    }
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  async installPlugin(url: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('开始安装插件:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`下载失败: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      return await this.installFromBuffer(buffer, url)
    } catch (error) {
      console.error('安装插件失败:', error)
      return { success: false, message: (error as Error).message }
    }
  }

  async installFromBuffer(
    buffer: Buffer | number[],
    filename: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('开始安装插件:', filename)

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

        manifest = {
          id: pkg.unihub.id,
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
          author: pkg.author,
          entry: pkg.unihub.entry,
          icon: pkg.unihub.icon,
          category: pkg.unihub.category || 'tool',
          keywords: pkg.keywords || [],
          permissions: pkg.unihub.permissions || [],
          backend: pkg.unihub.backend,
          dev: pkg.unihub.dev
        }
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

      // 给后端可执行文件添加执行权限
      const backendDir = join(pluginDir, 'backend')
      if (existsSync(backendDir)) {
        const { chmod } = await import('fs/promises')
        const { readdir } = await import('fs/promises')

        try {
          const files = await readdir(backendDir)
          for (const file of files) {
            const filePath = join(backendDir, file)
            // 给所有文件添加执行权限（特别是编译后的二进制文件）
            if (!file.endsWith('.py') && !file.endsWith('.js') && !file.endsWith('.go')) {
              await chmod(filePath, 0o755)
              console.log(`✅ 已添加执行权限: ${file}`)
            }
          }
        } catch (error) {
          console.warn('添加执行权限失败:', error)
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

      console.log('插件安装成功:', manifest.name)
      return { success: true, message: `插件 ${manifest.name} 安装成功` }
    } catch (error) {
      console.error('安装插件失败:', error)
      return { success: false, message: (error as Error).message }
    }
  }

  async uninstallPlugin(pluginId: string): Promise<{ success: boolean; message: string }> {
    try {
      const pluginDir = join(this.pluginsDir, pluginId)
      if (existsSync(pluginDir)) {
        rmSync(pluginDir, { recursive: true, force: true })
      }

      const installed = this.getInstalledPlugins()
      const filtered = installed.filter((p) => p.id !== pluginId)
      writeFileSync(this.pluginsDataFile, JSON.stringify(filtered, null, 2))

      return { success: true, message: '插件已卸载' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async listPlugins(): Promise<InstalledPlugin[]> {
    return this.getInstalledPlugins()
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

  async callPluginBackend(pluginId: string, functionName: string, args: string): Promise<string> {
    try {
      const installed = this.getInstalledPlugins()
      const plugin = installed.find((p) => p.id === pluginId)

      if (!plugin) {
        throw new Error('插件未安装')
      }

      const pluginDir = join(this.pluginsDir, pluginId)
      const backendDir = join(pluginDir, 'backend')

      if (!existsSync(backendDir)) {
        throw new Error('插件没有后端')
      }

      // 查找后端可执行文件
      const { promisify } = await import('util')
      const execFile = promisify((await import('child_process')).execFile)

      // 支持多种后端类型
      let command: string
      let commandArgs: string[]

      // 1. 检查编译后的二进制文件
      if (existsSync(join(backendDir, 'main'))) {
        command = join(backendDir, 'main')
        commandArgs = [functionName, args]
      }
      // 2. 检查 Python
      else if (existsSync(join(backendDir, 'main.py'))) {
        command = 'python3'
        commandArgs = [join(backendDir, 'main.py'), functionName, args]
      }
      // 3. 检查 Node.js
      else if (existsSync(join(backendDir, 'main.js'))) {
        command = 'node'
        commandArgs = [join(backendDir, 'main.js'), functionName, args]
      }
      // 4. 检查 Go
      else if (existsSync(join(backendDir, 'main.go'))) {
        // 先编译 Go
        await execFile('go', ['build', '-o', 'main', 'main.go'], { cwd: backendDir })
        command = join(backendDir, 'main')
        commandArgs = [functionName, args]
      }
      // 5. 检查 Rust
      else if (existsSync(join(backendDir, 'Cargo.toml'))) {
        // 先编译 Rust
        await execFile('cargo', ['build', '--release'], { cwd: backendDir })
        const target = join(backendDir, 'target', 'release', 'backend')
        command = target
        commandArgs = [functionName, args]
      } else {
        throw new Error('未找到支持的后端文件')
      }

      // 执行后端命令
      const { stdout, stderr } = await execFile(command, commandArgs, {
        timeout: 30000, // 30秒超时
        maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
      })

      if (stderr) {
        console.warn('后端警告:', stderr)
      }

      return stdout.trim()
    } catch (error) {
      console.error('调用后端失败:', error)
      return JSON.stringify({
        success: false,
        error: (error as Error).message
      })
    }
  }

  private getInstalledPlugins(): InstalledPlugin[] {
    if (!existsSync(this.pluginsDataFile)) {
      return []
    }

    try {
      const data = readFileSync(this.pluginsDataFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  private savePluginInfo(plugin: InstalledPlugin): void {
    const installed = this.getInstalledPlugins()
    installed.push(plugin)
    writeFileSync(this.pluginsDataFile, JSON.stringify(installed, null, 2))
  }
}
