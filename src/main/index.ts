import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PluginManager } from './plugin-manager'
import { PluginAPI } from './plugin-api'
import { NodeAPI } from './node-api'
import { registerDevModeHandlers } from './ipc-handlers'
import { pluginWindowManager } from './plugin-window'

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

  // 注册自定义协议 plugin://
  protocol.registerBufferProtocol('plugin', async (request, callback) => {
    try {
      // 解析 URL: plugin://plugin-id/path/to/file
      const url = request.url.substring('plugin://'.length)
      const [pluginId, ...pathParts] = url.split('/')
      const filePath = pathParts.join('/')

      // 获取插件目录
      const pluginDir = join(app.getPath('userData'), 'plugins', pluginId)
      const fullPath = join(pluginDir, filePath)

      // 读取文件
      const data = await readFile(fullPath)

      // 根据文件扩展名设置 MIME 类型
      let mimeType = 'text/plain'
      if (filePath.endsWith('.html')) {
        mimeType = 'text/html'
      } else if (filePath.endsWith('.js')) {
        mimeType = 'application/javascript'
      } else if (filePath.endsWith('.css')) {
        mimeType = 'text/css'
      } else if (filePath.endsWith('.json')) {
        mimeType = 'application/json'
      } else if (filePath.endsWith('.png')) {
        mimeType = 'image/png'
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        mimeType = 'image/jpeg'
      } else if (filePath.endsWith('.svg')) {
        mimeType = 'image/svg+xml'
      }

      callback({
        data: Buffer.from(data),
        mimeType
      })
    } catch (error) {
      console.error('加载插件资源失败:', error)
      callback({ data: Buffer.from(''), mimeType: 'text/plain' })
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
    if (result.success && result.htmlPath) {
      // 读取 HTML 内容并转换资源路径为 plugin:// 协议
      try {
        let html = await readFile(result.htmlPath, 'utf-8')
        
        // 替换相对路径为 plugin:// 协议
        html = html.replace(/src="\.\/assets\//g, `src="plugin://${pluginId}/dist/assets/`)
        html = html.replace(/href="\.\/assets\//g, `href="plugin://${pluginId}/dist/assets/`)
        
        // 添加 CSP meta 标签允许 plugin:// 协议
        if (!html.includes('Content-Security-Policy')) {
          html = html.replace(
            '<head>',
            '<head>\n  <meta http-equiv="Content-Security-Policy" content="default-src \'self\' plugin:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' plugin:; style-src \'self\' \'unsafe-inline\' plugin:; img-src \'self\' data: plugin:; font-src \'self\' data: plugin:; connect-src \'self\' plugin:;">'
          )
        } else {
          // 如果已有 CSP，添加 plugin: 到各个指令
          html = html.replace(/script-src ([^;]+);/g, 'script-src $1 plugin:;')
          html = html.replace(/style-src ([^;]+);/g, 'style-src $1 plugin:;')
          html = html.replace(/default-src ([^;]+);/g, 'default-src $1 plugin:;')
        }
        
        return {
          ...result,
          html // 返回修改后的 HTML
        }
      } catch (error) {
        console.error('读取插件 HTML 失败:', error)
        return result
      }
    }
    return result
  })

  // 打开插件窗口
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

    if (result.devUrl) {
      // 开发模式
      console.log('🔥 打开开发模式插件:', pluginId, result.devUrl)
      pluginWindowManager.openDevPlugin(pluginId, result.devUrl, plugin.metadata.name)
    } else if (result.htmlPath) {
      // 生产模式
      console.log('🔥 打开生产模式插件:', pluginId, result.htmlPath)
      pluginWindowManager.openPlugin(pluginId, result.htmlPath, plugin.metadata.name)
    }

    return { success: true }
  })

  // 关闭插件窗口
  ipcMain.handle('plugin:close', async (_, pluginId: string) => {
    pluginWindowManager.closePlugin(pluginId)
    return { success: true }
  })

  ipcMain.handle('app:getPath', async (_, name: 'home' | 'appData' | 'userData' | 'temp') => {
    return app.getPath(name)
  })

  // 初始化 PluginAPI 和 NodeAPI（它们在构造函数中注册了自己的 IPC handlers）
  console.log('✅ PluginAPI 已初始化:', pluginAPI ? 'OK' : 'FAIL')
  console.log('✅ NodeAPI 已初始化:', nodeAPI ? 'OK' : 'FAIL')
}
