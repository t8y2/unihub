// 插件市场相关类型定义

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  author: {
    name: string
    email?: string
    url?: string
  }
  icon?: string
  category: 'formatter' | 'tool' | 'encoder' | 'custom'
  keywords: string[]
  main: string // 入口文件路径
  permissions?: PluginPermission[]
  minAppVersion?: string
  repository?: string
  license?: string
}

export type PluginPermission = 'network' | 'filesystem' | 'clipboard' | 'notification'

export interface InstalledPluginInfo {
  id: string
  version: string
  enabled: boolean
  installedAt: string
  source: 'official' | 'url' | 'local'
  sourceUrl?: string
}

export interface PluginInstallOptions {
  zip?: string // ZIP 包 URL
  npm?: string // npm 包名
  github?: string // GitHub 仓库 (owner/repo)
}

export interface RemotePlugin {
  id: string
  name: string
  description: string
  version: string
  author: {
    name: string
    email?: string
    url?: string
  }
  icon?: string
  category: string
  keywords: string[]
  downloads?: number
  rating?: number
  updatedAt?: string
  install: PluginInstallOptions
}

export interface PluginUpdate {
  id: string
  currentVersion: string
  latestVersion: string
  changelog?: string
  install: PluginInstallOptions
}

export interface PluginStoreConfig {
  apiUrl: string
  enableAutoUpdate: boolean
  checkUpdateInterval: number // 小时
}
