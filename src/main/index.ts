import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PluginManager } from './plugin-manager'
import { PluginAPI } from './plugin-api'
import { NodeAPI } from './node-api'
import { registerDevModeHandlers } from './ipc-handlers'
import { webContentsViewManager } from './webcontents-view-manager'
import { shortcutManager } from './shortcut-manager'
import { pathToFileURL } from 'url'

// 标记是否有活动的第三方插件
let hasActiveThirdPartyPlugin = false

// 在开发环境中禁用安全警告
if (is.dev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

// 注册自定义协议权限（必须在 app ready 之前）
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'plugin',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

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
      shortcutManager.setMainWindow(mainWindow)
    }

    // 注册全局快捷键
    registerGlobalShortcuts()
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

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.unihub.app')

  // 使用新的 protocol.handle API 注册自定义协议
  protocol.handle('plugin', (request) => {
    try {
      let url = request.url.substring('plugin://'.length)
      const queryIndex = url.indexOf('?')
      if (queryIndex !== -1) {
        url = url.substring(0, queryIndex)
      }
      const [pluginId, ...pathParts] = url.split('/')
      const filePath = pathParts.join('/')
      const pluginDir = join(app.getPath('userData'), 'plugins', pluginId)
      const fullPath = join(pluginDir, filePath)

      // 检查文件是否存在
      if (!existsSync(fullPath)) {
        console.error('❌ 插件文件不存在:', fullPath)
        return new Response('File not found', { status: 404 })
      }

      // 使用 net.fetch 加载本地文件
      return net.fetch(pathToFileURL(fullPath).href)
    } catch (error) {
      console.error('❌ 加载插件资源失败:', error)
      return new Response('Internal error', { status: 500 })
    }
  })

  // 立即设置 IPC 处理器（不等待其他初始化）
  setupIpcHandlers()

  // 立即创建窗口（不等待插件初始化）
  createWindow()

  // 异步初始化插件系统（不阻塞窗口显示）
  setImmediate(() => {
    console.log('🔄 开始异步初始化插件系统...')
    
    // 预热插件缓存（异步）
    pluginManager.warmupCache()
    
    // 初始化已安装插件的权限（异步）
    pluginManager.initializePermissions()
    
    console.log('✅ 插件系统初始化完成')
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // 清理快捷键
  shortcutManager.cleanup()
  
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
      if (result.devUrl) {
        return {
          ...result,
          pluginUrl: result.devUrl
        }
      } else if (result.htmlPath) {
        return {
          ...result,
          pluginUrl: `plugin://${pluginId}/dist/index.html`
        }
      }
    }
    return result
  })

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
      pluginUrl = result.devUrl
    } else if (result.htmlPath) {
      pluginUrl = `plugin://${pluginId}/dist/index.html`
    } else {
      return { success: false, message: '插件 URL 不正确' }
    }

    webContentsViewManager.createPluginView(pluginId, pluginUrl)
    webContentsViewManager.showPluginView(pluginId)
    hasActiveThirdPartyPlugin = true

    return { success: true }
  })

  ipcMain.handle('plugin:close', async (_, pluginId: string) => {
    webContentsViewManager.hidePluginView(pluginId)
    const hasOtherActiveViews = webContentsViewManager.hasActiveViews()
    if (!hasOtherActiveViews) {
      hasActiveThirdPartyPlugin = false
    }
    return { success: true }
  })

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

  // 延迟初始化 API（不阻塞启动）
  setImmediate(() => {
    console.log('✅ PluginAPI 已初始化:', pluginAPI ? 'OK' : 'FAIL')
    console.log('✅ NodeAPI 已初始化:', nodeAPI ? 'OK' : 'FAIL')
  })
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcuts(): void {
  const toggleShortcut = process.platform === 'darwin' ? 'Command+Shift+Space' : 'Ctrl+Shift+Space'
  
  // 延迟注册快捷键，避免阻塞窗口显示
  setImmediate(() => {
    shortcutManager.register('system', toggleShortcut, () => {
      shortcutManager.toggleMainWindow()
    })
    console.log(`✅ 已注册全局快捷键: ${toggleShortcut}`)
  })
}
