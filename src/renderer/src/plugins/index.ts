import { pluginRegistry } from './registry'
import { builtinPlugins } from './builtin'
import { searchEngine } from '@/utils/search'

// 初始化插件系统
export function initPlugins(): void {
  const startTime = performance.now()

  // 注册所有内置插件
  builtinPlugins.forEach((plugin) => {
    pluginRegistry.register(plugin)
  })

  // 从 localStorage 恢复插件状态
  pluginRegistry.loadFromLocalStorage()

  // 构建搜索索引（异步，不阻塞）
  requestIdleCallback(
    () => {
      const indexStartTime = performance.now()
      searchEngine.buildIndex(pluginRegistry.getAll())
      const indexEndTime = performance.now()
      console.log(`🔍 搜索索引构建完成，耗时 ${(indexEndTime - indexStartTime).toFixed(2)}ms`)
    },
    { timeout: 1000 }
  )

  const endTime = performance.now()
  console.log(`✅ 插件系统初始化完成，耗时 ${(endTime - startTime).toFixed(2)}ms`)
  console.log(`✅ 已加载 ${pluginRegistry.getAll().length} 个插件`)
  console.log(`✅ 已启用 ${pluginRegistry.getEnabled().length} 个插件`)
}

export { pluginRegistry }
export * from './registry'
export type { Plugin, PluginMetadata } from '@/types/plugin'
