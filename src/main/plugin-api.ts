import { ipcMain, dialog, clipboard, shell, nativeImage } from 'electron'
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

/**
 * 插件 API 处理器
 * 提供文件系统、剪贴板、通知等能力
 */
export class PluginAPI {
  constructor() {
    this.registerHandlers()
  }

  private registerHandlers() {
    // 文件系统 API
    ipcMain.handle('plugin-api:fs:readFile', async (_, path: string) => {
      try {
        const content = await readFile(path, 'utf-8')
        return { success: true, data: content }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:writeFile', async (_, path: string, content: string) => {
      try {
        await writeFile(path, content, 'utf-8')
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:readDir', async (_, path: string) => {
      try {
        const files = await readdir(path)
        return { success: true, data: files }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:exists', async (_, path: string) => {
      return { success: true, data: existsSync(path) }
    })

    ipcMain.handle('plugin-api:fs:stat', async (_, path: string) => {
      try {
        const stats = await stat(path)
        return {
          success: true,
          data: {
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime.toISOString()
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:mkdir', async (_, path: string) => {
      try {
        await mkdir(path, { recursive: true })
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:selectFile', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openFile']
        })
        return { success: true, data: result.filePaths[0] || null }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:fs:selectDirectory', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        })
        return { success: true, data: result.filePaths[0] || null }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // 剪贴板 API
    ipcMain.handle('plugin-api:clipboard:readText', () => {
      return { success: true, data: clipboard.readText() }
    })

    ipcMain.handle('plugin-api:clipboard:writeText', (_, text: string) => {
      clipboard.writeText(text)
      return { success: true }
    })

    ipcMain.handle('plugin-api:clipboard:readImage', () => {
      const image = clipboard.readImage()
      if (image.isEmpty()) {
        return { success: true, data: null }
      }
      return { success: true, data: image.toDataURL() }
    })

    ipcMain.handle('plugin-api:clipboard:writeImage', (_, dataUrl: string) => {
      try {
        const image = nativeImage.createFromDataURL(dataUrl)
        clipboard.writeImage(image)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // 系统 API
    ipcMain.handle('plugin-api:system:getInfo', () => {
      return {
        success: true,
        data: {
          platform: process.platform,
          arch: process.arch,
          version: app.getVersion(),
          appPath: app.getAppPath(),
          userDataPath: app.getPath('userData'),
          tempPath: app.getPath('temp')
        }
      }
    })

    ipcMain.handle('plugin-api:system:openExternal', async (_, url: string) => {
      try {
        await shell.openExternal(url)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:system:showInFolder', async (_, path: string) => {
      try {
        shell.showItemInFolder(path)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // HTTP API（避免 CORS）
    ipcMain.handle('plugin-api:http:request', async (_, options: any) => {
      try {
        const response = await fetch(options.url, {
          method: options.method || 'GET',
          headers: options.headers,
          body: options.body ? JSON.stringify(options.body) : undefined
        })

        const data = await response.text()
        return {
          success: true,
          data: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: data
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // 存储 API
    const storageDir = join(app.getPath('userData'), 'plugin-storage')
    if (!existsSync(storageDir)) {
      mkdir(storageDir, { recursive: true })
    }

    ipcMain.handle('plugin-api:storage:get', async (_, pluginId: string, key: string) => {
      try {
        const filePath = join(storageDir, `${pluginId}.json`)
        if (!existsSync(filePath)) {
          return { success: true, data: null }
        }

        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        return { success: true, data: data[key] || null }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle(
      'plugin-api:storage:set',
      async (_, pluginId: string, key: string, value: any) => {
        try {
          const filePath = join(storageDir, `${pluginId}.json`)
          let data = {}

          if (existsSync(filePath)) {
            const content = await readFile(filePath, 'utf-8')
            data = JSON.parse(content)
          }

          data[key] = value
          await writeFile(filePath, JSON.stringify(data, null, 2))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      }
    )

    ipcMain.handle('plugin-api:storage:delete', async (_, pluginId: string, key: string) => {
      try {
        const filePath = join(storageDir, `${pluginId}.json`)
        if (!existsSync(filePath)) {
          return { success: true }
        }

        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        delete data[key]
        await writeFile(filePath, JSON.stringify(data, null, 2))
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:storage:allKeys', async (_, pluginId: string) => {
      try {
        const filePath = join(storageDir, `${pluginId}.json`)
        if (!existsSync(filePath)) {
          return { success: true, data: [] }
        }

        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        return { success: true, data: Object.keys(data) }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('plugin-api:storage:clear', async (_, pluginId: string) => {
      try {
        const filePath = join(storageDir, `${pluginId}.json`)
        if (existsSync(filePath)) {
          await writeFile(filePath, '{}')
        }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // 通知 API
    ipcMain.handle('plugin-api:notification:show', async (_, options: any) => {
      try {
        const { Notification } = await import('electron')
        new Notification({
          title: options.title,
          body: options.body,
          icon: options.icon
        }).show()
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })
  }
}
