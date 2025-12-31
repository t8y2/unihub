import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      plugin: {
        install: (url: string) => Promise<{ success: boolean; message: string }>
        installFromBuffer: (
          buffer: number[],
          filename: string
        ) => Promise<{ success: boolean; message: string }>
        uninstall: (pluginId: string) => Promise<{ success: boolean; message: string }>
        list: () => Promise<Array<Record<string, unknown>>>
        load: (
          pluginId: string
        ) => Promise<{ success: boolean; htmlPath?: string; devUrl?: string; pluginUrl?: string; message?: string }>
        open: (pluginId: string) => Promise<{ success: boolean; message?: string }>
        close: (pluginId: string) => Promise<{ success: boolean }>
        updateBounds: (
          pluginId: string,
          bounds: { x: number; y: number; width: number; height: number }
        ) => Promise<{ success: boolean }>
        dev: {
          register: (
            pluginId: string,
            devUrl: string,
            autoReload?: boolean
          ) => Promise<{ success: boolean; error?: string }>
          unregister: (pluginId: string) => Promise<{ success: boolean; error?: string }>
          isDevMode: (pluginId: string) => Promise<{ success: boolean; data: boolean }>
          list: () => Promise<{
            success: boolean
            data: Array<{ id: string; url: string; autoReload: boolean }>
          }>
        }
      }
      fs: {
        readFile: (path: string) => Promise<string>
        writeFile: (path: string, content: string) => Promise<void>
      }
      app: {
        getPath: (name: string) => Promise<string>
      }
    }
    // Node.js API（第一公民）
    node: {
      fs: {
        readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
        writeFile: (
          filePath: string,
          content: string
        ) => Promise<{ success: boolean; error?: string }>
        readdir: (dirPath: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
        exists: (filePath: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
        stat: (
          filePath: string
        ) => Promise<{
          success: boolean
          data?: { isFile: boolean; isDirectory: boolean; size: number; mtime: string }
          error?: string
        }>
        mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>
        selectFile: () => Promise<{ success: boolean; data?: string | null; error?: string }>
        selectDirectory: () => Promise<{ success: boolean; data?: string | null; error?: string }>
      }
      spawn: (
        command: string,
        args?: string[],
        options?: { timeout?: number; input?: string }
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
