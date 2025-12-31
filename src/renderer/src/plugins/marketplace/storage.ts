import type { InstalledPluginInfo } from '@/types/marketplace'

/**
 * 插件存储管理器
 * 负责管理已安装插件的信息
 */
export class PluginStorage {
  private readonly STORAGE_KEY = 'installed-plugins'

  /**
   * 获取所有已安装的插件信息
   */
  getInstalledPlugins(): InstalledPluginInfo[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * 保存插件信息
   */
  savePluginInfo(info: InstalledPluginInfo): void {
    const installed = this.getInstalledPlugins()
    const index = installed.findIndex((p) => p.id === info.id)

    if (index >= 0) {
      installed[index] = info
    } else {
      installed.push(info)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(installed))
  }

  /**
   * 删除插件信息
   */
  removePluginInfo(pluginId: string): void {
    const installed = this.getInstalledPlugins()
    const filtered = installed.filter((p) => p.id !== pluginId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * 获取单个插件信息
   */
  getPluginInfo(pluginId: string): InstalledPluginInfo | undefined {
    const installed = this.getInstalledPlugins()
    return installed.find((p) => p.id === pluginId)
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(pluginId: string): boolean {
    return this.getPluginInfo(pluginId) !== undefined
  }

  /**
   * 保存插件代码到 localStorage
   * 注意：localStorage 有大小限制（通常 5-10MB）
   * 生产环境应该使用 IndexedDB 或文件系统
   */
  savePluginCode(pluginId: string, code: string): void {
    const key = `plugin-code-${pluginId}`
    try {
      localStorage.setItem(key, code)
    } catch {
      throw new Error('保存插件代码失败，可能超出存储限制')
    }
  }

  /**
   * 读取插件代码
   */
  getPluginCode(pluginId: string): string | null {
    const key = `plugin-code-${pluginId}`
    return localStorage.getItem(key)
  }

  /**
   * 删除插件代码
   */
  removePluginCode(pluginId: string): void {
    const key = `plugin-code-${pluginId}`
    localStorage.removeItem(key)
  }

  /**
   * 保存插件元数据
   */
  savePluginMetadata(pluginId: string, metadata: unknown): void {
    const key = `plugin-metadata-${pluginId}`
    localStorage.setItem(key, JSON.stringify(metadata))
  }

  /**
   * 获取插件元数据
   */
  getPluginMetadata(pluginId: string): unknown | null {
    const key = `plugin-metadata-${pluginId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  /**
   * 删除插件元数据
   */
  removePluginMetadata(pluginId: string): void {
    const key = `plugin-metadata-${pluginId}`
    localStorage.removeItem(key)
  }

  /**
   * 清理所有插件数据
   */
  clearAll(): void {
    const installed = this.getInstalledPlugins()

    // 删除所有插件代码
    installed.forEach((plugin) => {
      this.removePluginCode(plugin.id)
    })

    // 删除插件列表
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

export const pluginStorage = new PluginStorage()
