import { reactive, markRaw, ref } from 'vue'
import type { Plugin } from '@/types/plugin'

class PluginRegistry {
  private plugins = reactive<Map<string, Plugin>>(new Map())

  // 响应式版本号，用于触发外部组件更新
  public version = ref(0)

  register(plugin: Plugin): void {
    console.log(`[Registry] 注册插件: ${plugin.metadata.id}, enabled: ${plugin.enabled}`)
    // 使用 markRaw 避免 Vue 对组件进行深度响应式处理
    const pluginWithRawComponent = {
      ...plugin,
      component: markRaw(plugin.component)
    }
    this.plugins.set(plugin.metadata.id, pluginWithRawComponent)
    this.version.value++
  }

  unregister(id: string): void {
    this.plugins.delete(id)
    this.version.value++
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id)
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabled(): Plugin[] {
    return this.getAll().filter((p) => p.enabled)
  }

  getByCategory(category: string): Plugin[] {
    return this.getEnabled().filter((p) => p.metadata.category === category)
  }

  toggle(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      const wasEnabled = plugin.enabled
      plugin.enabled = !plugin.enabled
      console.log(`[Registry] toggle ${id}: ${wasEnabled} -> ${plugin.enabled}`)
      this.version.value++
      this.saveToLocalStorage()
    }
  }

  enable(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = true
      this.version.value++
      this.saveToLocalStorage()
    }
  }

  disable(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = false
      this.version.value++
      this.saveToLocalStorage()
    }
  }

  // 保存插件启用状态到 localStorage
  private saveToLocalStorage(): void {
    const enabledPlugins = this.getAll()
      .filter((p) => p.enabled)
      .map((p) => p.metadata.id)
    localStorage.setItem('enabled-plugins', JSON.stringify(enabledPlugins))
  }

  // 从 localStorage 恢复插件启用状态
  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('enabled-plugins')
      console.log(`[Registry] localStorage 数据: ${saved}`)

      // 只有当 localStorage 中确实有保存的数据时才恢复
      // 如果是第一次运行（没有保存数据），保持所有插件的默认 enabled: true 状态
      if (saved !== null) {
        const enabledIds = JSON.parse(saved) as string[]
        console.log(`[Registry] 启用的插件 IDs:`, enabledIds)

        this.getAll().forEach((plugin) => {
          const wasEnabled = plugin.enabled
          plugin.enabled = enabledIds.includes(plugin.metadata.id)
          console.log(`[Registry] 插件 ${plugin.metadata.id}: ${wasEnabled} -> ${plugin.enabled}`)
        })
        this.version.value++
      } else {
        console.log(`[Registry] 没有保存的状态，保持默认`)
        // 打印当前所有插件状态
        this.getAll().forEach((plugin) => {
          console.log(`[Registry] 插件 ${plugin.metadata.id} 默认状态: ${plugin.enabled}`)
        })
      }
    } catch (e) {
      console.error('[Registry] Failed to load plugin state:', e)
      // 出错时清除损坏的数据
      localStorage.removeItem('enabled-plugins')
    }
  }

  // 重置所有插件为启用状态
  resetAll(): void {
    this.getAll().forEach((plugin) => {
      plugin.enabled = true
    })
    this.version.value++
    localStorage.removeItem('enabled-plugins')
  }
}

export const pluginRegistry = new PluginRegistry()
