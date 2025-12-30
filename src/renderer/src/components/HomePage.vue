<script setup lang="ts">
import { computed } from 'vue'
import { pluginRegistry } from '@/plugins'
import type { TabType } from '@/types/plugin'

const emit = defineEmits<{
  openTool: [type: TabType]
}>()

const enabledPlugins = computed(() => pluginRegistry.getEnabled())

const pluginsByCategory = computed(() => {
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

const categoryNames: Record<string, string> = {
  formatter: '格式化',
  tool: '工具',
  encoder: '编码',
  custom: '自定义'
}

const categoryOrder = ['formatter', 'tool', 'encoder', 'custom']
const sortedCategories = computed(() => {
  return Array.from(pluginsByCategory.value.entries()).sort(([a], [b]) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 overflow-auto">
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
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">UniHub</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">开发者的通用工具集</p>
      </div>

      <!-- 工具分类 -->
      <div class="space-y-6">
        <div v-for="[category, plugins] in sortedCategories" :key="category">
          <h2
            class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"
          >
            <div class="w-1 h-5 bg-blue-500 rounded-full"></div>
            {{ categoryNames[category] || category }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              v-for="plugin in plugins"
              :key="plugin.metadata.id"
              @click="emit('openTool', plugin.metadata.id)"
              class="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:scale-[1.02] text-left"
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
            </button>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="mt-12 text-center text-xs text-gray-500 dark:text-gray-500">
        <p>快捷键：Cmd/Ctrl + W 关闭标签</p>
      </div>
    </div>
  </div>
</template>
