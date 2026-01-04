/**
 * 插件开发服务器
 * 支持热重载功能
 */
import { createLogger } from '../shared/logger'

const logger = createLogger('plugin-dev-server')

export class PluginDevServer {
  private devPlugins = new Map<string, { url: string; autoReload: boolean }>()

  /**
   * 注册开发模式插件
   */
  registerDevPlugin(pluginId: string, devUrl: string, autoReload = true): void {
    this.devPlugins.set(pluginId, { url: devUrl, autoReload })
    logger.info({ pluginId, devUrl }, '已注册开发模式插件')
  }

  /**
   * 取消注册开发模式插件
   */
  unregisterDevPlugin(pluginId: string): void {
    this.devPlugins.delete(pluginId)
    logger.info({ pluginId }, '已取消开发模式插件')
  }

  /**
   * 检查插件是否处于开发模式
   */
  isDevMode(pluginId: string): boolean {
    return this.devPlugins.has(pluginId)
  }

  /**
   * 获取开发模式插件的 URL
   */
  getDevUrl(pluginId: string): string | null {
    const devPlugin = this.devPlugins.get(pluginId)
    return devPlugin ? devPlugin.url : null
  }

  /**
   * 获取所有开发模式插件
   */
  getAllDevPlugins(): Array<{ id: string; url: string; autoReload: boolean }> {
    return Array.from(this.devPlugins.entries()).map(([id, config]) => ({
      id,
      ...config
    }))
  }
}

export const pluginDevServer = new PluginDevServer()
