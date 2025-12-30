// UniHub API 类型定义
export interface UniHubAPI {
  plugin: {
    backendCall: (pluginId: string, functionName: string, args: string) => Promise<string>
  }
}

declare global {
  interface Window {
    api: UniHubAPI
  }
}

export {}