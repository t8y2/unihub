import { BrowserWindow } from 'electron'
import { join } from 'path'

/**
 * 插件窗口管理器
 * 为每个插件创建独立的 BrowserWindow
 */
export class PluginWindowManager {
  private windows: Map<string, BrowserWindow> = new Map()

  /**
   * 打开插件窗口
   */
  openPlugin(pluginId: string, htmlPath: string, pluginName: string): BrowserWindow {
    console.log('🔥 [PluginWindow] 开始打开插件窗口:', { pluginId, htmlPath, pluginName })
    
    // 如果窗口已存在，聚焦并返回
    const existingWindow = this.windows.get(pluginId)
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus()
      return existingWindow
    }

    // 创建新窗口
    const window = new BrowserWindow({
      width: 1000,
      height: 700,
      title: pluginName,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        // 🔥 关键：允许加载本地文件（插件需要）
        webSecurity: false
      }
    })

    console.log('🔥 [PluginWindow] 窗口已创建，preload 路径:', join(__dirname, '../preload/index.js'))

    // 监听加载事件
    window.webContents.on('did-start-loading', () => {
      console.log('🔥 [PluginWindow] 开始加载 HTML:', htmlPath)
    })

    window.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      console.error('❌ [PluginWindow] 加载失败:', { errorCode, errorDescription, htmlPath })
    })

    window.webContents.on('did-finish-load', () => {
      console.log('✅ [PluginWindow] HTML 加载完成')
      window.webContents.executeJavaScript(`
        window.__UNIHUB_PLUGIN_ID__ = '${pluginId}';
        console.log('✅ 插件 ID 已注入:', '${pluginId}');
        console.log('✅ window.unihub 是否存在:', typeof window.unihub);
        console.log('✅ window.node 是否存在:', typeof window.node);
      `)
    })

    window.webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
      console.log(`[PluginWindow Console] ${message}`)
    })

    // 加载插件 HTML
    console.log('🔥 [PluginWindow] 调用 loadFile:', htmlPath)
    window.loadFile(htmlPath).catch(err => {
      console.error('❌ [PluginWindow] loadFile 失败:', err)
    })

    // 🔥 临时：总是打开 DevTools 来调试白屏问题
    window.webContents.openDevTools()

    // 窗口关闭时清理
    window.on('closed', () => {
      this.windows.delete(pluginId)
    })

    this.windows.set(pluginId, window)
    return window
  }

  /**
   * 打开开发模式插件窗口
   */
  openDevPlugin(pluginId: string, devUrl: string, pluginName: string): BrowserWindow {
    // 如果窗口已存在，聚焦并返回
    const existingWindow = this.windows.get(pluginId)
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus()
      return existingWindow
    }

    // 创建新窗口
    const window = new BrowserWindow({
      width: 1000,
      height: 700,
      title: `${pluginName} (开发模式)`,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false // 开发模式允许跨域
      }
    })

    // 设置插件 ID
    window.webContents.executeJavaScript(`
      window.__UNIHUB_PLUGIN_ID__ = '${pluginId}';
    `)

    // 加载开发服务器
    window.loadURL(devUrl)

    // 开发模式打开 DevTools
    window.webContents.openDevTools()

    // 窗口关闭时清理
    window.on('closed', () => {
      this.windows.delete(pluginId)
    })

    this.windows.set(pluginId, window)
    return window
  }

  /**
   * 关闭插件窗口
   */
  closePlugin(pluginId: string): void {
    const window = this.windows.get(pluginId)
    if (window && !window.isDestroyed()) {
      window.close()
    }
    this.windows.delete(pluginId)
  }

  /**
   * 关闭所有插件窗口
   */
  closeAll(): void {
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.close()
      }
    }
    this.windows.clear()
  }

  /**
   * 获取插件窗口
   */
  getWindow(pluginId: string): BrowserWindow | undefined {
    return this.windows.get(pluginId)
  }
}

export const pluginWindowManager = new PluginWindowManager()
