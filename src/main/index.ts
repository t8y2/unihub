import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  protocol,
  net,
  Menu,
  Tray,
  nativeImage
} from 'electron'
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
import type { AppSettings } from './settings-manager'
import { lmdbManager } from './lmdb-manager'
import { searchWindowManager } from './search-window-manager'
import { updaterManager } from './updater-manager'
import { pathToFileURL } from 'url'
import { createLogger, closeLogger } from '../shared/logger'
import { appScanner } from './app-scanner'

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

// 标志：应用是否正在退出
let isQuitting = false
let tray: Tray | null = null

// 读取最新的通用设置（避免缓存导致状态不同步）
const getGeneralSettings = (): AppSettings['general'] => settingsManager.getGeneral()

// 切换主窗口显示/隐藏（用于托盘交互）
const toggleMainWindowVisibility = (): void => {
  if (!mainWindow || mainWindow.isDestroyed()) return

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    if (process.platform === 'darwin') {
      // macOS: 如果应用被隐藏，先唤起应用再显示窗口
      app.show()
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
  }

  updateTrayMenu()
}

// 根据窗口状态更新托盘菜单
const updateTrayMenu = (): void => {
  if (!tray) return

  const isVisible = mainWindow?.isVisible() ?? false
  const menu = Menu.buildFromTemplate([
    {
      label: isVisible ? '隐藏窗口' : '显示窗口',
      click: () => toggleMainWindowVisibility()
    },
    { type: 'separator' as const },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(menu)
}

// 初始化托盘图标
const createTray = (): void => {
  if (tray) {
    updateTrayMenu()
    return
  }

  const trayImage = nativeImage.createFromPath(icon)
  if (process.platform === 'darwin') {
    trayImage.setTemplateImage(true)
  }

  tray = new Tray(trayImage)
  tray.setToolTip('UniHub')
  tray.on('click', () => toggleMainWindowVisibility())
  tray.on('right-click', () => {
    updateTrayMenu()
    tray?.popUpContextMenu()
  })

  updateTrayMenu()
  logger.info('托盘图标已创建')
}

// 移除托盘图标
const destroyTray = (): void => {
  if (!tray) return

  tray.destroy()
  tray = null
  logger.info('托盘图标已移除')
}

// 根据设置控制开机自启动
const applyLaunchAtStartupSetting = (enabled: boolean): void => {
  if (process.platform !== 'darwin' && process.platform !== 'win32') {
    logger.info('当前平台不支持开机自启动设置')
    return
  }

  if (process.platform === 'darwin') {
    app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: false })
  } else {
    app.setLoginItemSettings({ openAtLogin: enabled })
  }

  logger.info({ enabled }, '已应用开机自启动设置')
}

// 根据设置控制最小化到托盘
const applyMinimizeToTraySetting = (enabled: boolean): void => {
  if (enabled) {
    createTray()
  } else {
    if (mainWindow && !mainWindow.isVisible()) {
      if (process.platform === 'darwin') {
        // macOS: 解除隐藏后再显示窗口
        app.show()
      }
      mainWindow.show()
    }
    destroyTray()
  }
}

// 统一应用通用设置的副作用
const applyGeneralSettings = (general: Partial<AppSettings['general']>): void => {
  if (typeof general.launchAtStartup === 'boolean') {
    applyLaunchAtStartupSetting(general.launchAtStartup)
  }
  if (typeof general.minimizeToTray === 'boolean') {
    applyMinimizeToTraySetting(general.minimizeToTray)
  }
}

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
      webSecurity: false, // 允许加载自定义协议
      // 生产环境禁用开发者工具
      devTools: process.env.NODE_ENV === 'development'
    }
  })

  let shortcutsRegistered = false
  let updateCheckScheduled = false

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // 设置主窗口到 WebContentsView 管理器
    if (mainWindow) {
      webContentsViewManager.setMainWindow(mainWindow)
      shortcutManager.setMainWindow(mainWindow)
      searchWindowManager.setMainWindow(mainWindow)
      updaterManager.setMainWindow(mainWindow)
    }

    // 注册全局快捷键（只注册一次）
    if (!shortcutsRegistered) {
      shortcutsRegistered = true
      registerGlobalShortcuts()
    }

    // 启动后 3 秒检查更新（静默，只检查一次）
    if (!updateCheckScheduled) {
      updateCheckScheduled = true
      setTimeout(() => {
        updaterManager.checkForUpdates(true)
      }, 3000)
    }
  })

  // 监听窗口大小变化，通知渲染进程更新布局
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-resized')
    }
  })

  // 拦截窗口关闭事件
  mainWindow.on('close', (event) => {
    // 只有真正退出时才允许关闭，其他情况都阻止
    if (isQuitting) {
      logger.info('窗口正在关闭')
      return
    }

    const { minimizeToTray } = getGeneralSettings()
    if (minimizeToTray) {
      // 关闭按钮触发时隐藏到托盘
      event.preventDefault()
      if (process.platform === 'darwin') {
        // macOS: 使用应用级隐藏，确保窗口真正消失
        mainWindow?.hide()
        app.hide()
      } else {
        mainWindow?.hide()
      }
      createTray()
      logger.info('窗口已隐藏到托盘（关闭按钮）')
      return
    }
    logger.info('窗口正在关闭')
  })

  // 最小化到托盘
  mainWindow.on('minimize', () => {
    const { minimizeToTray } = getGeneralSettings()
    if (!minimizeToTray) return

    // 使用隐藏模拟最小化到托盘
    if (process.platform === 'darwin') {
      // macOS: 使用应用级隐藏，行为更接近托盘最小化
      mainWindow?.hide()
      app.hide()
    } else {
      mainWindow?.hide()
    }
    createTray()
    logger.info('窗口已隐藏到托盘（最小化）')
  })

  // 监听显示/隐藏以更新托盘菜单
  mainWindow.on('show', () => updateTrayMenu())
  mainWindow.on('hide', () => updateTrayMenu())

  // 拦截 Cmd+W / Ctrl+W 快捷键和 ESC 键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 检查是否是 Cmd+W (Mac) 或 Ctrl+W (Windows/Linux)
    if (input.type === 'keyDown' && input.key === 'w' && (input.meta || input.control)) {
      logger.info('主窗口捕获 Cmd+W')
      // 阻止默认行为，让渲染进程处理
      event.preventDefault()
      // 通知渲染进程处理关闭标签
      mainWindow?.webContents.send('handle-close-tab')
    }

    // 拦截 ESC 键，用于关闭搜索
    if (input.type === 'keyDown' && input.key === 'Escape') {
      // 通知渲染进程处理 ESC 键（可能是关闭搜索）
      mainWindow?.webContents.send('handle-escape-key')
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
  const appStartTime = performance.now()

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
        logger.error({ path: fullPath }, '插件文件不存在')
        return new Response('File not found', { status: 404 })
      }

      // 使用 net.fetch 加载本地文件
      return net.fetch(pathToFileURL(fullPath).href)
    } catch (error) {
      logger.error({ err: error }, '加载插件资源失败')
      return new Response('Internal error', { status: 500 })
    }
  })

  // 立即设置 IPC 处理器（不等待其他初始化）
  setupIpcHandlers()

  // 立即创建窗口（不等待插件初始化）
  createWindow()

  // 启动时应用通用设置（开机自启动/最小化到托盘）
  applyGeneralSettings(getGeneralSettings())

  // 异步初始化插件系统（不阻塞窗口显示）
  setImmediate(() => {
    const pluginInitStart = performance.now()
    logger.info('开始异步初始化插件系统...')

    // 预热插件缓存（异步）
    pluginManager.warmupCache()

    // 初始化已安装插件的权限（异步）
    pluginManager.initializePermissions()

    const pluginInitEnd = performance.now()
    logger.info(`插件系统初始化完成，耗时 ${(pluginInitEnd - pluginInitStart).toFixed(2)}ms`)
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // macOS: 点击 Dock 图标时
    if (BrowserWindow.getAllWindows().length === 0) {
      // 没有窗口，创建新窗口
      createWindow()
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      // 窗口存在但隐藏，显示它
      mainWindow.show()
      mainWindow.focus()
      logger.info('👁窗口已显示（通过 Dock）')
    }

    updateTrayMenu()
  })

  const appEndTime = performance.now()
  logger.info(`应用启动完成，总耗时 ${(appEndTime - appStartTime).toFixed(2)}ms`)
})

app.on('window-all-closed', () => {
  // 清理搜索窗口
  searchWindowManager.destroy()

  if (process.platform !== 'darwin') {
    // 非 macOS 平台：关闭所有窗口时退出应用
    app.quit()
  }
  // macOS 平台：关闭窗口后应用仍在后台运行，保留快捷键以便重新打开窗口
})

// 应用退出前清理资源
app.on('before-quit', async () => {
  // 设置退出标志，允许窗口真正关闭
  isQuitting = true
  // 清理所有快捷键
  shortcutManager.cleanup()
  // 关闭日志系统
  try {
    await closeLogger()
  } catch {
    // 忽略日志关闭错误
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

  // 检查插件更新
  ipcMain.handle('plugin:checkUpdates', async (_, marketplaceUrl: string) => {
    return await pluginManager.checkPluginUpdates(marketplaceUrl)
  })

  // 更新插件
  ipcMain.handle('plugin:update', async (_, pluginId: string, downloadUrl: string) => {
    return await pluginManager.updatePlugin(pluginId, downloadUrl)
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

  ipcMain.handle('sidebar:collapsed', async (_, collapsed: boolean) => {
    webContentsViewManager.setSidebarCollapsed(collapsed)
    return { success: true }
  })

  // 监听实时布局更新（用于侧边栏动画过程）
  ipcMain.on(
    'update-plugin-view-layout',
    (_, { sidebarWidth, titleBarHeight }: { sidebarWidth: number; titleBarHeight: number }) => {
      webContentsViewManager.updateCurrentPluginLayout(sidebarWidth, titleBarHeight)
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

  ipcMain.handle('settings:update', (_, partial: Partial<AppSettings>) => {
    settingsManager.update(partial)
    if (partial.general) {
      applyGeneralSettings(partial.general)
    }
    return { success: true }
  })

  ipcMain.handle('settings:reset', () => {
    // 先清理所有快捷键
    shortcutManager.cleanup()
    // 重置设置
    settingsManager.resetToDefaults()
    // 重新应用通用设置
    applyGeneralSettings(settingsManager.getGeneral())
    // 重新注册默认快捷键
    registerGlobalShortcuts()
    return { success: true }
  })

  // 数据库相关 IPC
  ipcMain.handle('db:addFavorite', (_, pluginId: string) => {
    lmdbManager.addFavorite(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:removeFavorite', (_, pluginId: string) => {
    lmdbManager.removeFavorite(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:isFavorite', (_, pluginId: string) => {
    return lmdbManager.isFavorite(pluginId)
  })

  ipcMain.handle('db:getFavorites', () => {
    return lmdbManager.getFavorites()
  })

  ipcMain.handle('db:addRecent', (_, pluginId: string) => {
    lmdbManager.addRecent(pluginId)
    return { success: true }
  })

  ipcMain.handle('db:getRecents', (_, limit?: number) => {
    return lmdbManager.getRecents(limit)
  })

  ipcMain.handle('db:clearRecents', () => {
    lmdbManager.clearRecents()
    return { success: true }
  })

  // 窗口控制
  ipcMain.on('window:close', () => {
    const { minimizeToTray } = getGeneralSettings()
    if (minimizeToTray) {
      // 开启最小化到托盘时，统一隐藏窗口
      if (process.platform === 'darwin') {
        // macOS: 使用应用级隐藏，确保窗口真正消失
        mainWindow?.hide()
        app.hide()
      } else {
        mainWindow?.hide()
      }
      createTray()
      logger.info('窗口已隐藏到托盘（通过 IPC）')
      return
    }

    // 未开启最小化到托盘时，允许正常关闭
    mainWindow?.close()
  })

  // 关闭窗口（从渲染进程触发，用于 cmd+w 关闭最后一个标签）
  ipcMain.on('close-window', () => {
    const { minimizeToTray } = getGeneralSettings()
    if (minimizeToTray) {
      // 开启最小化到托盘时，统一隐藏窗口
      if (process.platform === 'darwin') {
        // macOS: 使用应用级隐藏，确保窗口真正消失
        mainWindow?.hide()
        app.hide()
      } else {
        mainWindow?.hide()
      }
      createTray()
      logger.info('窗口已隐藏到托盘（通过 close-window）')
      return
    }

    // 未开启最小化到托盘时，允许正常关闭
    mainWindow?.close()
  })

  // 聚焦主窗口（用于切换到内置组件时）
  ipcMain.on('focus-main-window', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.focus()
    }
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

  // 快速获取应用列表（不包含图标）
  ipcMain.handle('apps:listQuick', async () => {
    try {
      const apps = await appScanner.getAppsQuick()
      return { success: true, data: apps }
    } catch (error) {
      logger.error({ err: error }, '快速获取应用列表失败')
      return { success: false, error: '快速获取应用列表失败' }
    }
  })

  // 批量预加载应用图标
  ipcMain.handle('apps:preloadIcons', async (_, appPaths: string[]) => {
    try {
      const iconMap = await appScanner.preloadIcons(appPaths)
      // 转换 Map 为普通对象以便序列化
      const iconData = Object.fromEntries(iconMap)
      return { success: true, data: iconData }
    } catch (error) {
      logger.error({ err: error, appPaths }, '批量预加载图标失败')
      return { success: false, error: '批量预加载图标失败' }
    }
  })

  // 本地应用相关
  ipcMain.handle('apps:list', async () => {
    try {
      const apps = await appScanner.getApps()
      return { success: true, data: apps }
    } catch (error) {
      logger.error({ err: error }, '获取应用列表失败')
      return { success: false, error: '获取应用列表失败' }
    }
  })

  ipcMain.handle('apps:open', async (_, appPath: string) => {
    try {
      await shell.openPath(appPath)
      return { success: true }
    } catch (error) {
      logger.error({ err: error, appPath }, '打开应用失败')
      return { success: false, error: '打开应用失败' }
    }
  })

  ipcMain.handle('apps:refresh', async () => {
    try {
      await appScanner.refresh()
      const apps = await appScanner.getApps()
      return { success: true, data: apps }
    } catch (error) {
      logger.error({ err: error }, '刷新应用列表失败')
      return { success: false, error: '刷新应用列表失败' }
    }
  })

  // 按需获取应用图标
  ipcMain.handle('apps:getIcon', async (_, appPath: string) => {
    try {
      const icon = await appScanner.getAppIcon(appPath)
      return { success: true, data: icon }
    } catch (error) {
      logger.error({ err: error, appPath }, '获取应用图标失败')
      return { success: false, error: '获取应用图标失败' }
    }
  })

  // 右键菜单相关
  ipcMain.handle('tab:show-context-menu', (event, tabId: string, index: number, total: number) => {
    const template = [
      {
        label: '关闭',
        click: () => {
          event.sender.send('tab:close', tabId)
        }
      },
      {
        label: '关闭其他标签',
        enabled: total > 1,
        click: () => {
          event.sender.send('tab:close-others', tabId)
        }
      },
      { type: 'separator' as const },
      {
        label: '关闭左侧标签',
        enabled: index > 0,
        click: () => {
          event.sender.send('tab:close-left', tabId)
        }
      },
      {
        label: '关闭右侧标签',
        enabled: index < total - 1,
        click: () => {
          event.sender.send('tab:close-right', tabId)
        }
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) || undefined })
    return { success: true }
  })

  // 应用内搜索相关（浮层模式）
  ipcMain.handle('plugin:hide-for-search', () => {
    webContentsViewManager.hideCurrentPluginForSearch()
    return { success: true }
  })

  ipcMain.handle('plugin:restore-after-search', () => {
    webContentsViewManager.restorePluginAfterSearch()
    return { success: true }
  })

  // 更新相关 IPC
  ipcMain.handle('updater:check', async () => {
    await updaterManager.checkForUpdates(false)
    return { success: true }
  })

  ipcMain.handle('updater:status', () => {
    return updaterManager.getUpdateStatus()
  })

  // 延迟初始化 API（不阻塞启动）
  setImmediate(() => {
    logger.info(
      { pluginAPI: pluginAPI ? 'OK' : 'FAIL', nodeAPI: nodeAPI ? 'OK' : 'FAIL' },
      'API 已初始化'
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
      '已注册全局快捷键: 显示/隐藏窗口'
    )

    // 注册全局搜索快捷键
    logger.info({ shortcut: shortcuts.globalSearch }, '正在注册全局搜索快捷键...')
    const searchSuccess = shortcutManager.register('system', shortcuts.globalSearch, () => {
      logger.info('全局搜索快捷键被触发')

      // 检查主窗口是否存在且未销毁
      if (!mainWindow || mainWindow.isDestroyed()) {
        logger.warn('⚠主窗口已销毁，无法响应快捷键')
        return
      }

      // 检查主窗口是否可见且聚焦
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        // 主窗口可见且聚焦，使用应用内搜索
        logger.info('主窗口可见，使用应用内搜索')
        mainWindow.webContents.send('open-global-search')
      } else {
        // 主窗口隐藏或未聚焦，显示独立搜索窗口
        logger.info('主窗口隐藏，显示搜索窗口')
        searchWindowManager.showSearchWindow()
      }
    })

    if (searchSuccess) {
      logger.info({ shortcut: shortcuts.globalSearch }, '已注册全局快捷键: 全局搜索')
    } else {
      logger.warn(
        { shortcut: shortcuts.globalSearch },
        '注册全局搜索快捷键失败，可能被系统占用。请在设置中更换快捷键。'
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
