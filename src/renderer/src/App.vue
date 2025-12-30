<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { pluginRegistry, initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'
import HomePage from './components/HomePage.vue'
import PluginManagementPage from './components/PluginManagementPage.vue'
import SettingsPage from './components/SettingsPage.vue'

const isDark = ref(false)
const sidebarCollapsed = ref(false)

// 最近访问的插件
const recentPlugins = ref<string[]>([])

// 从 localStorage 加载最近访问
const loadRecentPlugins = (): void => {
  const saved = localStorage.getItem('recentPlugins')
  if (saved) {
    try {
      recentPlugins.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载最近访问失败:', error)
      recentPlugins.value = []
    }
  }
}

// 保存最近访问到 localStorage
const saveRecentPlugins = (): void => {
  localStorage.setItem('recentPlugins', JSON.stringify(recentPlugins.value))
}

// 添加到最近访问
const addToRecent = (pluginId: string): void => {
  // 移除已存在的
  const index = recentPlugins.value.indexOf(pluginId)
  if (index > -1) {
    recentPlugins.value.splice(index, 1)
  }
  // 添加到开头
  recentPlugins.value.unshift(pluginId)
  // 限制最多10个
  if (recentPlugins.value.length > 10) {
    recentPlugins.value = recentPlugins.value.slice(0, 10)
  }
  saveRecentPlugins()
}

onMounted(async () => {
  // 初始化插件系统
  initPlugins()

  // 加载已安装的第三方插件
  try {
    await pluginInstaller.loadInstalledPlugins()
  } catch (error) {
    console.error('加载第三方插件失败:', error)
  }

  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // 从 localStorage 读取侧边栏状态
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState === 'true') {
    sidebarCollapsed.value = true
  }

  // 加载最近访问
  loadRecentPlugins()

  // 添加键盘快捷键监听
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
  // Cmd+W (Mac) 或 Ctrl+W (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault()

    if (tabs.value.length === 0) {
      // 如果没有标签，关闭应用（Electron）
      window.electron.ipcRenderer.send('window:close')
    } else if (tabs.value.length === 1) {
      // 如果只有一个标签，关闭标签（回到首页）
      closeTab(activeTabId.value)
    } else {
      // 关闭当前标签
      closeTab(activeTabId.value)
    }
  }

  // Cmd+B (Mac) 或 Ctrl+B (Windows/Linux) 切换侧边栏
  if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
}

const toggleTheme = (): void => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const toggleSidebar = (): void => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
}

interface Tab {
  id: string
  pluginId: string
  title: string
  type: 'plugin' | 'management' | 'settings'
}

const tabs = ref<Tab[]>([])
const activeTabId = ref('')

// 获取所有启用的插件
const enabledPlugins = computed(() => {
  // 依赖 version 来触发重新计算
  void pluginRegistry.version.value
  return pluginRegistry.getEnabled()
})

// 按分类获取插件
const pluginsByCategory = computed(() => {
  // 依赖 version 来触发重新计算
  void pluginRegistry.version.value
  const categories = new Map<string, typeof enabledPlugins.value>()
  enabledPlugins.value.forEach((plugin) => {
    const category = plugin.metadata.category
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)!.push(plugin)
  })
  return categories
})

// 分类名称映射
const categoryNames: Record<string, string> = {
  formatter: '格式化',
  tool: '工具',
  encoder: '编码',
  custom: '自定义'
}

const openTab = (pluginId: string): void => {
  const plugin = pluginRegistry.get(pluginId)
  if (!plugin || !plugin.enabled) return

  // 添加到最近访问
  addToRecent(pluginId)

  // 检查是否已经打开
  const existingTab = tabs.value.find((t) => t.pluginId === pluginId && t.type === 'plugin')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return
  }

  // 创建新标签
  const newTab: Tab = {
    id: Date.now().toString(),
    pluginId,
    title: plugin.metadata.name,
    type: 'plugin'
  }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
}

const openPluginManagement = (): void => {
  // 检查是否已经打开
  const existingTab = tabs.value.find((t) => t.type === 'management')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return
  }

  // 创建新标签
  const newTab: Tab = {
    id: Date.now().toString(),
    pluginId: 'plugin-management',
    title: '插件管理',
    type: 'management'
  }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
}

const openSettings = (): void => {
  // 检查是否已经打开
  const existingTab = tabs.value.find((t) => t.type === 'settings')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return
  }

  // 创建新标签
  const newTab: Tab = {
    id: Date.now().toString(),
    pluginId: 'settings',
    title: '设置',
    type: 'settings'
  }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
}

const closeTab = (tabId: string): void => {
  const index = tabs.value.findIndex((t) => t.id === tabId)
  if (index === -1) return

  // 如果关闭的是当前标签，切换到相邻标签
  if (activeTabId.value === tabId) {
    if (tabs.value.length > 1) {
      const nextIndex = index === tabs.value.length - 1 ? index - 1 : index + 1
      const nextTab = tabs.value[nextIndex]
      if (nextTab) {
        activeTabId.value = nextTab.id
      }
    } else {
      // 最后一个标签，清空 activeTabId
      activeTabId.value = ''
    }
  }

  tabs.value.splice(index, 1)
}

const goHome = (): void => {
  // 关闭所有标签，回到首页
  tabs.value = []
  activeTabId.value = ''
}
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
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
          <!-- 首页按钮 -->
          <button
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              tabs.length === 0
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
              sidebarCollapsed ? 'justify-center' : ''
            ]"
            @click="goHome"
            :title="sidebarCollapsed ? '首页' : ''"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span v-show="!sidebarCollapsed" class="whitespace-nowrap">首页</span>
          </button>

          <template v-for="[category, plugins] in pluginsByCategory" :key="category">
            <div
              v-show="!sidebarCollapsed"
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2 mt-4"
            >
              {{ categoryNames[category] || category }}
            </div>

            <button
              v-for="plugin in plugins"
              :key="plugin.metadata.id"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                tabs.some((t) => t.id === activeTabId && t.pluginId === plugin.metadata.id)
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50',
                sidebarCollapsed ? 'justify-center' : ''
              ]"
              @click="openTab(plugin.metadata.id)"
              :title="sidebarCollapsed ? plugin.metadata.name : ''"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="plugin.metadata.icon"
                />
              </svg>
              <span v-show="!sidebarCollapsed" class="whitespace-nowrap">{{ plugin.metadata.name }}</span>
            </button>
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
          @click="openPluginManagement"
          :title="sidebarCollapsed ? '插件管理' : ''"
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
        </div>

        <!-- 中间标题区域（无标签时显示） -->
        <div v-else class="flex-1 flex items-center justify-center">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">UniHub</span>
        </div>

        <!-- 右侧占位，保持平衡 -->
        <div class="w-12"></div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 bg-white dark:bg-gray-900 flex flex-col min-h-0">
        <!-- 首页 -->
        <HomePage v-if="tabs.length === 0" @open-tool="openTab" :recent-plugins="recentPlugins" />

        <!-- 工具标签页 -->
        <template v-for="tab in tabs" :key="tab.id">
          <div v-show="activeTabId === tab.id" class="flex-1 flex flex-col min-h-0">
            <!-- 插件管理页面 -->
            <PluginManagementPage v-if="tab.type === 'management'" />

            <!-- 设置页面 -->
            <SettingsPage v-else-if="tab.type === 'settings'" />

            <!-- 普通插件 -->
            <component
              v-else
              :is="pluginRegistry.get(tab.pluginId)?.component"
              v-bind="pluginRegistry.get(tab.pluginId)?.config || {}"
            />
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
