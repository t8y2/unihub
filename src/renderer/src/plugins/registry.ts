import { reactive, markRaw } from 'vue'
import type { Plugin } from '@/types/plugin'

class PluginRegistry {
  private plugins = reactive<Map<string, Plugin>>(new Map())

  register(plugin: Plugin) {
    // 使用 markRaw 避免 Vue 对组件进行深度响应式处理
    const pluginWithRawComponent = {
      ...plugin,
      component: markRaw(plugin.component)
    }
    this.plugins.set(plugin.metadata.id, pluginWithRawComponent)
  }

  unregister(id: string) {
    this.plugins.delete(id)
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id)
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabled(): Plugin[] {
    return this.getAll().filter(p => p.enabled)
  }

  getByCategory(category: string): Plugin[] {
    return this.getEnabled().filter(p => p.metadata.category === category)
  }

  toggle(id: string) {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = !plugin.enabled
      this.saveToLocalStorage()
    }
  }

  enable(id: string) {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = true
      this.saveToLocalStorage()
    }
  }

  disable(id: string) {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = false
      this.saveToLocalStorage()
    }
  }

  // 保存插件启用状态到 localStorage
  private saveToLocalStorage() {
    const enabledPlugins = this.getAll()
      .filter(p => p.enabled)
      .map(p => p.metadata.id)
    localStorage.setItem('enabled-plugins', JSON.stringify(enabledPlugins))
  }

  // 从 localStorage 恢复插件启用状态
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('enabled-plugins')
      if (saved) {
        const enabledIds = JSON.parse(saved) as string[]
        this.getAll().forEach(plugin => {
          plugin.enabled = enabledIds.includes(plugin.metadata.id)
        })
      }
    } catch (e) {
      console.error('Failed to load plugin state:', e)
    }
  }
}

export const pluginRegistry = new PluginRegistry()
