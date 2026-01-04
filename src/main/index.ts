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
import { settingsManager } from './settings-manager'
import { dbManager } from './db-manager'
import { searchWindowManager } from './search-window-manager'
import { pathToFileURL } from 'url'
import { createLogger } from '../shared/logger'

const logger = createLogger('main')

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
      searchWindowManager.setMainWindow(mainWindow)
    }

    // 注册全局快捷键
    registerGlobalShortcuts()
  })

  // 拦截 Cmd+W / Ctrl+W 快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 检查是否是 Cmd+W (Mac) 或 Ctrl+W (Windows/Linux)
    if (input.type === 'keyDown' && input.key === 'w' && (input.meta || input.control)) {
      // 阻止默认行为，让渲染进程处理
      event.preventDefault()
      // 通知渲染进程处理关闭标签或窗口
      mainWindow?.webContents.send('handle-close-tab')
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
        logger.error({ path: fullPath }, '❌ 插件文件不存在')
        return new Response('File not found', { status: 404 })
      }

      // 使用 net.fetch 加载本地文件
      return net.fetch(pathToFileURL(fullPath).href)
    } catch (error) {
      logger.error({ err: error }, '❌ 加载插件资源失败')
      return new Response('Internal error', { status: 500 })
    }
  })

  // 立即设置 IPC 处理器（不等待其他初始化）
  setupIpcHandlers()

  // 立即创建窗口（不等待插件初始化）
  createWindow()

  // 异步初始化插件系统（不阻塞窗口显示）
  setImmediate(() => {
    logger.info('🔄 开始异步初始化插件系统...')

    // 预热插件缓存（异步）
    pluginManager.warmupCache()

    // 初始化已安装插件的权限（异步）
    pluginManager.initializePermissions()

    logger.info('✅ 插件系统初始化完成')
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
  // 清理搜索窗口
  searchWindowManager.destroy()

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

    // 检查视图是否已存在，不存在才创建
    const existingView = webContentsViewManager.getPluginView(pluginId)
    if (!existingView) {
      webContentsViewManager.createPluginView(pluginId, pluginUrl)
    }

    webContentsViewManager.showPluginView(pluginId)

    return { success: true }
  })

  ipcMain.handle('plugin:close', async (_, pluginId: string) => {
    webContentsViewManager.hidePluginView(pluginId)
    return { success: true }
  })

  ipcMain.handle('plugin:destroy', async (_, pluginId: string) => {
    webContentsViewManager.removePluginView(pluginId)
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

  // 设置相关 IPC
  ipcMain.handle('settings:getAll', () => {
    return settingsManager.getAll()
  })

  ipcMain.handle('settings:getShortcuts', () => {
    return settingsManager.getShortcuts()
  })

  ipcMain.handle(
    'settings:setShortcut',
    (_, key: 'toggleWindow' | 'globalSearch', value: string) => {
      const oldShortcuts = settingsManager.getShortcuts()

      // 先取消旧快捷键
      if (key === 'toggleWindow' && oldShortcuts.toggleWindow !== value) {
        shortcutManager.unregister(oldShortcuts.toggleWindow)
        // 注册新快捷键
        shortcutManager.register('system', value, () => {
          shortcutManager.toggleMainWindow()
        })
      }

      if (key === 'globalSearch' && oldShortcuts.globalSearch !== value) {
        shortcutManager.unregister(oldShortcuts.globalSearch)
        // 注册新快捷键
        shortcutManager.register('system', value, () => {
          if (mainWindow) {
            if (!mainWindow.isVisible()) {
              mainWindow.show()
              mainWindow.focus()
            }
            // 通知渲染进程打开全局搜索
            mainWindow.webContents.send('open-global-search')
          }
        })
      }

      settingsManager.setShortcut(key, value)
      return { success: true }
    }
  )

  ipcMain.handle('settings:update', (_, partial) => {
    settingsManager.update(partial)
    return { success: true }
  })

  ipcMain.handle('settings:reset', () => {
    // 先清理所有快捷键
    shortcutManager.cleanup()
    // 重置设置
    settingsManager.resetToDefaults()
    // 重新注册默认快捷键
    registerGlobalShortcuts()
    return { success: true }
  })

  // 数据库相关 IPC
  ipcMain.handle('db:addFavorite', (_, pluginId: string) => {
    dbManager.addFavorite(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:removeFavorite', (_, pluginId: string) => {
    dbManager.removeFavorite(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:isFavorite', (_, pluginId: string) => {
    return dbManager.isFavorite(pluginId)
  })

  ipcMain.handle('db:getFavorites', () => {
    return dbManager.getFavorites()
  })

  ipcMain.handle('db:addRecent', (_, pluginId: string) => {
    dbManager.addRecent(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:getRecents', (_, limit?: number) => {
    return dbManager.getRecents(limit)
  })

  ipcMain.handle('db:clearRecents', () => {
    dbManager.clearRecents()
    return { success: true }
  })

  // 窗口控制
  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  // 搜索窗口相关
  ipcMain.handle('search:open-plugin', (_, pluginId: string) => {
    searchWindowManager.openPluginAndHide(pluginId)
    return { success: true }
  })

  ipcMain.handle('search:close', () => {
    searchWindowManager.hideSearchWindow()
    return { success: true }
  })

  // 延迟初始化 API（不阻塞启动）
  setImmediate(() => {
    logger.info(
      { pluginAPI: pluginAPI ? 'OK' : 'FAIL', nodeAPI: nodeAPI ? 'OK' : 'FAIL' },
      '✅ API 已初始化'
    )
  })
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcuts(): void {
  const shortcuts = settingsManager.getShortcuts()

  // 延迟注册快捷键，避免阻塞窗口显示
  setImmediate(() => {
    // 注册显示/隐藏窗口快捷键
    const toggleSuccess = shortcutManager.register('system', shortcuts.toggleWindow, () => {
      shortcutManager.toggleMainWindow()
    })
    logger.info(
      { shortcut: shortcuts.toggleWindow, success: toggleSuccess },
      '✅ 已注册全局快捷键: 显示/隐藏窗口'
    )

    // 注册全局搜索快捷键
    logger.info({ shortcut: shortcuts.globalSearch }, '🔄 正在注册全局搜索快捷键...')
    const searchSuccess = shortcutManager.register('system', shortcuts.globalSearch, () => {
      logger.info('🎯 全局搜索快捷键被触发')

      // 检查主窗口是否存在且未销毁
      if (!mainWindow || mainWindow.isDestroyed()) {
        logger.warn('⚠️ 主窗口已销毁，无法响应快捷键')
        return
      }

      // 检查主窗口是否可见且聚焦
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        // 主窗口可见且聚焦，使用应用内搜索
        logger.info('📱 主窗口可见，使用应用内搜索')
        mainWindow.webContents.send('open-global-search')
      } else {
        // 主窗口隐藏或未聚焦，显示独立搜索窗口
        logger.info('🔍 主窗口隐藏，显示搜索窗口')
        searchWindowManager.showSearchWindow()
      }
    })

    if (searchSuccess) {
      logger.info({ shortcut: shortcuts.globalSearch }, '✅ 已注册全局快捷键: 全局搜索')
    } else {
      logger.warn(
        { shortcut: shortcuts.globalSearch },
        '❌ 注册全局搜索快捷键失败，可能被系统占用。请在设置中更换快捷键。'
      )
      // 通知渲染进程快捷键注册失败
      if (mainWindow) {
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow?.webContents.send(
            'shortcut-register-failed',
            'globalSearch',
            shortcuts.globalSearch
          )
        })
      }
    }
  })
}
