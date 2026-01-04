/**
 * 插件懒加载管理器
 * 实现按需加载，减少初始化时间和内存占用
 */

import { markRaw, type Component } from 'vue'
import type { Plugin } from '@/types/plugin'

interface LazyPlugin {
  metadata: Plugin['metadata']
  enabled: boolean
  config?: Record<string, unknown>
  loader: () => Promise<Component>
  component?: Component
  loading: boolean
  error?: Error
}

/**
 * 插件懒加载管理器
 */
export class PluginLazyLoader {
  private plugins: Map<string, LazyPlugin> = new Map()
  private loadingPromises: Map<string, Promise<Component>> = new Map()

  /**
   * 注册懒加载插件
   */
  register(
    metadata: Plugin['metadata'],
    loader: () => Promise<Component>,
    enabled = true,
    config?: Record<string, unknown>
  ): void {
    this.plugins.set(metadata.id, {
      metadata,
      enabled,
      config,
      loader,
      loading: false
    })
  }

  /**
   * 加载插件组件
   */
  async load(pluginId: string): Promise<Component | null> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      console.error(`[LazyLoader] 插件不存在: ${pluginId}`)
      return null
    }

    // 已加载，直接返回
    if (plugin.component) {
      return plugin.component
    }

    // 正在加载，等待加载完成
    if (this.loadingPromises.has(pluginId)) {
      return this.loadingPromises.get(pluginId)!
    }

    // 开始加载
    plugin.loading = true
    const loadPromise = plugin
      .loader()
      .then((component) => {
        plugin.component = markRaw(component)
        plugin.loading = false
        plugin.error = undefined
        this.loadingPromises.delete(pluginId)
        console.log(`[LazyLoader] 插件加载成功: ${pluginId}`)
        return plugin.component
      })
      .catch((error) => {
        plugin.loading = false
        plugin.error = error
        this.loadingPromises.delete(pluginId)
        console.error(`[LazyLoader] 插件加载失败: ${pluginId}`, error)
        throw error
      })

    this.loadingPromises.set(pluginId, loadPromise)
    return loadPromise
  }

  /**
   * 预加载插件（后台加载，不阻塞）
   */
  preload(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || plugin.component || plugin.loading) {
      return
    }

    // 使用 requestIdleCallback 在空闲时加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.load(pluginId).catch(() => {
          // 预加载失败不影响主流程
        })
      })
    } else {
      // 降级方案：使用 setTimeout
      setTimeout(() => {
        this.load(pluginId).catch(() => {
          // 预加载失败不影响主流程
        })
      }, 100)
    }
  }

  /**
   * 批量预加载（按优先级）
   */
  preloadBatch(pluginIds: string[], priority: 'high' | 'low' = 'low'): void {
    const delay = priority === 'high' ? 0 : 1000

    setTimeout(() => {
      for (const pluginId of pluginIds) {
        this.preload(pluginId)
      }
    }, delay)
  }

  /**
   * 获取插件（不触发加载）
   */
  get(pluginId: string): LazyPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 获取所有插件
   */
  getAll(): LazyPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已启用的插件
   */
  getEnabled(): LazyPlugin[] {
    return this.getAll().filter((p) => p.enabled)
  }

  /**
   * 启用/禁用插件
   */
  toggle(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = !plugin.enabled
    }
  }

  /**
   * 卸载插件组件（释放内存）
   */
  unload(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.component = undefined
      console.log(`[LazyLoader] 插件已卸载: ${pluginId}`)
    }
  }

  /**
   * 批量卸载不常用的插件
   */
  unloadUnused(recentPluginIds: string[], keepCount = 5): void {
    const allPlugins = this.getAll()
    const loadedPlugins = allPlugins.filter((p) => p.component)

    // 按最近使用排序
    const sortedPlugins = loadedPlugins.sort((a, b) => {
      const aIndex = recentPluginIds.indexOf(a.metadata.id)
      const bIndex = recentPluginIds.indexOf(b.metadata.id)
      return (bIndex === -1 ? -1 : bIndex) - (aIndex === -1 ? -1 : aIndex)
    })

    // 卸载超出保留数量的插件
    const toUnload = sortedPlugins.slice(keepCount)
    for (const plugin of toUnload) {
      this.unload(plugin.metadata.id)
    }

    if (toUnload.length > 0) {
      console.log(`[LazyLoader] 已卸载 ${toUnload.length} 个不常用插件`)
    }
  }

  /**
   * 清除所有加载的组件
   */
  clear(): void {
    for (const plugin of this.plugins.values()) {
      plugin.component = undefined
    }
    this.loadingPromises.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    loaded: number
    loading: number
    enabled: number
  } {
    const all = this.getAll()
    return {
      total: all.length,
      loaded: all.filter((p) => p.component).length,
      loading: all.filter((p) => p.loading).length,
      enabled: all.filter((p) => p.enabled).length
    }
  }
}

// 导出单例
export const pluginLazyLoader = new PluginLazyLoader()
