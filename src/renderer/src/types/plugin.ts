import type { Component } from 'vue'

export interface PluginMetadata {
  id: string
  name: string
  description: string
  version: string
  author: string
  icon: string // SVG path
  category: 'formatter' | 'tool' | 'encoder' | 'custom'
  keywords: string[]
  isThirdParty?: boolean // 标记是否为第三方插件
}

export interface PluginConfig {
  [key: string]: unknown
}

export interface Plugin {
  metadata: PluginMetadata
  component: Component
  enabled: boolean
  config?: PluginConfig
}

export type TabType = string // 改为字符串，支持动态插件 ID
