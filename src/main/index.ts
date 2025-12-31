import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PluginManager } from './plugin-manager'
import { PluginAPI } from './plugin-api'
import { registerDevModeHandlers } from './ipc-handlers'

// 在开发环境中禁用安全警告
if (is.dev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

let mainWindow: BrowserWindow | null = null
const pluginManager = new PluginManager()
const pluginAPI = new PluginAPI()

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
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
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

  pluginManager.setMainWindow(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.unihub.app')

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

function setupIpcHandlers() {
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
    return await pluginManager.loadPlugin(pluginId)
  })

  ipcMain.handle(
    'plugin:backend-call',
    async (_, pluginId: string, functionName: string, args: string) => {
      return await pluginManager.callPluginBackend(pluginId, functionName, args)
    }
  )

  ipcMain.handle('fs:readFile', async (_, path: string) => {
    const fs = await import('fs/promises')
    return await fs.readFile(path, 'utf-8')
  })

  ipcMain.handle('fs:writeFile', async (_, path: string, content: string) => {
    const fs = await import('fs/promises')
    return await fs.writeFile(path, content, 'utf-8')
  })

  ipcMain.handle('app:getPath', async (_, name: string) => {
    return app.getPath(name as any)
  })
}
