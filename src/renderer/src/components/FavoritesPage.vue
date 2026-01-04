<script setup lang="ts">
import { computed } from 'vue'
import { pluginRegistry } from '@/plugins'
import { PluginIcon } from '@/components/ui/plugin-icon'

const props = defineProps<{
  favoritePlugins: string[]
}>()

const emit = defineEmits<{
  openTool: [pluginId: string]
  toggleFavorite: [pluginId: string]
}>()

// 收藏的插件列表
const favoritePluginsList = computed(() => {
  const plugins = props.favoritePlugins
    .map((id) => pluginRegistry.get(id))
    .filter((plugin): plugin is NonNullable<typeof plugin> => plugin?.enabled === true)

  console.log('收藏列表加载', plugins.length, '个插件')
  return plugins
})

// 处理打开工具
const handleOpenTool = (pluginId: string): void => {
  console.log('打开收藏的工具:', pluginId)
  emit('openTool', pluginId)
}

// 处理取消收藏
const handleToggleFavorite = (pluginId: string): void => {
  console.log('取消收藏:', pluginId)
  emit('toggleFavorite', pluginId)
}
</script>

<template>
  <div class="h-full overflow-auto bg-white dark:bg-gray-900">
    <!-- 拖动区域 -->
    <div data-tauri-drag-region class="h-16 flex-shrink-0"></div>

    <div class="max-w-5xl mx-auto w-full px-8 pb-8">
      <!-- 头部 -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg"
          >
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">收藏</h1>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 ml-15">
          {{ favoritePluginsList.length }} 个收藏的工具
        </p>
      </div>

      <!-- 空状态 -->
      <div
        v-if="favoritePluginsList.length === 0"
        class="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
      >
        <div
          class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无收藏</h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          在主页或工具列表中点击爱心图标来收藏你喜欢的工具
        </p>
      </div>

      <!-- 收藏列表 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <button
          v-for="plugin in favoritePluginsList"
          :key="plugin.metadata.id"
          class="group p-3 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-red-300 dark:hover:border-red-700 text-left relative overflow-hidden"
          @click="handleOpenTool(plugin.metadata.id)"
        >
          <!-- 背景装饰 -->
          <div
            class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-xl -mr-12 -mt-12 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all"
          ></div>

          <div class="relative">
            <div class="flex items-start justify-between mb-2">
              <PluginIcon :icon="plugin.metadata.icon" size="md" />
              <!-- 取消收藏按钮 -->
              <div
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer"
                title="取消收藏"
                @click.stop="handleToggleFavorite(plugin.metadata.id)"
              >
                <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>
            </div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1"
            >
              {{ plugin.metadata.name }}
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ plugin.metadata.description }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
