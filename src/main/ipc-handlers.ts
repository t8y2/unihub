import { ipcMain } from 'electron'
import { pluginDevServer } from './plugin-dev-server'

/**
 * 注册开发模式相关的 IPC 处理器
 */
export function registerDevModeHandlers(): void {
  // 注册开发模式插件
  ipcMain.handle(
    'plugin:dev:register',
    (_, pluginId: string, devUrl: string, autoReload = true) => {
      try {
        pluginDevServer.registerDevPlugin(pluginId, devUrl, autoReload)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  // 取消注册开发模式插件
  ipcMain.handle('plugin:dev:unregister', (_, pluginId: string) => {
    try {
      pluginDevServer.unregisterDevPlugin(pluginId)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 检查是否为开发模式
  ipcMain.handle('plugin:dev:isDevMode', (_, pluginId: string) => {
    return { success: true, data: pluginDevServer.isDevMode(pluginId) }
  })

  // 获取所有开发模式插件
  ipcMain.handle('plugin:dev:list', () => {
    return { success: true, data: pluginDevServer.getAllDevPlugins() }
  })
}
