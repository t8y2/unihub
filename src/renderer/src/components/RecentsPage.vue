<script setup lang="ts">
import { computed } from 'vue'
import { pluginRegistry } from '@/plugins'

const props = defineProps<{
  recentPlugins: string[]
}>()

const emit = defineEmits<{
  openTool: [pluginId: string]
}>()

// 最近使用的插件列表
const recentPluginsList = computed(() => {
  return props.recentPlugins
    .map((id) => pluginRegistry.get(id))
    .filter((plugin) => plugin && plugin.enabled)
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 overflow-auto">
    <!-- 拖动区域 -->
    <div data-tauri-drag-region class="h-16 flex-shrink-0"></div>

    <div class="max-w-5xl mx-auto w-full px-8 pb-8">
      <!-- 头部 -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">最近使用</h1>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 ml-15">
          {{ recentPluginsList.length }} 个最近访问的工具
        </p>
      </div>

      <!-- 空状态 -->
      <div
        v-if="recentPluginsList.length === 0"
        class="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
      >
        <div
          class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无访问记录</h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          使用工具后会自动记录到这里，方便你快速访问常用工具
        </p>
      </div>

      <!-- 最近使用列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="(plugin, index) in recentPluginsList"
          :key="plugin.metadata.id"
          class="group p-5 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.02] hover:border-green-300 dark:hover:border-green-700 text-left relative overflow-hidden"
          @click="emit('openTool', plugin.metadata.id)"
        >
          <!-- 背景装饰 -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all"
          ></div>

          <div class="relative">
            <div class="flex items-start justify-between mb-4">
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 dark:group-hover:from-green-500/30 dark:group-hover:to-emerald-500/30 transition-all shadow-sm"
              >
                <svg
                  class="w-7 h-7 text-green-600 dark:text-green-400"
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
              <!-- 序号标记 -->
              <div
                class="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold"
              >
                #{{ index + 1 }}
              </div>
            </div>
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
            >
              {{ plugin.metadata.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {{ plugin.metadata.description }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
