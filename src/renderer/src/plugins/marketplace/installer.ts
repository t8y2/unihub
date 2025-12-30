import { pluginRegistry } from '../registry'
import { pluginStorage } from './storage'
import type { InstalledPluginInfo } from '@/types/marketplace'
import { markRaw } from 'vue'

/**
 * 插件安装器（Electron 版本）
 * 使用 BrowserView 加载插件，类似 uTools
 */
export class PluginInstaller {
  /**
   * 从 URL 安装插件
   */
  async installFromUrl(url: string): Promise<void> {
    try {
      if (!url.endsWith('.zip')) {
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

      console.log(`✅ 插件 ${pluginId} 已卸载`)
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

        const metadata = pluginInfo.metadata

        // 创建插件组件（使用 iframe 加载）
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
              <div class="w-full h-full">
                <iframe 
                  ref="iframe"
                  v-if="iframeUrl" 
                  :src="iframeUrl" 
                  class="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                ></iframe>
                <div v-else class="flex items-center justify-center h-full">
                  <p class="text-gray-500">加载中...</p>
                </div>
              </div>
            `,
            data() {
              return {
                iframeUrl: ''
              }
            },
            async mounted() {
              try {
                // 获取插件 HTML 路径
                const result = await window.api.plugin.load(metadata.id)

                if (!result.success || !result.htmlPath) {
                  throw new Error(result.message || '加载插件失败')
                }

                // 读取 HTML 内容
                const htmlContent = await window.api.fs.readFile(result.htmlPath)

                // 创建 blob URL
                const blob = new Blob([htmlContent], { type: 'text/html' })
                this.iframeUrl = URL.createObjectURL(blob)

                // 等待 iframe 加载完成后注入 API
                this.$nextTick(() => {
                  const iframe = this.$refs.iframe as HTMLIFrameElement
                  iframe.onload = async () => {
                    const iframeWindow = iframe.contentWindow
                    if (iframeWindow) {
                      // 导入 Vue
                      const Vue = await import('vue')

                      // 注入 UniHub API
                      iframeWindow.UniHub = {
                        Vue,
                        // 提供调用后端的方法
                        invoke: async (command: string, args: any) => {
                          if (command === 'plugin_backend_call') {
                            return await window.api.plugin.backendCall(
                              args.pluginId,
                              args.functionName,
                              args.args
                            )
                          }
                          throw new Error(`Unknown command: ${command}`)
                        }
                      }

                      // 触发插件初始化事件
                      iframeWindow.dispatchEvent(new Event('unihub-ready'))
                      console.log('✅ 插件 API 已注入:', metadata.name)
                    }
                  }
                })
              } catch (error) {
                console.error('加载插件失败:', error)
              }
            }
          }),
          enabled: true,
          hasBackend: metadata.permissions?.includes('backend') || false
        }

        pluginRegistry.register(plugin)
        console.log(`✅ 已加载插件: ${metadata.name}`)
      }
    } catch (error) {
      console.error('加载插件列表失败:', error)
    }
  }
}

export const pluginInstaller = new PluginInstaller()
