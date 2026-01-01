/**
 * 主进程常量配置
 */

// IPC 通道名称
export const IPC_CHANNELS = {
  // 插件相关
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_INSTALL_FROM_BUFFER: 'plugin:install-from-buffer',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_LIST: 'plugin:list',
  PLUGIN_LOAD: 'plugin:load',
  PLUGIN_OPEN: 'plugin:open',
  PLUGIN_CLOSE: 'plugin:close',
  PLUGIN_DESTROY: 'plugin:destroy',
  PLUGIN_UPDATE_BOUNDS: 'plugin:updateBounds',

  // 应用相关
  APP_GET_PATH: 'app:getPath',
  WINDOW_CLOSE: 'window:close',

  // 设置相关
  SETTINGS_GET_ALL: 'settings:getAll',
  SETTINGS_GET_SHORTCUTS: 'settings:getShortcuts',
  SETTINGS_SET_SHORTCUT: 'settings:setShortcut',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_RESET: 'settings:reset',

  // 数据库相关
  DB_ADD_FAVORITE: 'db:addFavorite',
  DB_REMOVE_FAVORITE: 'db:removeFavorite',
  DB_IS_FAVORITE: 'db:isFavorite',
  DB_GET_FAVORITES: 'db:getFavorites',
  DB_ADD_RECENT: 'db:addRecent',
  DB_GET_RECENTS: 'db:getRecents',
  DB_CLEAR_RECENTS: 'db:clearRecents',

  // 事件
  HANDLE_CLOSE_TAB: 'handle-close-tab'
} as const

// 窗口配置
export const WINDOW_CONFIG = {
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600
} as const

// 协议配置
export const PROTOCOL = {
  SCHEME: 'plugin',
  PREFIX: 'plugin://'
} as const

// 错误代码
export const ERROR_CODES = {
  ABORTED: -3,
  FAILED: -2
} as const

// 文件路径
export const PATHS = {
  PLUGINS_DIR: 'plugins',
  PLUGINS_DATA_FILE: 'plugins-data.json',
  CONFIG_DIR: 'config',
  SETTINGS_FILE: 'settings.json',
  DB_FILE: 'unihub.db'
} as const
