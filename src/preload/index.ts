import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  plugin: {
    install: (url: string) => ipcRenderer.invoke('plugin:install', url),
    installFromBuffer: (buffer: number[], filename: string) =>
      ipcRenderer.invoke('plugin:install-from-buffer', buffer, filename),
    uninstall: (pluginId: string) => ipcRenderer.invoke('plugin:uninstall', pluginId),
    list: () => ipcRenderer.invoke('plugin:list'),
    load: (pluginId: string) => ipcRenderer.invoke('plugin:load', pluginId),
    backendCall: (pluginId: string, functionName: string, args: string) =>
      ipcRenderer.invoke('plugin:backend-call', pluginId, functionName, args),
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
    writeImage: (dataUrl: string) => ipcRenderer.invoke('plugin-api:clipboard:writeImage', dataUrl)
  },
  // 系统 API
  system: {
    getInfo: () => ipcRenderer.invoke('plugin-api:system:getInfo'),
    openExternal: (url: string) => ipcRenderer.invoke('plugin-api:system:openExternal', url),
    showInFolder: (path: string) => ipcRenderer.invoke('plugin-api:system:showInFolder', path)
  },
  // HTTP API
  http: {
    request: (options: any) => ipcRenderer.invoke('plugin-api:http:request', options)
  },
  // 存储 API
  storage: {
    get: (pluginId: string, key: string) =>
      ipcRenderer.invoke('plugin-api:storage:get', pluginId, key),
    set: (pluginId: string, key: string, value: any) =>
      ipcRenderer.invoke('plugin-api:storage:set', pluginId, key, value),
    delete: (pluginId: string, key: string) =>
      ipcRenderer.invoke('plugin-api:storage:delete', pluginId, key),
    clear: (pluginId: string) => ipcRenderer.invoke('plugin-api:storage:clear', pluginId)
  },
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name)
  }
}

// 创建简化的 unihub API（用于插件）
const unihubAPI = {
  // 数据库 API（简化版，自动使用当前插件 ID）
  db: {
    put: async (key: string, value: any) => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      const result = await ipcRenderer.invoke('plugin-api:storage:set', pluginId, key, value)
      return result.success
    },
    get: async (key: string) => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      const result = await ipcRenderer.invoke('plugin-api:storage:get', pluginId, key)
      return result.success ? result.data : null
    },
    remove: async (key: string) => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      const result = await ipcRenderer.invoke('plugin-api:storage:delete', pluginId, key)
      return result.success
    },
    allKeys: async () => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      const result = await ipcRenderer.invoke('plugin-api:storage:allKeys', pluginId)
      return result.success ? result.data : []
    },
    clear: async () => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      const result = await ipcRenderer.invoke('plugin-api:storage:clear', pluginId)
      return result.success
    }
  },
  // 剪贴板 API
  clipboard: {
    readText: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:readText')
      return result.success ? result.data : ''
    },
    writeText: async (text: string) => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:writeText', text)
      return result.success
    },
    readImage: async () => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:readImage')
      return result.success ? result.data : null
    },
    writeImage: async (dataUrl: string) => {
      const result = await ipcRenderer.invoke('plugin-api:clipboard:writeImage', dataUrl)
      return result.success
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
    get: async (url: string, options?: any) => {
      const result = await ipcRenderer.invoke('plugin-api:http:request', {
        url,
        method: 'GET',
        ...options
      })
      return result.success ? result.data : null
    },
    post: async (url: string, data: any, options?: any) => {
      const result = await ipcRenderer.invoke('plugin-api:http:request', {
        url,
        method: 'POST',
        body: data,
        ...options
      })
      return result.success ? result.data : null
    },
    request: async (options: any) => {
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
      return result.success
    }
  },
  // 后端调用 API
  backend: {
    call: async (functionName: string, args: any) => {
      const pluginId = (window as any).__UNIHUB_PLUGIN_ID__ || 'unknown'
      return await ipcRenderer.invoke(
        'plugin:backend-call',
        pluginId,
        functionName,
        JSON.stringify(args)
      )
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('unihub', unihubAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
  // @ts-ignore
  window.unihub = unihubAPI
}
