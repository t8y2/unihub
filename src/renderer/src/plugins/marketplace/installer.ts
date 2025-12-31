import { pluginRegistry } from '../registry'
import { pluginStorage } from './storage'
import type { InstalledPluginInfo } from '@/types/marketplace'
import { markRaw } from 'vue'

/**
 * 插件安装器（Electron 版本）
 * 使用 BrowserView 加载插件
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
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  @load="onIframeLoad"
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
            methods: {
              async onIframeLoad() {
                const iframe = this.$refs.iframe as HTMLIFrameElement
                if (!iframe) return

                const iframeWindow = iframe.contentWindow
                if (iframeWindow) {
                  try {
                    // 导入 Vue
                    const Vue = await import('vue')

                    // 注入 UniHub API
                    ;(iframeWindow as any).UniHub = {
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

                    // 注入 window.api（用于插件直接调用）
                    ;(iframeWindow as any).api = window.api

                    // 触发插件初始化事件
                    iframeWindow.dispatchEvent(new Event('unihub-ready'))
                    console.log('✅ 插件 API 已注入:', metadata.name)
                  } catch (error) {
                    console.error('注入插件 API 失败:', error)
                  }
                }
              }
            },
            async mounted() {
              try {
                // 获取插件 HTML 路径
                const loadResult = await window.api.plugin.load(metadata.id)

                if (!loadResult.success || !loadResult.htmlPath) {
                  throw new Error(loadResult.message || '加载插件失败')
                }

                // 读取 HTML 内容
                const readResult = (await window.api.fs.readFile(loadResult.htmlPath)) as {
                  success: boolean
                  data?: string
                  error?: string
                }
                let htmlContent = readResult.success ? readResult.data || '' : ''

                if (!htmlContent) {
                  throw new Error('无法读取插件 HTML 文件')
                }

                // 修改 HTML 内容，添加 CSP meta 标签（允许外部脚本）
                const cspMeta =
                  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; connect-src 'self' http: https:; img-src 'self' data: blob:;\">"

                if (htmlContent.includes('<head>')) {
                  htmlContent = htmlContent.replace('<head>', '<head>' + cspMeta)
                } else if (htmlContent.includes('<html>')) {
                  htmlContent = htmlContent.replace('<html>', '<html><head>' + cspMeta + '</head>')
                } else {
                  htmlContent =
                    '<html><head>' + cspMeta + '</head><body>' + htmlContent + '</body></html>'
                }

                // 创建 blob URL
                const blob = new Blob([htmlContent], { type: 'text/html' })
                this.iframeUrl = URL.createObjectURL(blob)

                // 等待 iframe 加载后注入插件 ID
                this.$nextTick(() => {
                  const iframe = this.$refs.iframe as HTMLIFrameElement
                  if (iframe && iframe.contentWindow) {
                    ;(iframe.contentWindow as any).__UNIHUB_PLUGIN_ID__ = metadata.id
                  }
                })
              } catch (error) {
                console.error('加载插件失败:', error)
              }
            },
            beforeUnmount() {
              if (this.iframeUrl) {
                URL.revokeObjectURL(this.iframeUrl)
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
