import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      plugin: {
        install: (url: string) => Promise<{ success: boolean; message: string }>
        installFromBuffer: (buffer: number[], filename: string) => Promise<{ success: boolean; message: string }>
        uninstall: (pluginId: string) => Promise<{ success: boolean; message: string }>
        list: () => Promise<any[]>
        load: (
          pluginId: string
        ) => Promise<{ success: boolean; htmlPath?: string; devUrl?: string; message?: string }>
        backendCall: (pluginId: string, functionName: string, args: string) => Promise<string>
        dev: {
          register: (pluginId: string, devUrl: string, autoReload?: boolean) => Promise<{ success: boolean; error?: string }>
          unregister: (pluginId: string) => Promise<{ success: boolean; error?: string }>
          isDevMode: (pluginId: string) => Promise<{ success: boolean; data: boolean }>
          list: () => Promise<{ success: boolean; data: Array<{ id: string; url: string; autoReload: boolean }> }>
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
  }
}
