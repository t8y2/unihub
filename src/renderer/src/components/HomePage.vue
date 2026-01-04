<script setup lang="ts">
import { computed, ref } from 'vue'
import { pluginRegistry } from '@/plugins'
import { CATEGORY_NAMES, CATEGORY_ORDER, LIMITS } from '@/constants'

const props = defineProps<{
  recentPlugins: string[]
  favoritePlugins: string[]
}>()

const emit = defineEmits<{
  openTool: [pluginId: string]
  toggleFavorite: [pluginId: string]
}>()

const searchQuery = ref('')

// 获取启用的插件
const enabledPlugins = computed(() => pluginRegistry.getEnabled())

// 搜索过滤
const filteredPlugins = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return enabledPlugins.value

  return enabledPlugins.value.filter(
    (plugin) =>
      plugin.metadata.name.toLowerCase().includes(query) ||
      plugin.metadata.description.toLowerCase().includes(query)
  )
})

// 按分类分组
const pluginsByCategory = computed(() => {
  const categories = new Map<string, typeof filteredPlugins.value>()

  for (const plugin of filteredPlugins.value) {
    const category = plugin.metadata.category
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)!.push(plugin)
  }

  return categories
})

// 排序后的分类
const sortedCategories = computed(() => {
  return Array.from(pluginsByCategory.value.entries()).sort(([a], [b]) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })
})

// 最近访问的插件
const recentPluginsList = computed(() => {
  return props.recentPlugins
    .map((id) => pluginRegistry.get(id))
    .filter((plugin): plugin is NonNullable<typeof plugin> => plugin?.enabled === true)
    .slice(0, LIMITS.FAVORITE_DISPLAY)
})

// 收藏的插件
const favoritePluginsList = computed(() => {
  return props.favoritePlugins
    .map((id) => pluginRegistry.get(id))
    .filter((plugin): plugin is NonNullable<typeof plugin> => plugin?.enabled === true)
})

// 清除搜索
const clearSearch = (): void => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="h-full overflow-auto bg-white dark:bg-gray-900">
    <!-- 拖动区域 -->
    <div data-tauri-drag-region class="h-16 flex-shrink-0"></div>

    <div class="max-w-5xl mx-auto w-full px-8 pb-8">
      <!-- 头部 -->
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <div class="text-left">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">UniHub</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">开发者的通用工具集</p>
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="mb-8">
        <div class="relative max-w-md mx-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="w-5 h-5 text-gray-400"
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
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具..."
            class="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            @click="clearSearch"
          >
            <svg
              class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

      <!-- 收藏 -->
      <div v-if="favoritePluginsList.length > 0 && !searchQuery" class="mb-8">
        <h2
          class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"
        >
          <div class="w-1 h-5 bg-red-500 rounded-full"></div>
          收藏
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            v-for="plugin in favoritePluginsList"
            :key="plugin.metadata.id"
            class="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:scale-[1.02] text-left relative"
            @click="emit('openTool', plugin.metadata.id)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 dark:group-hover:bg-red-500/30 transition-colors"
              >
                <svg
                  class="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
                >
                  {{ plugin.metadata.name }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {{ plugin.metadata.description }}
                </p>
              </div>
            </div>
            <!-- 取消收藏按钮 -->
            <div
              class="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity cursor-pointer"
              title="取消收藏"
              @click.stop="emit('toggleFavorite', plugin.metadata.id)"
            >
              <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- 最近访问 -->
      <div v-if="recentPluginsList.length > 0 && !searchQuery" class="mb-8">
        <h2
          class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"
        >
          <div class="w-1 h-5 bg-green-500 rounded-full"></div>
          最近访问
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            v-for="plugin in recentPluginsList"
            :key="plugin.metadata.id"
            class="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:scale-[1.02] text-left"
            @click="emit('openTool', plugin.metadata.id)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors"
              >
                <svg
                  class="w-5 h-5 text-green-600 dark:text-green-400"
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
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                >
                  {{ plugin.metadata.name }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {{ plugin.metadata.description }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 搜索结果提示 -->
      <div v-if="searchQuery && filteredPlugins.length === 0" class="text-center py-12">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">未找到相关工具</h3>
        <p class="text-gray-600 dark:text-gray-400">尝试使用其他关键词搜索</p>
      </div>

      <!-- 工具分类 -->
      <div v-if="sortedCategories.length > 0" class="space-y-6">
        <div v-for="[category, plugins] in sortedCategories" :key="category">
          <h2
            class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"
          >
            <div class="w-1 h-5 bg-blue-500 rounded-full"></div>
            {{ CATEGORY_NAMES[category] || category }}
            <span v-if="searchQuery" class="text-xs text-gray-500 dark:text-gray-400 font-normal">
              ({{ plugins.length }} 个结果)
            </span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              v-for="plugin in plugins"
              :key="plugin.metadata.id"
              class="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:scale-[1.02] text-left relative"
              @click="emit('openTool', plugin.metadata.id)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors"
                >
                  <svg
                    class="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  >
                    {{ plugin.metadata.name }}
                  </h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {{ plugin.metadata.description }}
                  </p>
                </div>
              </div>
              <!-- 收藏按钮 -->
              <div
                class="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity cursor-pointer"
                :title="favoritePlugins.includes(plugin.metadata.id) ? '取消收藏' : '收藏'"
                @click.stop="emit('toggleFavorite', plugin.metadata.id)"
              >
                <svg
                  class="w-4 h-4"
                  :fill="favoritePlugins.includes(plugin.metadata.id) ? 'currentColor' : 'none'"
                  :class="
                    favoritePlugins.includes(plugin.metadata.id) ? 'text-red-500' : 'text-gray-400'
                  "
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="mt-12 text-center text-xs text-gray-500 dark:text-gray-500">
        <p>快捷键：Cmd/Ctrl + W 关闭标签 | Cmd/Ctrl + B 切换侧边栏</p>
      </div>
    </div>
  </div>
</template>
