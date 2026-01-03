/**
 * 通用类型定义
 */

// 标签类型
export type TabType =
  | 'plugin'
  | 'management'
  | 'settings'
  | 'favorites'
  | 'recents'
  | 'web-navigator'

// 标签接口
export interface Tab {
  id: string
  pluginId: string
  title: string
  type: TabType
}

// 插件来源
export type PluginSource = 'official' | 'url' | 'local'

// 分类类型
export type CategoryType = 'formatter' | 'tool' | 'encoder' | 'custom'

// 主题类型
export type ThemeType = 'light' | 'dark' | 'system'

// 操作结果
export interface OperationResult<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页结果
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
