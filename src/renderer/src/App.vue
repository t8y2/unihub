<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, provide } from 'vue'
import { pluginRegistry, initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'
import { PluginIcon } from './components/ui/plugin-icon'
import HomePage from './components/HomePage.vue'
import PluginManagementPage from './components/PluginManagementPage.vue'
import SettingsPage from './components/SettingsPage.vue'
import FavoritesPage from './components/FavoritesPage.vue'
import RecentsPage from './components/RecentsPage.vue'
import WebNavigator from './components/WebNavigator.vue'
import GlobalSearch from './components/GlobalSearch.vue'
import UpdateNotification from './components/UpdateNotification.vue'
import { Toaster } from './components/ui/sonner'
import { Kbd } from './components/ui/kbd'
import { STORAGE_KEYS, CATEGORY_NAMES, DEFAULT_CATEGORIES } from '@/constants'
import { usePluginData } from './composables/usePluginData'
import { useKeyboard } from './composables/useKeyboard'
import type { Tab, TabType } from '@/types/common'

// UI 状态
const isDark = ref(false)
const sidebarCollapsed = ref(false)
const showGlobalSearch = ref(false)
const expandedCategories = ref(new Set(DEFAULT_CATEGORIES))
const globalSearchShortcut = ref('⌘K')

// 更新通知组件引用
const updateNotificationRef = ref<InstanceType<typeof UpdateNotification> | null>(null)

// 防止快速连续按 cmd+w 导致的竞态条件（组件级别的锁）
let isClosingTab = false
let pendingWindowClose: ReturnType<typeof setTimeout> | null = null
const CLOSE_TAB_DEBOUNCE_MS = 50 // 标签关闭防抖时间
const WINDOW_CLOSE_DELAY_MS = 100 // 窗口关闭延迟时间

// 检查是否有 plugin 类型的标签（使用 WebContentsView）
const hasPluginTabs = (): boolean => {
  return tabs.value.some((t) => t.type === 'plugin')
}

// 统一的关闭标签处理函数
const handleCloseTabRequest = (): void => {
  // 如果有待执行的窗口关闭，取消它
  if (pendingWindowClose) {
    clearTimeout(pendingWindowClose)
    pendingWindowClose = null
  }

  // 检查锁
  if (isClosingTab) {
    return
  }

  const currentTabCount = tabs.value.length

  if (currentTabCount === 0) {
    // 没有标签页，关闭窗口
    // 只有在之前有 plugin 标签时才延迟（防止 WebContentsView 焦点切换问题）
    if (pendingWindowClose === null) {
      // 使用短延迟确保不会误关闭
      pendingWindowClose = setTimeout(() => {
        pendingWindowClose = null
        if (tabs.value.length === 0) {
          window.electron.ipcRenderer.send('window:close')
        }
      }, WINDOW_CLOSE_DELAY_MS)
    }
  } else if (activeTabId.value) {
    const currentTab = tabs.value.find((t) => t.id === activeTabId.value)
    const isPluginTab = currentTab?.type === 'plugin'

    // 有标签页，关闭当前标签
    isClosingTab = true
    closeTab(activeTabId.value)

    // 只有关闭 plugin 标签且还有其他 plugin 标签时才需要防抖
    const stillHasPluginTabs = hasPluginTabs()
    const debounceTime = isPluginTab && stillHasPluginTabs ? CLOSE_TAB_DEBOUNCE_MS : 0

    setTimeout(() => {
      isClosingTab = false
    }, debounceTime)
  }
}

// 提供手动检查更新的方法
provide('checkForUpdates', () => {
  updateNotificationRef.value?.checkForUpdates()
})

// 使用插件数据 composable
const { recentPlugins, favoritePlugins, loadAll, addRecent, toggleFavorite } = usePluginData()

// 切换分类展开状态
const toggleCategory = (category: string): void => {
  expandedCategories.value.has(category)
    ? expandedCategories.value.delete(category)
    : expandedCategories.value.add(category)
}

// 初始化应用
const initializeApp = async (): Promise<void> => {
  const startTime = performance.now()

  // 初始化插件系统（同步，快速）
  initPlugins()

  // 加载第三方插件（异步，不阻塞）
  requestIdleCallback(
    async () => {
      try {
        await pluginInstaller.loadInstalledPlugins()
      } catch (error) {
        console.error('加载第三方插件失败:', error)
      }
    },
    { timeout: 2000 }
  )

  // 恢复主题设置（同步，快速）
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // 恢复侧边栏状态（同步，快速）
  sidebarCollapsed.value = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'

  // 通知主进程当前侧边栏状态
  window.api.sidebar.setCollapsed(sidebarCollapsed.value)

  // 加载快捷键设置（异步，不阻塞）
  window.api.settings
    .getShortcuts()
    .then((shortcuts) => {
      globalSearchShortcut.value = shortcuts.globalSearch || '⌘K'
      console.log('已加载全局搜索快捷键:', globalSearchShortcut.value)
    })
    .catch((error) => {
      console.error('加载快捷键设置失败:', error)
    })

  // 加载插件数据（异步，不阻塞）
  requestIdleCallback(
    () => {
      loadAll()
    },
    { timeout: 1000 }
  )

  const endTime = performance.now()
  console.log(`⚡ 应用初始化完成，耗时 ${(endTime - startTime).toFixed(2)}ms`)
}

// 侧边栏元素引用
const sidebarRef = ref<HTMLElement | null>(null)

// 更新插件视图布局
const updatePluginViewLayout = (): void => {
  if (!sidebarRef.value) return

  const sidebarWidth = sidebarRef.value.offsetWidth
  const titleBarHeight = 36

  // 通知主进程更新当前可见插件的视图大小
  window.electron.ipcRenderer.send('update-plugin-view-layout', {
    sidebarWidth,
    titleBarHeight
  })
}

onMounted(() => {
  initializeApp()

  // 使用 ResizeObserver 监听侧边栏宽度变化
  if (sidebarRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      updatePluginViewLayout()
    })
    resizeObserver.observe(sidebarRef.value)

    // 清理
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }

  window.electron.ipcRenderer.on('handle-close-tab', () => {
    handleCloseTabRequest()
  })

  // 监听 ESC 键事件（从主进程转发）
  window.electron.ipcRenderer.on('handle-escape-key', () => {
    // 如果搜索窗口打开，关闭它
    if (showGlobalSearch.value) {
      showGlobalSearch.value = false
    }
  })

  // 监听全局搜索快捷键
  window.electron.ipcRenderer.on('open-global-search', () => {
    showGlobalSearch.value = true
  })

  // 监听从搜索窗口打开插件
  window.electron.ipcRenderer.on(
    'open-plugin-from-search',
    (_event: unknown, ...args: unknown[]) => {
      const pluginId = args[0] as string
      // 打开插件
      openTab(pluginId)
    }
  )

  // 监听快捷键注册失败
  window.electron.ipcRenderer.on(
    'shortcut-register-failed',
    (_event: unknown, ...args: unknown[]) => {
      // const _key = args[0] as string
      const shortcut = args[1] as string
      console.warn(`快捷键 ${shortcut} 注册失败，可能被系统占用`)
      // 可以在这里显示一个提示
    }
  )

  // 监听全局搜索快捷键
  window.addEventListener('keydown', handleGlobalSearchShortcut)

  // 监听窗口大小变化
  window.electron.ipcRenderer.on('window-resized', () => {
    updatePluginViewLayout()
  })

  // 监听标签右键菜单事件
  window.electron.ipcRenderer.on('tab:close', (_event: unknown, ...args: unknown[]) => {
    const tabId = args[0] as string
    closeTab(tabId)
  })

  window.electron.ipcRenderer.on('tab:close-others', (_event: unknown, ...args: unknown[]) => {
    const tabId = args[0] as string
    closeOtherTabs(tabId)
  })

  window.electron.ipcRenderer.on('tab:close-left', (_event: unknown, ...args: unknown[]) => {
    const tabId = args[0] as string
    closeLeftTabs(tabId)
  })

  window.electron.ipcRenderer.on('tab:close-right', (_event: unknown, ...args: unknown[]) => {
    const tabId = args[0] as string
    closeRightTabs(tabId)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalSearchShortcut)
})

// 处理全局搜索快捷键
const handleGlobalSearchShortcut = (e: KeyboardEvent): void => {
  if (!shouldHandleShortcut()) return

  const shortcut = globalSearchShortcut.value
  if (!shortcut) return

  // 解析快捷键
  const parts = shortcut.split('+')
  const hasCommand = parts.includes('Command') && e.metaKey
  const hasCtrl = parts.includes('Ctrl') && e.ctrlKey
  const hasAlt = parts.includes('Alt') && e.altKey
  const hasShift = parts.includes('Shift') && e.shiftKey

  // 获取主键
  const mainKey = parts.find((p) => !['Command', 'Ctrl', 'Alt', 'Shift'].includes(p))
  if (!mainKey) return

  // 检查是否匹配
  const keyMatches =
    mainKey === 'Space'
      ? e.key === ' ' || e.code === 'Space'
      : e.key.toUpperCase() === mainKey.toUpperCase() || e.key === mainKey

  const modifiersMatch =
    (parts.includes('Command') ? hasCommand : !e.metaKey) &&
    (parts.includes('Ctrl') ? hasCtrl : !e.ctrlKey) &&
    (parts.includes('Alt') ? hasAlt : !e.altKey) &&
    (parts.includes('Shift') ? hasShift : !e.shiftKey)

  if (keyMatches && modifiersMatch) {
    e.preventDefault()
    showGlobalSearch.value = true
  }
}

// 检查是否应该处理快捷键
const shouldHandleShortcut = (key?: string): boolean => {
  // Cmd+N 总是允许（新建标签）
  if (key === 'n') {
    console.log('[shouldHandleShortcut] Cmd+N 总是允许')
    return true
  }

  const activeTab = tabs.value.find((t) => t.id === activeTabId.value)
  if (!activeTab || activeTab.type !== 'plugin') {
    console.log('[shouldHandleShortcut] 没有活动标签或不是插件标签，允许')
    return true
  }

  const plugin = pluginRegistry.get(activeTab.pluginId)
  const result = !plugin?.metadata.isThirdParty
  console.log(
    '[shouldHandleShortcut] 插件:',
    activeTab.pluginId,
    '是否第三方:',
    plugin?.metadata.isThirdParty,
    '结果:',
    result
  )
  return result
}

// 使用键盘快捷键 composable
useKeyboard(
  {
    w: () => {
      handleCloseTabRequest()
    },
    n: () => addHomeTab(),
    b: () => toggleSidebar()
  },
  shouldHandleShortcut
)

// 监听全局搜索显示/隐藏，通知主进程隐藏/恢复插件视图
watch(showGlobalSearch, (visible) => {
  if (visible) {
    // 搜索显示时，通知主进程隐藏当前插件
    window.api.plugin.hideForSearch()

    // 延迟一下，确保焦点设置生效
    setTimeout(() => {
      // 再次确保搜索输入框获得焦点
      const searchInput = document.querySelector(
        'input[placeholder*="搜索插件"]'
      ) as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  } else {
    // 搜索关闭时，通知主进程恢复插件
    window.api.plugin.restoreAfterSearch()
  }
})

// 监听侧边栏状态变化，通知主进程更新视图布局
watch(sidebarCollapsed, (collapsed) => {
  window.api.sidebar.setCollapsed(collapsed)
})

// 主题切换
const toggleTheme = (): void => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem(STORAGE_KEYS.THEME, isDark.value ? 'dark' : 'light')

  // 通知所有插件视图主题已变化
  window.electron.ipcRenderer.send('theme-changed', isDark.value ? 'dark' : 'light')
}

// 侧边栏切换
const toggleSidebar = (): void => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed.value))
}

// 打开本地应用
const handleOpenApp = async (appPath: string): Promise<void> => {
  try {
    const result = await window.api.apps.open(appPath)
    if (!result.success) {
      console.error('打开应用失败:', result.error)
    }
  } catch (error) {
    console.error('打开应用失败:', error)
  }
}

// 标签管理
const tabs = ref<Tab[]>([])
const activeTabId = ref('')

// 处理第三方插件视图的显示/隐藏
const handleThirdPartyPlugin = (tabId: string, action: 'open' | 'close'): void => {
  if (!tabId) return

  const tab = tabs.value.find((t) => t.id === tabId)
  if (!tab || tab.type !== 'plugin') return

  const plugin = pluginRegistry.get(tab.pluginId)
  if (plugin?.metadata.isThirdParty) {
    window.api.plugin[action](tab.pluginId)
  }
}

// 监听标签切换，自动显示/隐藏第三方插件视图
watch(activeTabId, (newTabId, oldTabId) => {
  handleThirdPartyPlugin(oldTabId, 'close')
  handleThirdPartyPlugin(newTabId, 'open')
})

// 获取所有启用的插件
const enabledPlugins = computed(() => {
  void pluginRegistry.version.value
  return pluginRegistry.getEnabled()
})

// 按分类获取插件
const pluginsByCategory = computed(() => {
  void pluginRegistry.version.value
  const categories = new Map<string, typeof enabledPlugins.value>()

  for (const plugin of enabledPlugins.value) {
    const category = plugin.metadata.category
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)!.push(plugin)
  }

  return categories
})

// 创建或激活标签的通用函数
const createOrActivateTab = (
  type: TabType,
  pluginId: string,
  title: string,
  matcher?: (tab: Tab) => boolean
): void => {
  console.log('[createOrActivateTab] 参数:', { type, pluginId, title })
  const existingTab = tabs.value.find(matcher || ((t) => t.type === type))
  console.log('[createOrActivateTab] 找到已存在的标签:', existingTab)

  if (existingTab) {
    console.log('[createOrActivateTab] 激活已存在的标签:', existingTab.id)
    activeTabId.value = existingTab.id
    return
  }

  const newTab: Tab = {
    id: Date.now().toString(),
    pluginId,
    title,
    type
  }
  console.log('[createOrActivateTab] 创建新标签:', newTab)
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
  console.log('[createOrActivateTab] 标签创建完成，当前标签数:', tabs.value.length)
}

// 打开插件标签
const openTab = (pluginId: string): void => {
  const plugin = pluginRegistry.get(pluginId)
  if (!plugin?.enabled) return

  addRecent(pluginId)

  createOrActivateTab(
    'plugin',
    pluginId,
    plugin.metadata.name,
    (t) => t.pluginId === pluginId && t.type === 'plugin'
  )

  if (plugin.metadata.isThirdParty) {
    window.api.plugin.open(pluginId)
  }
}

// 打开系统页面
const openPluginManagement = (): void =>
  createOrActivateTab('management', 'plugin-management', '插件管理')

const openSettings = (): void => createOrActivateTab('settings', 'settings', '设置')

const openFavorites = (): void => createOrActivateTab('favorites', 'favorites', '收藏')

const openRecents = (): void => createOrActivateTab('recents', 'recents', '最近使用')

const openWebNavigator = (): void =>
  createOrActivateTab('web-navigator', 'web-navigator', '网站导航')

// 关闭标签
const closeTab = (tabId: string): void => {
  const index = tabs.value.findIndex((t) => t.id === tabId)
  if (index === -1) return

  handleThirdPartyPlugin(tabId, 'close')

  // 切换到相邻标签
  if (activeTabId.value === tabId) {
    if (tabs.value.length > 1) {
      const nextIndex = index === tabs.value.length - 1 ? index - 1 : index + 1
      activeTabId.value = tabs.value[nextIndex].id
    } else {
      activeTabId.value = ''
    }
  }

  tabs.value.splice(index, 1)
}

// 关闭其他标签
const closeOtherTabs = (tabId: string): void => {
  const tab = tabs.value.find((t) => t.id === tabId)
  if (!tab) return

  // 关闭所有第三方插件
  tabs.value.forEach((t) => {
    if (t.id !== tabId) {
      handleThirdPartyPlugin(t.id, 'close')
    }
  })

  // 只保留当前标签
  tabs.value = [tab]
  activeTabId.value = tabId
}

// 关闭左侧标签
const closeLeftTabs = (tabId: string): void => {
  const index = tabs.value.findIndex((t) => t.id === tabId)
  if (index === -1 || index === 0) return

  // 关闭左侧所有第三方插件
  for (let i = 0; i < index; i++) {
    handleThirdPartyPlugin(tabs.value[i].id, 'close')
  }

  // 删除左侧标签
  tabs.value.splice(0, index)

  // 如果当前激活的标签被关闭了，激活目标标签
  if (!tabs.value.find((t) => t.id === activeTabId.value)) {
    activeTabId.value = tabId
  }
}

// 关闭右侧标签
const closeRightTabs = (tabId: string): void => {
  const index = tabs.value.findIndex((t) => t.id === tabId)
  if (index === -1 || index === tabs.value.length - 1) return

  // 关闭右侧所有第三方插件
  for (let i = index + 1; i < tabs.value.length; i++) {
    handleThirdPartyPlugin(tabs.value[i].id, 'close')
  }

  // 删除右侧标签
  tabs.value.splice(index + 1)

  // 如果当前激活的标签被关闭了，激活目标标签
  if (!tabs.value.find((t) => t.id === activeTabId.value)) {
    activeTabId.value = tabId
  }
}

// 显示标签右键菜单（使用原生菜单）
const showTabContextMenu = (tabId: string, index: number): void => {
  window.api.tab.showContextMenu(tabId, index, tabs.value.length)
}

// 回到主页（修改为创建或激活主页标签，而不是关闭所有标签）
const goHome = (): void => {
  addHomeTab()
}

// 新建主页标签
const addHomeTab = (): void => {
  console.log('[addHomeTab] 被调用，当前标签数:', tabs.value.length)
  console.log(
    '[addHomeTab] 当前标签:',
    tabs.value.map((t) => ({ id: t.id, title: t.title, pluginId: t.pluginId }))
  )

  // 查找是否已存在主页标签
  const existingHomeTab = tabs.value.find((t) => t.pluginId === 'home' && t.type === 'plugin')

  if (existingHomeTab) {
    console.log('[addHomeTab] 找到已存在的主页标签，激活它:', existingHomeTab.id)
    activeTabId.value = existingHomeTab.id
  } else {
    // 创建新的主页标签
    const newTab: Tab = {
      id: Date.now().toString(),
      pluginId: 'home',
      title: '主页',
      type: 'plugin'
    }
    console.log('[addHomeTab] 创建新标签:', newTab)
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
  }

  console.log('[addHomeTab] 执行后标签数:', tabs.value.length)
}
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- 全局搜索 -->
    <GlobalSearch
      :visible="showGlobalSearch"
      @open-plugin="openTab"
      @open-app="handleOpenApp"
      @close="showGlobalSearch = false"
    />
    <!-- 侧边栏 -->
    <aside
      ref="sidebarRef"
      :class="[
        'bg-gray-100 dark:bg-gray-800 flex flex-col transition-all duration-300 flex-shrink-0',
        sidebarCollapsed ? 'w-12' : 'w-52 border-r border-gray-200 dark:border-gray-700'
      ]"
    >
      <!-- 顶部拖动区域 -->
      <div class="h-16 flex items-end pb-3 justify-center drag-region flex-shrink-0">
        <span
          v-show="!sidebarCollapsed"
          class="text-sm font-semibold text-gray-800 dark:text-gray-100"
          >UniHub</span
        >
      </div>

      <!-- 固定导航按钮（不滚动） -->
      <div class="p-2 space-y-1 flex-shrink-0">
        <!-- 主页按钮 -->
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.length === 0
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
          :title="sidebarCollapsed ? '主页' : ''"
          @click="goHome"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span v-show="!sidebarCollapsed" class="whitespace-nowrap">主页</span>
        </button>

        <!-- 收藏按钮 -->
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.some((t) => t.id === activeTabId && t.type === 'favorites')
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
          :title="sidebarCollapsed ? '收藏' : ''"
          @click="openFavorites"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          <span v-show="!sidebarCollapsed" class="whitespace-nowrap">收藏</span>
        </button>

        <!-- 最近使用按钮 -->
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.some((t) => t.id === activeTabId && t.type === 'recents')
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
          :title="sidebarCollapsed ? '最近使用' : ''"
          @click="openRecents"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span v-show="!sidebarCollapsed" class="whitespace-nowrap">最近使用</span>
        </button>

        <!-- 网站导航按钮 -->
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.some((t) => t.id === activeTabId && t.type === 'web-navigator')
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
          :title="sidebarCollapsed ? '网站导航' : ''"
          @click="openWebNavigator"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <span v-show="!sidebarCollapsed" class="whitespace-nowrap">网站导航</span>
        </button>

        <!-- 插件管理按钮 -->
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.some((t) => t.id === activeTabId && t.type === 'management')
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
          :title="sidebarCollapsed ? '插件管理' : ''"
          @click="openPluginManagement"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span v-show="!sidebarCollapsed" class="whitespace-nowrap">插件管理</span>
        </button>

        <!-- 分隔线 -->
        <div v-show="!sidebarCollapsed" class="h-px bg-gray-200 dark:bg-gray-700 mt-2"></div>
      </div>

      <!-- 插件列表（可滚动） -->
      <nav class="flex-1 px-2 pb-2 overflow-y-auto scrollbar-hide min-h-0">
        <div class="space-y-1">
          <!-- 所有工具 -->
          <template v-for="[category, plugins] in pluginsByCategory" :key="category">
            <!-- 分类标题（可点击展开/收起） -->
            <button
              class="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-md text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'justify-center': sidebarCollapsed }"
              @click="toggleCategory(category)"
            >
              <!-- 展开/收起图标 -->
              <svg
                class="w-3 h-3 transition-transform flex-shrink-0"
                :class="{ 'rotate-90': expandedCategories.has(category) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span v-show="!sidebarCollapsed" class="flex-1 text-left">
                {{ CATEGORY_NAMES[category] || category }}
              </span>
              <!-- 工具数量 -->
              <span
                v-show="!sidebarCollapsed"
                class="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                {{ plugins.length }}
              </span>
            </button>

            <!-- 工具列表（可折叠） -->
            <template v-if="expandedCategories.has(category)">
              <button
                v-for="plugin in plugins"
                :key="plugin.metadata.id"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group relative',
                  tabs.some((t) => t.id === activeTabId && t.pluginId === plugin.metadata.id)
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
                  sidebarCollapsed ? 'justify-center' : ''
                ]"
                :title="sidebarCollapsed ? plugin.metadata.name : ''"
                @click="openTab(plugin.metadata.id)"
              >
                <PluginIcon :icon="plugin.metadata.icon" size="sm" :show-background="false" />
                <span v-show="!sidebarCollapsed" class="whitespace-nowrap flex-1 text-left">{{
                  plugin.metadata.name
                }}</span>
                <!-- 收藏状态指示器 -->
                <svg
                  v-if="favoritePlugins.includes(plugin.metadata.id)"
                  v-show="!sidebarCollapsed"
                  class="w-3 h-3 text-red-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </button>
            </template>
          </template>
        </div>
      </nav>

      <!-- 底部按钮 -->
      <div class="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <!-- 底部工具栏 -->
        <div :class="['flex items-center gap-1 px-1', sidebarCollapsed ? 'flex-col' : '']">
          <!-- 主题切换 -->
          <button
            class="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
            @click="toggleTheme"
          >
            <!-- 太阳图标 (浅色模式) -->
            <svg
              v-if="isDark"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <!-- 月亮图标 (深色模式) -->
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- 设置按钮 -->
          <button
            class="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            title="设置"
            @click="openSettings"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- 顶部标题栏 -->
      <div class="h-9 bg-[rgb(246,246,245)] dark:bg-gray-800 flex items-center drag-region">
        <!-- 左侧控制按钮 -->
        <div class="flex items-center gap-2 px-6 no-drag">
          <!-- 侧边栏切换按钮 -->
          <button
            class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors"
            :title="sidebarCollapsed ? '展开侧边栏 (⌘B)' : '收起侧边栏 (⌘B)'"
            @click="toggleSidebar"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <!-- 全局搜索按钮 -->
          <button
            class="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors"
            :title="`搜索插件 (${globalSearchShortcut})`"
            @click="showGlobalSearch = true"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span class="text-xs text-gray-600 dark:text-gray-400">搜索</span>
            <Kbd>{{ globalSearchShortcut }}</Kbd>
          </button>
        </div>

        <!-- 标签栏 -->
        <div
          v-if="tabs.length > 0"
          class="flex-1 flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        >
          <TransitionGroup name="tab" tag="div" class="flex items-center h-full">
            <div
              v-for="(tab, index) in tabs"
              :key="tab.id"
              :class="[
                'group h-full flex items-center gap-2 px-4 cursor-pointer relative flex-shrink-0 no-drag min-w-0 max-w-[200px]',
                'transition-all duration-200 ease-out',
                activeTabId === tab.id
                  ? 'bg-white dark:bg-gray-900 shadow-sm'
                  : 'bg-[rgb(246,246,245)] dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700'
              ]"
              @click="activeTabId = tab.id"
              @contextmenu.prevent="showTabContextMenu(tab.id, index)"
            >
              <span
                :class="[
                  'text-sm font-medium truncate transition-all duration-200',
                  activeTabId === tab.id
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400'
                ]"
                >{{ tab.title }}</span
              >
              <button
                :class="[
                  'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0',
                  'hover:bg-gray-300/70 dark:hover:bg-gray-600/70',
                  activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                ]"
                @click.stop="closeTab(tab.id)"
              >
                <svg
                  class="w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-150 hover:scale-125"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </TransitionGroup>

          <!-- 新增标签页按钮 -->
          <button
            class="h-full px-3 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors no-drag flex-shrink-0"
            title="新建主页标签 (⌘N)"
            @click="addHomeTab"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <!-- 中间标题区域（无标签时显示） -->
        <div v-else class="flex-1 flex items-center justify-center">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">UniHub</span>
        </div>

        <!-- 右侧占位，保持平衡 -->
        <div class="w-12"></div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- 主页（无标签时） -->
        <HomePage
          v-if="tabs.length === 0"
          :recent-plugins="recentPlugins"
          :favorite-plugins="favoritePlugins"
          @open-tool="openTab"
          @toggle-favorite="toggleFavorite"
        />

        <!-- 工具标签页 -->
        <template v-for="tab in tabs" :key="tab.id">
          <div v-show="activeTabId === tab.id" class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <!-- 主页标签 -->
            <HomePage
              v-if="tab.pluginId === 'home'"
              :recent-plugins="recentPlugins"
              :favorite-plugins="favoritePlugins"
              @open-tool="openTab"
              @toggle-favorite="toggleFavorite"
            />

            <!-- 插件管理页面 -->
            <PluginManagementPage v-else-if="tab.type === 'management'" />

            <!-- 设置页面 -->
            <SettingsPage v-else-if="tab.type === 'settings'" />

            <!-- 收藏页面 -->
            <FavoritesPage
              v-else-if="tab.type === 'favorites'"
              :favorite-plugins="favoritePlugins"
              @open-tool="openTab"
              @toggle-favorite="toggleFavorite"
            />

            <!-- 最近使用页面 -->
            <RecentsPage
              v-else-if="tab.type === 'recents'"
              :recent-plugins="recentPlugins"
              @open-tool="openTab"
            />

            <!-- 网站导航页面 -->
            <WebNavigator v-else-if="tab.type === 'web-navigator'" />

            <!-- 普通插件 - 无背景，让插件自己控制样式 -->
            <component
              :is="pluginRegistry.get(tab.pluginId)?.component"
              v-else
              v-bind="pluginRegistry.get(tab.pluginId)?.config || {}"
              class="flex-1"
            />
          </div>
        </template>
      </div>
    </main>
  </div>

  <!-- Toast 通知 -->
  <Toaster position="top-right" rich-colors :theme="isDark ? 'dark' : 'light'" />

  <!-- 更新通知 -->
  <UpdateNotification ref="updateNotificationRef" />
</template>

<style scoped>
/* Chrome 风格的 Tab 动画 */

/* Tab 进入动画 - 从右侧滑入并展开 */
.tab-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab 离开动画 - 收缩并淡出 */
.tab-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  position: absolute;
}

.tab-enter-from {
  opacity: 0;
  max-width: 0;
  padding-left: 0;
  padding-right: 0;
  transform: scale(0.9);
}

.tab-leave-to {
  opacity: 0;
  max-width: 0;
  padding-left: 0;
  padding-right: 0;
  transform: scale(0.95);
}

/* Tab 移动动画 - 平滑过渡位置变化 */
.tab-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 确保离开的元素不影响布局 */
.tab-leave-active {
  position: absolute;
}

/* 滚动条隐藏 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
