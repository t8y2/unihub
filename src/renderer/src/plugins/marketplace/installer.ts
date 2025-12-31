import { pluginRegistry } from '../registry'
import { markRaw } from 'vue'

/**
 * Component instance type for Vue components
 */
interface ComponentInstance {
  pluginId: string
  pluginName: string
  loading: boolean
  error: string
  isActive: boolean
  $refs: {
    pluginContainer?: HTMLElement
  }
  $nextTick: (callback: () => void) => void
  updateViewBounds: () => void
}

/**
 * 插件安装器（Electron 版本）
 * 使用 WebContentsView 加载插件
 */
export class PluginInstaller {
  /**
   * 从 URL 安装插件
   */
  async installFromUrl(url: string): Promise<void> {
    try {
      if (url.startsWith('http') && !url.endsWith('.zip')) {
        throw new Error('仅支持 .zip 格式的插件包')
      }

      const result = await window.api.plugin.install(url)

      if (!result.success) {
        throw new Error(result.message)
      }

      console.log('✅ 插件安装成功')
    } catch (error) {
      console.error('安装插件失败:', error)
      throw error
    }
  }

  /**
   * 从文件安装插件
   */
  async installFromFile(file: File): Promise<void> {
    try {
      if (!file.name.endsWith('.zip')) {
        throw new Error('仅支持 .zip 格式的插件包')
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const result = await window.api.plugin.installFromBuffer(Array.from(buffer), file.name)

      if (!result.success) {
        throw new Error(result.message)
      }

      console.log('✅ 插件安装成功')
    } catch (error) {
      console.error('安装插件失败:', error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    try {
      pluginRegistry.unregister(pluginId)

      const result = await window.api.plugin.uninstall(pluginId)

      if (!result.success) {
        throw new Error(result.message)
      }

      console.log('✅ 插件已卸载:', pluginId)
    } catch (error) {
      console.error('卸载插件失败:', error)
      throw error
    }
  }

  /**
   * 加载已安装的插件
   */
  async loadInstalledPlugins(): Promise<void> {
    try {
      const plugins = await window.api.plugin.list()

      for (const pluginInfo of plugins) {
        if (!pluginInfo.enabled) continue

        const metadata = pluginInfo.metadata as Record<string, unknown>
        const author = metadata.author as Record<string, unknown> | string
        const authorName =
          typeof author === 'string' ? author : (author?.name as string) || 'Unknown'
        const category = metadata.category as string
        const validCategory: 'formatter' | 'tool' | 'encoder' | 'custom' =
          category === 'formatter' || category === 'tool' || category === 'encoder'
            ? category
            : 'custom'

        // 创建插件组件（使用 WebContentsView）
        const plugin = {
          metadata: {
            id: metadata.id as string,
            name: metadata.name as string,
            description: metadata.description as string,
            version: metadata.version as string,
            author: authorName,
            icon: (metadata.icon as string) || 'M12 4v16m8-8H4',
            category: validCategory,
            keywords: (metadata.keywords as string[]) || [],
            isThirdParty: true // 标记为第三方插件
          },
          component: markRaw({
            template: `
              <div class="w-full h-full flex flex-col bg-white dark:bg-gray-900">
                <div v-if="loading" class="flex-1 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">加载插件中...</p>
                  </div>
                </div>
                <div v-else-if="error" class="flex-1 flex items-center justify-center">
                  <div class="text-center max-w-md">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">加载失败</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ error }}</p>
                  </div>
                </div>
                <div v-else class="flex-1 w-full" ref="pluginContainer">
                  <!-- WebContentsView 将在这里显示 -->
                </div>
              </div>
            `,
            data() {
              return {
                pluginName: metadata.name as string,
                pluginId: metadata.id as string,
                loading: true,
                error: '',
                isActive: false
              }
            },
            async mounted(this: ComponentInstance) {
              try {
                const result = await window.api.plugin.open(this.pluginId)

                if (!result.success) {
                  this.error = result.message || '加载插件失败'
                  this.loading = false
                  return
                }

                this.loading = false
                this.isActive = true
                console.log('✅ 插件已加载:', this.pluginId)

                // 监听窗口大小变化，更新 WebContentsView 位置
                this.$nextTick(() => {
                  this.updateViewBounds()
                  window.addEventListener('resize', this.updateViewBounds)
                })
              } catch (err) {
                console.error('加载插件失败:', err)
                this.error = String(err)
                this.loading = false
              }
            },
            beforeUnmount(this: ComponentInstance) {
              if (this.isActive) {
                window.api.plugin.close(this.pluginId)
                window.removeEventListener('resize', this.updateViewBounds)
              }
            },
            methods: {
              updateViewBounds(this: ComponentInstance) {
                const container = this.$refs.pluginContainer as HTMLElement
                if (!container) return

                const rect = container.getBoundingClientRect()
                window.api.plugin.updateBounds(this.pluginId, {
                  x: Math.round(rect.x),
                  y: Math.round(rect.y),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                })
              }
            }
          }),
          enabled: true,
          hasBackend: (metadata.permissions as string[])?.includes('backend') || false
        }

        pluginRegistry.register(plugin)
        console.log('✅ 已加载插件:', metadata.name)
      }
    } catch (error) {
      console.error('加载插件列表失败:', error)
    }
  }
}

export const pluginInstaller = new PluginInstaller()
