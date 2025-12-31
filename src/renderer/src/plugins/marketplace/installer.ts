import { pluginRegistry } from '../registry'
import { markRaw } from 'vue'

/**
 * 插件安装器（Electron 版本）
 * 在应用内 iframe 中加载插件
 */
export class PluginInstaller {
  /**
   * 从 URL 安装插件
   */
  async installFromUrl(url: string): Promise<void> {
    try {
      // 只对 HTTP URL 进行 .zip 检查，blob URL 不需要检查
      if (url.startsWith('http') && !url.endsWith('.zip')) {
        throw new Error('仅支持 .zip 格式的插件包')
      }

      // 调用 Electron 主进程安装插件
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

      // 将文件转换为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      // 调用 Electron 主进程安装插件（传递文件数据）
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
      // 从插件系统注销
      pluginRegistry.unregister(pluginId)

      // 调用 Electron 主进程卸载插件
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
      // 从 Electron 主进程获取插件列表
      const plugins = await window.api.plugin.list()

      for (const pluginInfo of plugins) {
        if (!pluginInfo.enabled) continue

        const metadata = pluginInfo.metadata as any

        // 创建插件组件（在应用内 iframe 中加载）
        const plugin = {
          metadata: {
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            version: metadata.version,
            author: metadata.author.name || metadata.author,
            icon: metadata.icon || 'M12 4v16m8-8H4',
            category: metadata.category,
            keywords: metadata.keywords || []
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
                <iframe
                  v-else
                  ref="iframe"
                  :srcdoc="pluginHtml"
                  class="flex-1 w-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  allow="plugin:"
                />
              </div>
            `,
            data() {
              return {
                pluginName: metadata.name,
                pluginId: metadata.id,
                pluginHtml: '',
                loading: true,
                error: ''
              }
            },
            async mounted(this: any) {
              try {
                // 加载插件
                const result = await window.api.plugin.load(this.pluginId)
                
                if (!result.success) {
                  this.error = result.message || '加载插件失败'
                  this.loading = false
                  return
                }

                if (result.devUrl) {
                  // 开发模式：使用 devUrl
                  const devUrl = result.devUrl
                  this.pluginHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { margin: 0; padding: 0; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: 0; }</style></head><body><iframe src="' + devUrl + '" sandbox="allow-scripts allow-same-origin"></iframe></body></html>'
                } else if (result.html) {
                  // 生产模式：使用转换后的 HTML
                  this.pluginHtml = result.html
                } else {
                  this.error = '插件格式不正确'
                }

                this.loading = false

                // 注入插件 API
                this.$nextTick(() => {
                  const iframe = this.$refs.iframe
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.pluginAPI = window.api
                    console.log('✅ 插件 API 已注入:', this.pluginId)
                  }
                })
              } catch (err) {
                console.error('加载插件失败:', err)
                this.error = String(err)
                this.loading = false
              }
            }
          }),
          enabled: true,
          hasBackend: metadata.permissions?.includes('backend') || false
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
