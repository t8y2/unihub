import { pluginRegistry } from './registry'
import { builtinPlugins } from './builtin'

// 初始化插件系统
export function initPlugins(): void {
  // 注册所有内置插件
  builtinPlugins.forEach((plugin) => {
    pluginRegistry.register(plugin)
  })

  // 从 localStorage 恢复插件状态
  pluginRegistry.loadFromLocalStorage()

  console.log(`✅ 已加载 ${pluginRegistry.getAll().length} 个插件`)
  console.log(`✅ 已启用 ${pluginRegistry.getEnabled().length} 个插件`)
}

export { pluginRegistry }
export * from './registry'
export type { Plugin, PluginMetadata } from '@/types/plugin'
