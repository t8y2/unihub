/**
 * 插件后端桥接（Electron 版本）
 * 提供调用插件后端的接口
 */

export interface BackendAPI {
  /**
   * 调用插件后端函数
   */
  callBackend(pluginId: string, functionName: string, args: any): Promise<any>

  /**
   * 加载插件后端
   */
  loadBackend(pluginId: string): Promise<void>

  /**
   * 卸载插件后端
   */
  unloadBackend(pluginId: string): Promise<void>

  /**
   * 列出已加载的插件
   */
  listBackends(): Promise<any[]>
}

/**
 * 创建后端 API（使用 Electron IPC）
 */
export function createBackendAPI(): BackendAPI {
  return {
    async callBackend(pluginId: string, functionName: string, args: any) {
      try {
        const result = await window.api.plugin.backendCall(
          pluginId,
          functionName,
          JSON.stringify(args)
        )
        return JSON.parse(result)
      } catch (error) {
        throw new Error(`调用后端函数失败: ${error}`)
      }
    },

    async loadBackend(pluginId: string) {
      // Electron 中后端在安装时自动加载
      console.log('后端已在安装时加载:', pluginId)
    },

    async unloadBackend(pluginId: string) {
      // Electron 中后端在卸载时自动卸载
      console.log('后端将在卸载时卸载:', pluginId)
    },

    async listBackends() {
      try {
        const plugins = await window.api.plugin.list()
        return plugins.filter((p) => p.metadata.permissions?.includes('backend'))
      } catch (error) {
        console.error('列出后端失败:', error)
        return []
      }
    }
  }
}
