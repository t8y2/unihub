/**
 * UniHub 插件 SDK
 * 直接使用 preload 暴露的 API（WebContentsView 模式）
 */

// 类型定义
declare global {
  interface Window {
    unihub: {
      db: {
        put: (key: string, value: unknown) => Promise<boolean>
        get: (key: string) => Promise<unknown>
        remove: (key: string) => Promise<boolean>
        allKeys: () => Promise<string[]>
        clear: () => Promise<boolean>
      }
      clipboard: {
        readText: () => Promise<string>
        writeText: (text: string) => Promise<boolean>
        readImage: () => Promise<string | null>
        writeImage: (dataUrl: string) => Promise<boolean>
      }
      fs: {
        readFile: (path: string) => Promise<string | null>
        writeFile: (path: string, content: string) => Promise<boolean>
        readDir: (path: string) => Promise<string[]>
        exists: (path: string) => Promise<boolean>
        stat: (path: string) => Promise<any>
        mkdir: (path: string) => Promise<boolean>
        selectFile: () => Promise<string | null>
        selectDirectory: () => Promise<string | null>
      }
      http: {
        get: (url: string, options?: any) => Promise<any>
        post: (url: string, data: unknown, options?: any) => Promise<any>
        request: (options: any) => Promise<any>
      }
      system: {
        getInfo: () => Promise<any>
        openExternal: (url: string) => Promise<boolean>
        showInFolder: (path: string) => Promise<boolean>
      }
      notification: {
        show: (options: { title: string; body: string; icon?: string }) => Promise<boolean>
      }
    }
    node: {
      fs: {
        readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
        writeFile: (
          filePath: string,
          content: string
        ) => Promise<{ success: boolean; error?: string }>
        readdir: (dirPath: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
        exists: (filePath: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
        stat: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>
        mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>
        selectFile: () => Promise<{ success: boolean; data?: string | null; error?: string }>
        selectDirectory: () => Promise<{ success: boolean; data?: string | null; error?: string }>
      }
      spawn: (
        command: string,
        args?: string[],
        options?: any
      ) => Promise<{
        success: boolean
        stdout?: string
        stderr?: string
        exitCode?: number
        error?: string
      }>
      getPluginDir: () => Promise<{ success: boolean; data?: string; error?: string }>
    }
  }
}

/**
 * 插件 SDK 类
 * 提供简化的 API 访问
 */
class PluginSDK {
  /**
   * 数据库 API（键值存储）
   */
  get db() {
    return window.unihub.db
  }

  /**
   * 剪贴板 API
   */
  get clipboard() {
    return window.unihub.clipboard
  }

  /**
   * 文件系统 API（受限）
   */
  get fs() {
    return window.unihub.fs
  }

  /**
   * HTTP API
   */
  get http() {
    return window.unihub.http
  }

  /**
   * 系统 API
   */
  get system() {
    return window.unihub.system
  }

  /**
   * 通知 API
   */
  get notification() {
    return window.unihub.notification
  }

  /**
   * Node.js API（第一公民）
   */
  get node() {
    return window.node
  }

  /**
   * 显示成功通知
   */
  async showSuccess(message: string) {
    return await this.notification.show({
      title: '成功',
      body: message
    })
  }

  /**
   * 显示错误通知
   */
  async showError(message: string) {
    return await this.notification.show({
      title: '错误',
      body: message
    })
  }

  /**
   * 显示信息通知
   */
  async showInfo(message: string) {
    return await this.notification.show({
      title: '提示',
      body: message
    })
  }
}

// 导出单例
export const pluginSDK = new PluginSDK()

// 全局暴露（方便在模板中使用）
if (typeof window !== 'undefined') {
  ;(window as any).pluginSDK = pluginSDK
}
