<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { pluginRegistry, initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'
import HomePage from './components/HomePage.vue'
import PluginManagementPage from './components/PluginManagementPage.vue'

const isDark = ref(false)

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

  // 添加键盘快捷键监听
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = async (e: KeyboardEvent) => {
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
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

interface Tab {
  id: string
  pluginId: string
  title: string
  type: 'plugin' | 'management'
}

const tabs = ref<Tab[]>([])
const activeTabId = ref('')

// 获取所有启用的插件
const enabledPlugins = computed(() => {
  // 依赖 version 来触发重新计算
  pluginRegistry.version.value
  return pluginRegistry.getEnabled()
})

// 按分类获取插件
const pluginsByCategory = computed(() => {
  // 依赖 version 来触发重新计算
  pluginRegistry.version.value
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

const openTab = (pluginId: string) => {
  const plugin = pluginRegistry.get(pluginId)
  if (!plugin || !plugin.enabled) return

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

const openPluginManagement = () => {
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

const openSettings = () => {
  // TODO: 实现设置页面
  console.log('打开设置页面')
  // 可以在这里添加设置页面的逻辑
}

const closeTab = (tabId: string) => {
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

const goHome = () => {
  // 关闭所有标签，回到首页
  tabs.value = []
  activeTabId.value = ''
}
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- 侧边栏 -->
    <aside
      class="w-52 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <!-- 顶部拖动区域 + Logo -->
      <div class="h-16 flex items-end px-4 pb-2 pt-3 drag-region">
        <button
          @click="goHome"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity no-drag"
        >
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">UniHub</span>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-2 overflow-y-auto">
        <div class="space-y-1">
          <template v-for="[category, plugins] in pluginsByCategory" :key="category">
            <div
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2"
              :class="{ 'mt-4': category !== 'formatter' }"
            >
              {{ categoryNames[category] || category }}
            </div>

            <button
              v-for="plugin in plugins"
              :key="plugin.metadata.id"
              @click="openTab(plugin.metadata.id)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                tabs.some((t) => t.id === activeTabId && t.pluginId === plugin.metadata.id)
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="plugin.metadata.icon"
                />
              </svg>
              {{ plugin.metadata.name }}
            </button>
          </template>
        </div>
      </nav>

      <!-- 底部按钮 -->
      <div class="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          @click="openPluginManagement"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            tabs.some((t) => t.id === activeTabId && t.type === 'management')
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          插件管理
        </button>

        <!-- 底部工具栏 -->
        <div class="flex items-center gap-1 px-1">
          <!-- 主题切换 -->
          <button
            @click="toggleTheme"
            class="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
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
            @click="openSettings"
            class="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            title="设置"
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
    <main class="flex-1 flex flex-col">
      <!-- 标签栏 -->
      <div
        v-if="tabs.length > 0"
        class="h-9 bg-[rgb(246,246,245)] dark:bg-gray-800 flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide drag-region"
      >
        <div class="flex items-center h-full flex-nowrap">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTabId = tab.id"
            :class="[
              'group h-full flex items-center gap-2 px-4 cursor-pointer transition-colors relative flex-shrink-0 no-drag',
              activeTabId === tab.id
                ? 'bg-white dark:bg-gray-900'
                : 'bg-[rgb(246,246,245)] dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700'
            ]"
          >
            <span
              :class="[
                'text-sm font-medium',
                activeTabId === tab.id
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
              >{{ tab.title }}</span
            >
            <button
              @click.stop="closeTab(tab.id)"
              :class="[
                'w-4 h-4 rounded flex items-center justify-center hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors',
                activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              ]"
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
      </div>

      <!-- 内容区 -->
      <div class="flex-1 bg-white dark:bg-gray-900 flex flex-col min-h-0">
        <!-- 首页 -->
        <HomePage v-if="tabs.length === 0" @open-tool="openTab" />

        <!-- 工具标签页 -->
        <template v-for="tab in tabs" :key="tab.id">
          <div v-show="activeTabId === tab.id" class="flex-1 flex flex-col min-h-0">
            <!-- 插件管理页面 -->
            <PluginManagementPage v-if="tab.type === 'management'" />

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
