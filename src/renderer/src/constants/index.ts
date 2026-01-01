/**
 * 全局常量配置
 * 用于跨组件、跨模块共享的常量
 */

// ========== 存储键 ==========
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  LANGUAGE: 'language'
} as const

// ========== 分类配置 ==========
export const CATEGORY_NAMES: Record<string, string> = {
  formatter: '格式化',
  tool: '工具',
  encoder: '编码',
  custom: '自定义'
}

export const CATEGORY_ORDER = ['formatter', 'tool', 'encoder', 'custom']

export const DEFAULT_CATEGORIES = ['formatter', 'tool', 'encoder']

// ========== 限制配置 ==========
export const LIMITS = {
  RECENT_PLUGINS: 10,
  FAVORITE_DISPLAY: 6,
  SEARCH_CACHE_SIZE: 50,
  MAX_CACHED_VIEWS: 5
} as const

// ========== UI 尺寸 ==========
export const UI_SIZES = {
  SIDEBAR_WIDTH: 208, // w-52 = 13rem = 208px
  TITLE_BAR_HEIGHT: 36 // h-9 = 2.25rem = 36px
} as const

// ========== 快捷键 ==========
export const SHORTCUTS = {
  CLOSE_TAB: ['w'],
  NEW_TAB: ['n'],
  TOGGLE_SIDEBAR: ['b'],
  GLOBAL_SEARCH: ['k', 'p']
} as const

// ========== 来源标签 ==========
export const SOURCE_LABELS: Record<string, string> = {
  official: '官方',
  url: '第三方',
  local: '本地'
}

// ========== 错误代码 ==========
export const IGNORED_ERROR_CODES = ['ERR_ABORTED', 'ERR_FAILED']
