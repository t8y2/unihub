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
  SEARCH_CACHE_SIZE: 100, // 增加搜索缓存大小
  MAX_CACHED_VIEWS: 5,
  PLUGIN_PRELOAD_DELAY: 1000, // 插件预加载延迟（毫秒）
  IDLE_UNLOAD_THRESHOLD: 10 // 空闲时卸载插件的阈值
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

// ========== 设置页面 ==========
export const SETTINGS_TABS = [
  {
    id: 'general',
    name: '通用',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
  },
  {
    id: 'shortcuts',
    name: '快捷键',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  {
    id: 'about',
    name: '关于',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
] as const

export const SHORTCUT_LABELS: Record<string, string> = {
  toggleWindow: '显示/隐藏窗口',
  globalSearch: '全局搜索'
}

export const BUILTIN_SHORTCUTS = [
  { name: '关闭标签', shortcut: '⌘W / Ctrl+W' },
  { name: '新建标签', shortcut: '⌘N / Ctrl+N' },
  { name: '切换侧边栏', shortcut: '⌘B / Ctrl+B' },
  { name: '打开搜索', shortcut: '⌘K / Ctrl+K' }
] as const

export const KEYBOARD_KEY_MAP: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right'
}

export const MODIFIER_KEYS = ['Command', 'Ctrl', 'Alt', 'Shift'] as const
export const EXCLUDED_KEYS = ['Meta', 'Control', 'Alt', 'Shift'] as const

export const APP_INFO = {
  name: 'UniHub',
  version: '1.0.0',
  description: '开发者的通用工具集',
  author: 'UniHub Team',
  repository: 'https://github.com/t8y2/unihub',
  issues: 'https://github.com/t8y2/unihub/issues'
} as const

// ========== 插件市场 ==========
// 优先从 API 获取插件列表（实时更新），失败时回退到 CDN
export const MARKETPLACE_URL = import.meta.env.VITE_PLUGIN_API_URL
  ? `${import.meta.env.VITE_PLUGIN_API_URL}/plugins`
  : 'https://cdn.jsdelivr.net/gh/t8y2/unihub@main/marketplace/plugins.json'

// CDN 备用地址（用于 API 不可用时的降级）
export const MARKETPLACE_CDN_URL =
  'https://cdn.jsdelivr.net/gh/t8y2/unihub@main/marketplace/plugins.json'

export const MARKETPLACE_CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'tool', label: '工具' },
  { value: 'formatter', label: '格式化' },
  { value: 'encoder', label: '编码' },
  { value: 'productivity', label: '效率' },
  { value: 'developer', label: '开发者' }
] as const

// ========== 网络配置 ==========
export const NETWORK_CONFIG = {
  PLUGIN_DOWNLOAD_TIMEOUT: 60000, // 插件下载超时时间（毫秒）
  RETRY_ATTEMPTS: 3, // 重试次数
  RETRY_DELAY: 2000 // 重试延迟（毫秒）
} as const
