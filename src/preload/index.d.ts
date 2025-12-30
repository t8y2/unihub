import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      plugin: {
        install: (url: string) => Promise<{ success: boolean; message: string }>
        uninstall: (pluginId: string) => Promise<{ success: boolean; message: string }>
        list: () => Promise<any[]>
        load: (pluginId: string) => Promise<{ success: boolean; htmlPath?: string; message?: string }>
        backendCall: (pluginId: string, functionName: string, args: string) => Promise<string>
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
