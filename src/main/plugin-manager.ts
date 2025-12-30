import { BrowserWindow } from 'electron'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import AdmZip from 'adm-zip'

interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: any
  main: string
  icon?: string
  category: string
  keywords?: string[]
  permissions?: string[]
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

  setMainWindow(window: BrowserWindow) {
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
      const tempZip = join(app.getPath('temp'), 'plugin-temp.zip')
      const tempExtract = join(app.getPath('temp'), 'plugin-extract')

      writeFileSync(tempZip, buffer)

      if (existsSync(tempExtract)) {
        rmSync(tempExtract, { recursive: true, force: true })
      }
      mkdirSync(tempExtract, { recursive: true })

      const zip = new AdmZip(tempZip)
      zip.extractAllTo(tempExtract, true)

      const manifestPath = join(tempExtract, 'manifest.json')
      if (!existsSync(manifestPath)) {
        throw new Error('插件包中缺少 manifest.json')
      }

      const manifest: PluginMetadata = JSON.parse(readFileSync(manifestPath, 'utf-8'))

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

      const pluginInfo: InstalledPlugin = {
        id: manifest.id,
        version: manifest.version,
        enabled: true,
        installedAt: new Date().toISOString(),
        source: 'url',
        sourceUrl: url,
        metadata: manifest
      }

      this.savePluginInfo(pluginInfo)

      console.log('插件安装成功:', manifest.name)
      return { success: true, message: `插件 ${manifest.name} 安装成功` }
    } catch (error: any) {
      console.error('安装插件失败:', error)
      return { success: false, message: error.message }
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
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async listPlugins(): Promise<InstalledPlugin[]> {
    return this.getInstalledPlugins()
  }

  async loadPlugin(
    pluginId: string
  ): Promise<{ success: boolean; htmlPath?: string; message?: string }> {
    try {
      const installed = this.getInstalledPlugins()
      const plugin = installed.find((p) => p.id === pluginId)

      if (!plugin) {
        throw new Error('插件未安装')
      }

      const pluginDir = join(this.pluginsDir, pluginId)
      const htmlPath = join(pluginDir, plugin.metadata.main || 'frontend/index.html')

      if (!existsSync(htmlPath)) {
        throw new Error('插件入口文件不存在')
      }

      return { success: true, htmlPath }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async callPluginBackend(
    pluginId: string,
    functionName: string,
    args: string
  ): Promise<string> {
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
      const { spawn } = await import('child_process')
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
      }
      else {
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
    } catch (error: any) {
      console.error('调用后端失败:', error)
      return JSON.stringify({
        success: false,
        error: error.message
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
