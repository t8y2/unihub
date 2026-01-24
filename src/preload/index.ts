import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  plugin: {
    install: (url: string) => ipcRenderer.invoke('plugin:install', url),
    installFromBuffer: (buffer: number[], filename: string) =>
      ipcRenderer.invoke('plugin:install-from-buffer', buffer, filename),
    uninstall: (pluginId: string) => ipcRenderer.invoke('plugin:uninstall', pluginId),
    list: () => ipcRenderer.invoke('plugin:list'),
    checkUpdates: (marketplaceUrl: string) =>
      ipcRenderer.invoke('plugin:checkUpdates', marketplaceUrl),
    update: (pluginId: string, downloadUrl: string) =>
      ipcRenderer.invoke('plugin:update', pluginId, downloadUrl),
    load: (pluginId: string) => ipcRenderer.invoke('plugin:load', pluginId),
    open: (pluginId: string) => ipcRenderer.invoke('plugin:open', pluginId),
    close: (pluginId: string) => ipcRenderer.invoke('plugin:close', pluginId),
    destroy: (pluginId: string) => ipcRenderer.invoke('plugin:destroy', pluginId),
    updateBounds: (
      pluginId: string,
      bounds: { x: number; y: number; width: number; height: number }
    ) => ipcRenderer.invoke('plugin:updateBounds', pluginId, bounds),
    hideForSearch: () => ipcRenderer.invoke('plugin:hide-for-search'),
    restoreAfterSearch: () => ipcRenderer.invoke('plugin:restore-after-search'),
    // 开发模式 API
    dev: {
      register: (pluginId: string, devUrl: string, autoReload?: boolean) =>
        ipcRenderer.invoke('plugin:dev:register', pluginId, devUrl, autoReload),
      unregister: (pluginId: string) => ipcRenderer.invoke('plugin:dev:unregister', pluginId),
      isDevMode: (pluginId: string) => ipcRenderer.invoke('plugin:dev:isDevMode', pluginId),
      list: () => ipcRenderer.invoke('plugin:dev:list')
    }
  },
  // 文件系统 API
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('plugin-api:fs:readFile', path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke('plugin-api:fs:writeFile', path, content),
    readDir: (path: string) => ipcRenderer.invoke('plugin-api:fs:readDir', path),
    exists: (path: string) => ipcRenderer.invoke('plugin-api:fs:exists', path),
    stat: (path: string) => ipcRenderer.invoke('plugin-api:fs:stat', path),
    mkdir: (path: string) => ipcRenderer.invoke('plugin-api:fs:mkdir', path),
    selectFile: () => ipcRenderer.invoke('plugin-api:fs:selectFile'),
    selectDirectory: () => ipcRenderer.invoke('plugin-api:fs:selectDirectory')
  },
  // 剪贴板 API
  clipboard: {
    readText: () => ipcRenderer.invoke('plugin-api:clipboard:readText'),
    writeText: (text: string) => ipcRenderer.invoke('plugin-api:clipboard:writeText', text),
    readImage: () => ipcRenderer.invoke('plugin-api:clipboard:readImage'),
    writeImage: (dataUrl: string) => ipcRenderer.invoke('plugin-api:clipboard:writeImage', dataUrl),
    subscribe: () => ipcRenderer.invoke('plugin-api:clipboard:subscribe'),
    unsubscribe: () => ipcRenderer.invoke('plugin-api:clipboard:unsubscribe'),
    onChange: (
      callback: (data: { content: string; timestamp: number }) => void
    ): (() => Electron.IpcRenderer) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: { content: string; timestamp: number }
      ): void => callback(data)
      ipcRenderer.on('clipboard-changed', handler)
      return (): Electron.IpcRenderer => ipcRenderer.removeListener('clipboard-changed', handler)
    }
  },
  // 系统 API
  system: {
    getInfo: () => ipcRenderer.invoke('plugin-api:system:getInfo'),
    openExternal: (url: string) => ipcRenderer.invoke('plugin-api:system:openExternal', url),
    showInFolder: (path: string) => ipcRenderer.invoke('plugin-api:system:showInFolder', path)
  },
  // HTTP API
  http: {
    request: (options: Record<string, unknown>) =>
      ipcRenderer.invoke('plugin-api:http:request', options)
  },
  // 存储 API
  storage: {
    get: (pluginId: string, key: string) =>
      ipcRenderer.invoke('plugin-api:storage:get', pluginId, key),
    set: (pluginId: string, key: string, value: unknown) =>
      ipcRenderer.invoke('plugin-api:storage:set', pluginId, key, value),
    delete: (pluginId: string, key: string) =>
      ipcRenderer.invoke('plugin-api:storage:delete', pluginId, key),
    clear: (pluginId: string) => ipcRenderer.invoke('plugin-api:storage:clear', pluginId)
  },
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name)
  },
  sidebar: {
    setCollapsed: (collapsed: boolean) => ipcRenderer.invoke('sidebar:collapsed', collapsed)
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    getShortcuts: () => ipcRenderer.invoke('settings:getShortcuts'),
    setShortcut: (key: 'toggleWindow' | 'globalSearch', value: string) =>
      ipcRenderer.invoke('settings:setShortcut', key, value),
    setPluginShortcut: (pluginId: string, value: string) =>
      ipcRenderer.invoke('settings:setPluginShortcut', pluginId, value),
    removePluginShortcut: (pluginId: string) =>
      ipcRenderer.invoke('settings:removePluginShortcut', pluginId),
    update: (partial: Record<string, unknown>) => ipcRenderer.invoke('settings:update', partial),
    reset: () => ipcRenderer.invoke('settings:reset')
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    onCheckingForUpdate: (callback: (_event: unknown) => void) => {
      ipcRenderer.on('updater:checking-for-update', callback)
    },
    onUpdateAvailable: (
      callback: (
        _event: unknown,
        info: { version: string; releaseDate: string; releaseNotes?: string }
      ) => void
    ) => {
      ipcRenderer.on('updater:update-available', callback)
    },
    onUpdateNotAvailable: (callback: (_event: unknown, info: { version: string }) => void) => {
      ipcRenderer.on('updater:update-not-available', callback)
    },
    onDownloadProgress: (
      callback: (
        _event: unknown,
        progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }
      ) => void
    ) => {
      ipcRenderer.on('updater:download-progress', callback)
    },
    onUpdateDownloaded: (
      callback: (
        _event: unknown,
        info: { version: string; releaseDate: string; releaseNotes?: string }
      ) => void
    ) => {
      ipcRenderer.on('updater:update-downloaded', callback)
    },
    onError: (callback: (_event: unknown, error: { message: string }) => void) => {
      ipcRenderer.on('updater:update-error', callback)
    }
  },
  search: {
    openPlugin: (pluginId: string) => ipcRenderer.invoke('search:open-plugin', pluginId),
    close: () => ipcRenderer.invoke('search:close')
  },
  apps: {
    list: () => ipcRenderer.invoke('apps:list'),
    listQuick: () => ipcRenderer.invoke('apps:listQuick'),
    open: (appPath: string) => ipcRenderer.invoke('apps:open', appPath),
    refresh: () => ipcRenderer.invoke('apps:refresh'),
    getIcon: (appPath: string) => ipcRenderer.invoke('apps:getIcon', appPath),
    preloadIcons: (appPaths: string[]) => ipcRenderer.invoke('apps:preloadIcons', appPaths)
  },
  db: {
    addFavorite: (pluginId: string) => ipcRenderer.invoke('db:addFavorite', pluginId),
    removeFavorite: (pluginId: string) => ipcRenderer.invoke('db:removeFavorite', pluginId),
    isFavorite: (pluginId: string) => ipcRenderer.invoke('db:isFavorite', pluginId),
    getFavorites: () => ipcRenderer.invoke('db:getFavorites'),
    addRecent: (pluginId: string) => ipcRenderer.invoke('db:addRecent', pluginId),
    getRecents: (limit?: number) => ipcRenderer.invoke('db:getRecents', limit),
    clearRecents: () => ipcRenderer.invoke('db:clearRecents')
  },
  tab: {
    showContextMenu: (tabId: string, index: number, total: number) =>
      ipcRenderer.invoke('tab:show-context-menu', tabId, index, total)
  }
}

// 创建简化的 unihub API（用于插件）
const unihubAPI = {
  // 数据库 API（简化版，自动使用当前插件 ID）
  db: {
    get: async (key: string) => {
      const pluginId = getPluginId()
      const result = await ipcRenderer.invoke('plugin-api:storage:get', pluginId, key)
      if (!result.success) throw new Error(result.error || '读取失败')
      return result.data
    },
    set: async (key: string, value: unknown) => {
      const pluginId = getPluginId()
      const result = await ipcRenderer.invoke('plugin-api:storage:set', pluginId, key, value)
      if (!result.success) throw new Error(result.error || '保存失败')
    },
    delete: async (key: string) => {
      const pluginId = getPluginId()
      const result = await ipcRenderer.invoke('plugin-api:storage:delete', pluginId, key)
      if (!result.success) throw new Error(result.error || '删除失败')
    },
    keys: async () => {
      const pluginId = getPluginId()
      const result = await ipcRenderer.invoke('plugin-api:storage:allKeys', pluginId)
      if (!result.success) throw new Error(result.error || '获取键列表失败')
      return result.data || []
    },
    clear: async () => {
      const pluginId = getPluginId()
      const result = await ipcRenderer.invoke('plugin-api:storage:clear', pluginId)
      if (!result.success) throw new Error(result.error || '清空失败')
    }
  },
  // 剪贴板 API
  clipboard: {
    readText: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:readText')
      if (!result.success) throw new Error(result.error || '读取剪贴板失败')
      return result.data || ''
    },
    writeText: async (text: string) => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:writeText', text)
      if (!result.success) throw new Error(result.error || '写入剪贴板失败')
    },
    readImage: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:readImage')
      if (!result.success) throw new Error(result.error || '读取图片失败')
      return result.data || null
    },
    writeImage: async (dataUrl: string) => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:writeImage', dataUrl)
      if (!result.success) throw new Error(result.error || '写入图片失败')
    },
    subscribe: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:subscribe')
      if (!result.success) throw new Error(result.error || '订阅剪贴板失败')
    },
    unsubscribe: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:unsubscribe')
      if (!result.success) throw new Error(result.error || '取消订阅失败')
    },
    onChange: (
      callback: (data: { content: string; timestamp: number }) => void
    ): (() => Electron.IpcRenderer) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: { content: string; timestamp: number }
      ): void => callback(data)
      ipcRenderer.on('clipboard-changed', handler)
      return (): Electron.IpcRenderer => ipcRenderer.removeListener('clipboard-changed', handler)
    }
  },
  // 文件系统 API
  fs: {
    readFile: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:readFile', path)
      return result.success ? result.data : null
    },
    writeFile: async (path: string, content: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:writeFile', path, content)
      return result.success
    },
    readDir: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:readDir', path)
      return result.success ? result.data : []
    },
    exists: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:exists', path)
      return result.success ? result.data : false
    },
    stat: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:stat', path)
      return result.success ? result.data : null
    },
    mkdir: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:fs:mkdir', path)
      return result.success
    },
    selectFile: async () => {
      const result = await ipcRenderer.invoke('plugin-api:fs:selectFile')
      return result.success ? result.data : null
    },
    selectDirectory: async () => {
      const result = await ipcRenderer.invoke('plugin-api:fs:selectDirectory')
      return result.success ? result.data : null
    }
  },
  // HTTP API
  http: {
    get: async (url: string, options?: Record<string, unknown>) => {
      const result = await ipcRenderer.invoke('plugin-api:http:request', {
        url,
        method: 'GET',
        ...options
      })
      return result.success ? result.data : null
    },
    post: async (url: string, data: unknown, options?: Record<string, unknown>) => {
      const result = await ipcRenderer.invoke('plugin-api:http:request', {
        url,
        method: 'POST',
        body: data,
        ...options
      })
      return result.success ? result.data : null
    },
    request: async (options: Record<string, unknown>) => {
      const result = await ipcRenderer.invoke('plugin-api:http:request', options)
      return result.success ? result.data : null
    }
  },
  // 系统 API
  system: {
    getInfo: async () => {
      const result = await ipcRenderer.invoke('plugin-api:system:getInfo')
      return result.success ? result.data : null
    },
    openExternal: async (url: string) => {
      const result = await ipcRenderer.invoke('plugin-api:system:openExternal', url)
      return result.success
    },
    showInFolder: async (path: string) => {
      const result = await ipcRenderer.invoke('plugin-api:system:showInFolder', path)
      return result.success
    }
  },
  // 通知 API
  notification: {
    show: async (options: { title: string; body: string; icon?: string }) => {
      const result = await ipcRenderer.invoke('plugin-api:notification:show', options)
      if (!result.success) throw new Error(result.error || '显示通知失败')
    }
  }
}

// 创建 Node.js API（用于插件）
const nodeAPI = {
  // 文件系统 API（限制在插件目录内）
  fs: {
    readFile: async (filePath: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:readFile', pluginId, filePath)
    },
    writeFile: async (filePath: string, content: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:writeFile', pluginId, filePath, content)
    },
    readdir: async (dirPath: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:readdir', pluginId, dirPath)
    },
    exists: async (filePath: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:exists', pluginId, filePath)
    },
    stat: async (filePath: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:stat', pluginId, filePath)
    },
    mkdir: async (dirPath: string) => {
      const pluginId = getPluginId()
      return await ipcRenderer.invoke('node-api:fs:mkdir', pluginId, dirPath)
    },
    selectFile: async () => {
      return await ipcRenderer.invoke('node-api:fs:selectFile')
    },
    selectDirectory: async () => {
      return await ipcRenderer.invoke('node-api:fs:selectDirectory')
    }
  },
  // 子进程 API（Sidecar 模式）
  spawn: async (
    command: string,
    args: string[] = [],
    options: { timeout?: number; input?: string; env?: Record<string, string> } = {}
  ) => {
    const pluginId = getPluginId()
    console.log('🚀 Spawn 调用 - 插件 ID:', pluginId, '命令:', command)
    const result = await ipcRenderer.invoke('node-api:spawn', pluginId, command, args, options)
    if (!result.success) {
      throw new Error(result.error || '进程执行失败')
    }
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode || 0
    }
  },
  // 获取插件目录
  getPluginDir: async () => {
    const pluginId = getPluginId()
    const result = await ipcRenderer.invoke('node-api:getPluginDir', pluginId)
    if (!result.success) {
      throw new Error(result.error || '获取插件目录失败')
    }
    return result.data
  }
}

// 辅助函数：获取插件 ID
function getPluginId(): string {
  // 尝试从 URL 参数读取
  try {
    const params = new URLSearchParams(window.location.search)
    const pluginId = params.get('__plugin_id')
    if (pluginId) {
      return pluginId
    }
  } catch (error) {
    console.error('从 URL 读取插件 ID 失败:', error)
  }

  // 尝试从 window 对象读取
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowPluginId = (window as any).__UNIHUB_PLUGIN_ID__
  if (windowPluginId) {
    return windowPluginId
  }

  console.warn('⚠️ 无法获取插件 ID，使用 unknown')
  return 'unknown'
}

// 版本信息
const versions = {
  electron: process.versions.electron,
  node: process.versions.node,
  chrome: process.versions.chrome
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('unihub', unihubAPI)
    contextBridge.exposeInMainWorld('node', nodeAPI)
    contextBridge.exposeInMainWorld('versions', versions)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (fallback for non-isolated context)
  window.electron = electronAPI
  // @ts-ignore (fallback for non-isolated context)
  window.api = api
  // @ts-ignore (fallback for non-isolated context)
  window.unihub = unihubAPI
  // @ts-ignore (fallback for non-isolated context)
  window.node = nodeAPI
  // @ts-ignore (fallback for non-isolated context)
  window.versions = versions
}
