<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { pluginRegistry, initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'
import HomePage from './components/HomePage.vue'
import PluginManagementPage from './components/PluginManagementPage.vue'
import SettingsPage from './components/SettingsPage.vue'
import FavoritesPage from './components/FavoritesPage.vue'
import RecentsPage from './components/RecentsPage.vue'
import WebNavigator from './components/WebNavigator.vue'
import GlobalSearch from './components/GlobalSearch.vue'
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
  // 初始化插件系统
  initPlugins()

  // 加载第三方插件
  try {
    await pluginInstaller.loadInstalledPlugins()
  } catch (error) {
    console.error('加载第三方插件失败:', error)
  }

  // 恢复主题设置
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // 恢复侧边栏状态
  sidebarCollapsed.value = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'

  // 加载插件数据
  await loadAll()
}

onMounted(() => {
  initializeApp()
  window.electron.ipcRenderer.on('handle-close-tab', () => {
    if (tabs.value.length === 0) {
      // 没有标签页，关闭窗口
      window.electron.ipcRenderer.send('window:close')
    } else if (activeTabId.value) {
      // 有标签页，关闭当前标签
      closeTab(activeTabId.value)
    }
  })
})

// 检查是否应该处理快捷键
const shouldHandleShortcut = (): boolean => {
  const activeTab = tabs.value.find((t) => t.id === activeTabId.value)
  if (!activeTab || activeTab.type !== 'plugin') return true

  const plugin = pluginRegistry.get(activeTab.pluginId)
  return !plugin?.metadata.isThirdParty
}

// 使用键盘快捷键 composable
useKeyboard(
  {
    w: () => {
      tabs.value.length === 0
        ? window.electron.ipcRenderer.send('window:close')
        : closeTab(activeTabId.value)
    },
    n: () => addHomeTab(),
    b: () => toggleSidebar(),
    k: () => (showGlobalSearch.value = true),
    p: () => (showGlobalSearch.value = true)
  },
  shouldHandleShortcut
)

// 主题切换
const toggleTheme = (): void => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem(STORAGE_KEYS.THEME, isDark.value ? 'dark' : 'light')
}

// 侧边栏切换
const toggleSidebar = (): void => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed.value))
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
  const existingTab = tabs.value.find(matcher || ((t) => t.type === type))
  if (existingTab) {
    activeTabId.value = existingTab.id
    return
  }

  const newTab: Tab = {
    id: Date.now().toString(),
    pluginId,
    title,
    type
  }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
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

// 回到主页
const goHome = (): void => {
  tabs.value.forEach((tab) => handleThirdPartyPlugin(tab.id, 'close'))
  tabs.value = []
  activeTabId.value = ''
}

// 新建主页标签
const addHomeTab = (): void => createOrActivateTab('plugin', 'home', '主页')
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- 全局搜索 -->
    <GlobalSearch
      :visible="showGlobalSearch"
      @open-plugin="openTab"
      @close="showGlobalSearch = false"
    />
    <!-- 侧边栏 -->
    <aside
      :class="[
        'bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0',
        sidebarCollapsed ? 'w-12' : 'w-52'
      ]"
    >
      <!-- 顶部拖动区域 -->
      <div class="h-16 flex items-end pb-3 justify-center drag-region">
        <span
          v-show="!sidebarCollapsed"
          class="text-sm font-semibold text-gray-800 dark:text-gray-100"
          >UniHub</span
        >
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-2 overflow-y-auto scrollbar-hide">
        <div class="space-y-1">
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
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span v-show="!sidebarCollapsed" class="whitespace-nowrap">网站导航</span>
          </button>

          <!-- 分隔线 -->
          <div v-show="!sidebarCollapsed" class="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

          <!-- 所有工具 -->
          <template v-for="[category, plugins] in pluginsByCategory" :key="category">
            <!-- 分类标题（可点击展开/收起） -->
            <button
              class="w-full flex items-center gap-2 px-3 py-2 mt-4 rounded-md text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
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
                <svg
                  class="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="plugin.metadata.icon"
                  />
                </svg>
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
            title="搜索插件 (⌘K)"
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
            <Kbd>⌘K</Kbd>
          </button>
        </div>

        <!-- 标签栏 -->
        <div
          v-if="tabs.length > 0"
          class="flex-1 flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        >
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'group h-full flex items-center gap-2 px-4 cursor-pointer transition-colors relative flex-shrink-0 no-drag min-w-0',
              activeTabId === tab.id
                ? 'bg-white dark:bg-gray-900'
                : 'bg-[rgb(246,246,245)] dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700'
            ]"
            @click="activeTabId = tab.id"
          >
            <span
              :class="[
                'text-sm font-medium truncate',
                activeTabId === tab.id
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
              >{{ tab.title }}</span
            >
            <button
              :class="[
                'w-4 h-4 rounded flex items-center justify-center hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors flex-shrink-0',
                activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              ]"
              @click.stop="closeTab(tab.id)"
            >
              <svg
                class="w-3 h-3 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

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
      <div class="flex-1 flex flex-col min-h-0">
        <!-- 主页（无标签时） -->
        <div v-if="tabs.length === 0" class="flex-1 bg-white dark:bg-gray-900">
          <HomePage
            :recent-plugins="recentPlugins"
            :favorite-plugins="favoritePlugins"
            @open-tool="openTab"
            @toggle-favorite="toggleFavorite"
          />
        </div>

        <!-- 工具标签页 -->
        <template v-for="tab in tabs" :key="tab.id">
          <div v-show="activeTabId === tab.id" class="flex-1 flex flex-col min-h-0">
            <!-- 主页标签 -->
            <div v-if="tab.pluginId === 'home'" class="flex-1 bg-white dark:bg-gray-900">
              <HomePage
                :recent-plugins="recentPlugins"
                :favorite-plugins="favoritePlugins"
                @open-tool="openTab"
                @toggle-favorite="toggleFavorite"
              />
            </div>

            <!-- 插件管理页面 -->
            <div
              v-else-if="tab.type === 'management'"
              class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900"
            >
              <PluginManagementPage />
            </div>

            <!-- 设置页面 -->
            <div
              v-else-if="tab.type === 'settings'"
              class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900"
            >
              <SettingsPage />
            </div>

            <!-- 收藏页面 -->
            <div v-else-if="tab.type === 'favorites'" class="flex-1 bg-white dark:bg-gray-900">
              <FavoritesPage
                :favorite-plugins="favoritePlugins"
                @open-tool="openTab"
                @toggle-favorite="toggleFavorite"
              />
            </div>

            <!-- 最近使用页面 -->
            <div v-else-if="tab.type === 'recents'" class="flex-1 bg-white dark:bg-gray-900">
              <RecentsPage :recent-plugins="recentPlugins" @open-tool="openTab" />
            </div>

            <!-- 网站导航页面 -->
            <div
              v-else-if="tab.type === 'web-navigator'"
              class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900"
            >
              <WebNavigator />
            </div>

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
</template>
