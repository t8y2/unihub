import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PluginManager } from './plugin-manager'
import { PluginAPI } from './plugin-api'
import { NodeAPI } from './node-api'
import { registerDevModeHandlers } from './ipc-handlers'
import { webContentsViewManager } from './webcontents-view-manager'

// 标记是否有活动的第三方插件
let hasActiveThirdPartyPlugin = false

// 在开发环境中禁用安全警告
if (is.dev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

let mainWindow: BrowserWindow | null = null
const pluginManager = new PluginManager()
const pluginAPI = new PluginAPI()
const nodeAPI = new NodeAPI()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // 允许加载自定义协议
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // 设置主窗口到 WebContentsView 管理器
    if (mainWindow) {
      webContentsViewManager.setMainWindow(mainWindow)
    }
  })

  // 拦截 Cmd+W / Ctrl+W 快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 检查是否是 Cmd+W (Mac) 或 Ctrl+W (Windows/Linux)
    if (input.type === 'keyDown' && input.key === 'w' && (input.meta || input.control)) {
      // 如果有活动的第三方插件，阻止默认行为
      if (hasActiveThirdPartyPlugin) {
        event.preventDefault()
        console.log('🚫 阻止 Cmd+W 关闭窗口（第三方插件正在运行）')
        // 通知渲染进程处理关闭标签
        mainWindow?.webContents.send('handle-close-tab')
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.unihub.app')

  // 注册自定义协议 plugin:// (标准协议，支持相对路径)
  protocol.registerFileProtocol('plugin', (request, callback) => {
    try {
      // URL 示例: plugin://com.unihub.modern-vue/dist/index.html?__plugin_id=xxx
      let url = request.url.substring('plugin://'.length)

      // 移除 URL 参数
      const queryIndex = url.indexOf('?')
      if (queryIndex !== -1) {
        url = url.substring(0, queryIndex)
      }

      const [pluginId, ...pathParts] = url.split('/')
      const filePath = pathParts.join('/')

      // 映射到插件目录的真实路径
      const pluginDir = join(app.getPath('userData'), 'plugins', pluginId)
      const fullPath = join(pluginDir, filePath)

      console.log('🔌 加载插件资源:', fullPath)
      callback({ path: fullPath })
    } catch (error) {
      console.error('❌ 加载插件资源失败:', error)
      callback({ error: -2 }) // net::ERR_FAILED
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function setupIpcHandlers(): void {
  // 注册开发模式处理器
  registerDevModeHandlers()

  ipcMain.handle('plugin:install', async (_, url: string) => {
    return await pluginManager.installPlugin(url)
  })

  ipcMain.handle('plugin:install-from-buffer', async (_, buffer: number[], filename: string) => {
    return await pluginManager.installFromBuffer(buffer, filename)
  })

  ipcMain.handle('plugin:uninstall', async (_, pluginId: string) => {
    return await pluginManager.uninstallPlugin(pluginId)
  })

  ipcMain.handle('plugin:list', async () => {
    return await pluginManager.listPlugins()
  })

  ipcMain.handle('plugin:load', async (_, pluginId: string) => {
    const result = await pluginManager.loadPlugin(pluginId)
    if (result.success) {
      // 返回插件 URL，让浏览器自动处理相对路径
      if (result.devUrl) {
        return {
          ...result,
          pluginUrl: result.devUrl
        }
      } else if (result.htmlPath) {
        // 生产模式：返回 plugin:// 协议的 URL
        return {
          ...result,
          pluginUrl: `plugin://${pluginId}/dist/index.html`
        }
      }
    }
    return result
  })

  // 打开插件（使用 WebContentsView）
  ipcMain.handle('plugin:open', async (_, pluginId: string) => {
    const result = await pluginManager.loadPlugin(pluginId)
    if (!result.success) {
      return result
    }

    const plugins = await pluginManager.listPlugins()
    const plugin = plugins.find((p) => p.id === pluginId)
    if (!plugin) {
      return { success: false, message: '插件未找到' }
    }

    let pluginUrl = ''
    if (result.devUrl) {
      // 开发模式
      pluginUrl = result.devUrl
      console.log('🔥 打开开发模式插件:', pluginId, pluginUrl)
    } else if (result.htmlPath) {
      // 生产模式：使用 plugin:// 协议
      pluginUrl = `plugin://${pluginId}/dist/index.html`
      console.log('🔌 打开生产模式插件:', pluginId, pluginUrl)
    } else {
      return { success: false, message: '插件 URL 不正确' }
    }

    // 创建并显示 WebContentsView
    webContentsViewManager.createPluginView(pluginId, pluginUrl)
    webContentsViewManager.showPluginView(pluginId)

    // 标记有活动的第三方插件
    hasActiveThirdPartyPlugin = true

    return { success: true }
  })

  // 关闭插件
  ipcMain.handle('plugin:close', async (_, pluginId: string) => {
    webContentsViewManager.hidePluginView(pluginId)

    // 检查是否还有其他活动的插件视图
    const hasOtherActiveViews = webContentsViewManager.hasActiveViews()
    if (!hasOtherActiveViews) {
      hasActiveThirdPartyPlugin = false
    }

    return { success: true }
  })

  // 更新插件视图位置
  ipcMain.handle(
    'plugin:updateBounds',
    async (
      _,
      pluginId: string,
      bounds: { x: number; y: number; width: number; height: number }
    ) => {
      webContentsViewManager.updatePluginViewBounds(pluginId, bounds)
      return { success: true }
    }
  )

  ipcMain.handle('app:getPath', async (_, name: 'home' | 'appData' | 'userData' | 'temp') => {
    return app.getPath(name)
  })

  // 初始化 PluginAPI 和 NodeAPI（它们在构造函数中注册了自己的 IPC handlers）
  console.log('✅ PluginAPI 已初始化:', pluginAPI ? 'OK' : 'FAIL')
  console.log('✅ NodeAPI 已初始化:', nodeAPI ? 'OK' : 'FAIL')
}
