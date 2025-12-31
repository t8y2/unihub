/**
 * UniHub 插件全局类型定义
 * 这个文件会自动被 TypeScript 识别，无需手动导入
 */

declare global {
  interface Window {
    /**
     * UniHub API - 高级 API（自动处理插件 ID）
     */
    unihub: {
      /** 数据库 API */
      db: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<void>
        keys: () => Promise<string[]>
        clear: () => Promise<void>
      }

      /** 剪贴板 API */
      clipboard: {
        readText: () => Promise<string>
        writeText: (text: string) => Promise<void>
        readImage: () => Promise<string | null>
        writeImage: (dataUrl: string) => Promise<void>
      }

      /** 文件系统 API */
      fs: {
        readFile: (path: string) => Promise<string | null>
        writeFile: (path: string, content: string) => Promise<boolean>
        readDir: (path: string) => Promise<string[]>
        exists: (path: string) => Promise<boolean>
        stat: (path: string) => Promise<Record<string, unknown>>
        mkdir: (path: string) => Promise<boolean>
        selectFile: () => Promise<string | null>
        selectDirectory: () => Promise<string | null>
      }

      /** HTTP API */
      http: {
        get: (url: string, options?: Record<string, unknown>) => Promise<unknown>
        post: (url: string, data: unknown, options?: Record<string, unknown>) => Promise<unknown>
        request: (options: Record<string, unknown>) => Promise<unknown>
      }

      /** 系统 API */
      system: {
        getInfo: () => Promise<Record<string, unknown>>
        openExternal: (url: string) => Promise<boolean>
        showInFolder: (path: string) => Promise<boolean>
      }

      /** 通知 API */
      notification: {
        show: (options: { title: string; body: string; icon?: string }) => Promise<void>
      }
    }

    /**
     * Node.js API - 底层 API（需要手动处理路径）
     */
    node: {
      /** 文件系统 API（限制在插件目录内） */
      fs: {
        readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
        writeFile: (
          filePath: string,
          content: string
        ) => Promise<{ success: boolean; error?: string }>
        readdir: (dirPath: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
        exists: (filePath: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
        stat: (filePath: string) => Promise<{
          success: boolean
          data?: Record<string, unknown>
          error?: string
        }>
        mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>
        selectFile: () => Promise<{ success: boolean; data?: string | null; error?: string }>
        selectDirectory: () => Promise<{ success: boolean; data?: string | null; error?: string }>
      }

      /** 子进程 API（Sidecar） */
      spawn: (
        command: string,
        args?: string[],
        options?: { timeout?: number; input?: string; env?: Record<string, string> }
      ) => Promise<{
        stdout: string
        stderr: string
        exitCode: number
      }>

      /** 获取插件目录 */
      getPluginDir: () => Promise<string>
    }
  }
}

export {}
