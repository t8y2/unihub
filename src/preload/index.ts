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
      ipcRenderer.invoke('plugin:backend-call', pluginId, functionName, args)
  },
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content)
  },
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
