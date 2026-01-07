import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      plugin: {
        install: (url: string) => Promise<{ success: boolean; message: string; pluginId?: string }>
        installFromBuffer: (
          buffer: number[],
          filename: string
        ) => Promise<{ success: boolean; message: string; pluginId?: string }>
        uninstall: (pluginId: string) => Promise<{ success: boolean; message: string }>
        list: () => Promise<Array<Record<string, unknown>>>
        load: (pluginId: string) => Promise<{
          success: boolean
          htmlPath?: string
          devUrl?: string
          pluginUrl?: string
          message?: string
        }>
        open: (pluginId: string) => Promise<{ success: boolean; message?: string }>
        close: (pluginId: string) => Promise<{ success: boolean }>
        destroy: (pluginId: string) => Promise<{ success: boolean }>
        updateBounds: (
          pluginId: string,
          bounds: { x: number; y: number; width: number; height: number }
        ) => Promise<{ success: boolean }>
        hideForSearch: () => Promise<{ success: boolean }>
        restoreAfterSearch: () => Promise<{ success: boolean }>
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
      sidebar: {
        setCollapsed: (collapsed: boolean) => Promise<{ success: boolean }>
      }
      settings: {
        getAll: () => Promise<{
          shortcuts: { toggleWindow: string; globalSearch: string }
          general: { launchAtStartup: boolean; minimizeToTray: boolean; language: string }
          appearance: { theme: 'light' | 'dark' | 'system'; sidebarWidth: number }
        }>
        getShortcuts: () => Promise<{ toggleWindow: string; globalSearch: string }>
        setShortcut: (
          key: 'toggleWindow' | 'globalSearch',
          value: string
        ) => Promise<{ success: boolean }>
        update: (partial: Record<string, unknown>) => Promise<{ success: boolean }>
        reset: () => Promise<{ success: boolean }>
      }
      updater: {
        check: () => Promise<{ success: boolean }>
        download: () => Promise<{ success: boolean }>
        install: () => Promise<{ success: boolean }>
        onCheckingForUpdate: (callback: (_event: unknown) => void) => void
        onUpdateAvailable: (
          callback: (
            _event: unknown,
            info: { version: string; releaseDate: string; releaseNotes?: string }
          ) => void
        ) => void
        onUpdateNotAvailable: (
          callback: (_event: unknown, info: { version: string }) => void
        ) => void
        onDownloadProgress: (
          callback: (
            _event: unknown,
            progress: {
              percent: number
              bytesPerSecond: number
              transferred: number
              total: number
            }
          ) => void
        ) => void
        onUpdateDownloaded: (
          callback: (
            _event: unknown,
            info: { version: string; releaseDate: string; releaseNotes?: string }
          ) => void
        ) => void
        onError: (callback: (_event: unknown, error: { message: string }) => void) => void
      }
      search: {
        openPlugin: (pluginId: string) => Promise<{ success: boolean }>
        close: () => Promise<{ success: boolean }>
      }
      db: {
        addFavorite: (pluginId: string) => Promise<{ success: boolean }>
        removeFavorite: (pluginId: string) => Promise<{ success: boolean }>
        isFavorite: (pluginId: string) => Promise<boolean>
        getFavorites: () => Promise<Array<{ pluginId: string; addedAt: number }>>
        addRecent: (pluginId: string) => Promise<{ success: boolean }>
        getRecents: (
          limit?: number
        ) => Promise<Array<{ pluginId: string; lastAccessedAt: number; accessCount: number }>>
        clearRecents: () => Promise<{ success: boolean }>
      }
      tab: {
        showContextMenu: (
          tabId: string,
          index: number,
          total: number
        ) => Promise<{ success: boolean }>
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
        stat: (filePath: string) => Promise<{
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
    // UniHub API（插件专用的简化 API）
    unihub: {
      db: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<void>
        keys: () => Promise<string[]>
        clear: () => Promise<void>
      }
      clipboard: {
        readText: () => Promise<string>
        writeText: (text: string) => Promise<void>
        readImage: () => Promise<string | null>
        writeImage: (dataUrl: string) => Promise<void>
        subscribe: () => Promise<void>
        unsubscribe: () => Promise<void>
        onChange: (callback: (data: { content: string; timestamp: number }) => void) => () => void
      }
      fs: {
        readFile: (path: string) => Promise<string | null>
        writeFile: (path: string, content: string) => Promise<boolean>
        readDir: (path: string) => Promise<string[]>
        exists: (path: string) => Promise<boolean>
        stat: (path: string) => Promise<{
          isFile: boolean
          isDirectory: boolean
          size: number
          mtime: string
        } | null>
        mkdir: (path: string) => Promise<boolean>
        selectFile: () => Promise<string | null>
        selectDirectory: () => Promise<string | null>
      }
      http: {
        get: (url: string, options?: Record<string, unknown>) => Promise<unknown>
        post: (url: string, data: unknown, options?: Record<string, unknown>) => Promise<unknown>
        request: (options: Record<string, unknown>) => Promise<unknown>
      }
      system: {
        getInfo: () => Promise<{
          platform: string
          arch: string
          version: string
          appPath: string
          userDataPath: string
          tempPath: string
        } | null>
        openExternal: (url: string) => Promise<boolean>
        showInFolder: (path: string) => Promise<boolean>
      }
      notification: {
        show: (options: { title: string; body: string; icon?: string }) => Promise<void>
      }
    }
    // Node.js API（底层 API）
    node: {
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
        options?: { timeout?: number; input?: string; env?: Record<string, string> }
      ) => Promise<{
        stdout: string
        stderr: string
        exitCode: number
      }>
      getPluginDir: () => Promise<string>
    }
  }
}
