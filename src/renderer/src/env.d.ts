/// <reference types="vite/client" />

// 本地应用类型
interface LocalApp {
  id: string
  name: string
  path: string
  icon?: string
  type: 'app'
}

// API 响应类型
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pluginId?: string
}

// 插件类型
interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: string
  icon?: string
  enabled: boolean
  installed: boolean
  source: 'official' | 'url' | 'local'
  permissions: string[]
  metadata?: Record<string, unknown>
}

// 设置类型
interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: string
  sidebarCollapsed: boolean
  shortcuts: {
    toggleWindow: string
    globalSearch: string
  }
  general: {
    launchAtStartup: boolean
    minimizeToTray: boolean
    language: string
  }
  appearance: {
    theme: 'system' | 'light' | 'dark'
    sidebarWidth: number
  }
}

// 更新信息类型
interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes?: string
}

// 进度信息类型
interface ProgressInfo {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

// Window API 类型扩展
declare global {
  interface Window {
    api: {
      plugin: {
        install: (url: string) => Promise<ApiResponse<Plugin>>
        installFromBuffer: (buffer: number[], filename: string) => Promise<ApiResponse<Plugin>>
        uninstall: (pluginId: string) => Promise<ApiResponse>
        list: () => Promise<Plugin[]>
        load: (
          pluginId: string
        ) => Promise<ApiResponse<{ pluginUrl?: string; devUrl?: string; htmlPath?: string }>>
        open: (pluginId: string) => Promise<ApiResponse>
        close: (pluginId: string) => Promise<ApiResponse>
        destroy: (pluginId: string) => Promise<ApiResponse>
        updateBounds: (
          pluginId: string,
          bounds: { x: number; y: number; width: number; height: number }
        ) => Promise<ApiResponse>
        hideForSearch: () => Promise<ApiResponse>
        restoreAfterSearch: () => Promise<ApiResponse>
        dev: {
          register: (pluginId: string, devUrl: string, autoReload?: boolean) => Promise<ApiResponse>
          unregister: (pluginId: string) => Promise<ApiResponse>
          isDevMode: (pluginId: string) => Promise<boolean>
          list: () => Promise<
            ApiResponse<Array<{ pluginId: string; devUrl: string; autoReload: boolean }>>
          >
        }
      }
      fs: {
        readFile: (path: string) => Promise<ApiResponse<string>>
        writeFile: (path: string, content: string) => Promise<ApiResponse>
        readDir: (path: string) => Promise<ApiResponse<string[]>>
        exists: (path: string) => Promise<ApiResponse<boolean>>
        stat: (
          path: string
        ) => Promise<
          ApiResponse<{ isFile: boolean; isDirectory: boolean; size: number; mtime: Date }>
        >
        mkdir: (path: string) => Promise<ApiResponse>
        selectFile: () => Promise<ApiResponse<string>>
        selectDirectory: () => Promise<ApiResponse<string>>
      }
      clipboard: {
        readText: () => Promise<ApiResponse<string>>
        writeText: (text: string) => Promise<ApiResponse>
        readImage: () => Promise<ApiResponse<string>>
        writeImage: (dataUrl: string) => Promise<ApiResponse>
      }
      system: {
        getInfo: () => Promise<ApiResponse<{ platform: string; arch: string; version: string }>>
        openExternal: (url: string) => Promise<ApiResponse>
        showInFolder: (path: string) => Promise<ApiResponse>
      }
      http: {
        request: (options: Record<string, unknown>) => Promise<ApiResponse<unknown>>
      }
      storage: {
        get: (pluginId: string, key: string) => Promise<ApiResponse<unknown>>
        set: (pluginId: string, key: string, value: unknown) => Promise<ApiResponse>
        delete: (pluginId: string, key: string) => Promise<ApiResponse>
        clear: (pluginId: string) => Promise<ApiResponse>
      }
      app: {
        getPath: (name: string) => Promise<string>
      }
      sidebar: {
        setCollapsed: (collapsed: boolean) => Promise<ApiResponse>
      }
      settings: {
        getAll: () => Promise<Settings>
        getShortcuts: () => Promise<Settings['shortcuts']>
        setShortcut: (key: 'toggleWindow' | 'globalSearch', value: string) => Promise<ApiResponse>
        update: (partial: Partial<Settings>) => Promise<ApiResponse>
        reset: () => Promise<ApiResponse>
      }
      updater: {
        check: () => Promise<ApiResponse>
        download: () => Promise<ApiResponse>
        install: () => Promise<ApiResponse>
        onCheckingForUpdate: (callback: (event: unknown) => void) => void
        onUpdateAvailable: (callback: (event: unknown, info: UpdateInfo) => void) => void
        onUpdateNotAvailable: (
          callback: (event: unknown, info: { version: string }) => void
        ) => void
        onDownloadProgress: (callback: (event: unknown, progress: ProgressInfo) => void) => void
        onUpdateDownloaded: (callback: (event: unknown, info: UpdateInfo) => void) => void
        onError: (callback: (event: unknown, error: { message: string }) => void) => void
      }
      search: {
        openPlugin: (pluginId: string) => Promise<ApiResponse>
        close: () => Promise<ApiResponse>
      }
      apps: {
        list: () => Promise<ApiResponse<LocalApp[]>>
        listQuick: () => Promise<ApiResponse<Omit<LocalApp, 'icon'>[]>>
        open: (appPath: string) => Promise<ApiResponse>
        refresh: () => Promise<ApiResponse<LocalApp[]>>
        getIcon: (appPath: string) => Promise<ApiResponse<string>>
        preloadIcons: (appPaths: string[]) => Promise<ApiResponse<Record<string, string>>>
      }
      db: {
        addFavorite: (pluginId: string) => Promise<ApiResponse>
        removeFavorite: (pluginId: string) => Promise<ApiResponse>
        isFavorite: (pluginId: string) => Promise<boolean>
        getFavorites: () => Promise<Array<{ pluginId: string; addedAt: number }>>
        addRecent: (pluginId: string) => Promise<ApiResponse>
        getRecents: (
          limit?: number
        ) => Promise<Array<{ pluginId: string; lastAccessedAt: number; accessCount: number }>>
        clearRecents: () => Promise<ApiResponse>
      }
      tab: {
        showContextMenu: (tabId: string, index: number, total: number) => Promise<ApiResponse>
      }
    }
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        removeAllListeners: (channel: string) => void
      }
      process: {
        versions: Record<string, string>
      }
    }
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
        stat: (
          path: string
        ) => Promise<{ isFile: boolean; isDirectory: boolean; size: number; mtime: Date } | null>
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
        getInfo: () => Promise<{ platform: string; arch: string; version: string } | null>
        openExternal: (url: string) => Promise<boolean>
        showInFolder: (path: string) => Promise<boolean>
      }
      notification: {
        show: (options: { title: string; body: string; icon?: string }) => Promise<void>
      }
    }
    node: {
      fs: {
        readFile: (filePath: string) => Promise<string>
        writeFile: (filePath: string, content: string) => Promise<void>
        readdir: (dirPath: string) => Promise<string[]>
        exists: (filePath: string) => Promise<boolean>
        stat: (
          filePath: string
        ) => Promise<{ isFile: boolean; isDirectory: boolean; size: number; mtime: Date }>
        mkdir: (dirPath: string) => Promise<void>
        selectFile: () => Promise<string | null>
        selectDirectory: () => Promise<string | null>
      }
      spawn: (
        command: string,
        args?: string[],
        options?: { timeout?: number; input?: string; env?: Record<string, string> }
      ) => Promise<{ stdout: string; stderr: string; exitCode: number }>
      getPluginDir: () => Promise<string>
    }
    versions: Record<string, string>
  }
}

export {}
