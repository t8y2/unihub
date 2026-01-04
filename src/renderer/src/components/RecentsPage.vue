<script setup lang="ts">
import { computed } from 'vue'
import { pluginRegistry } from '@/plugins'
import { PluginIcon } from '@/components/ui/plugin-icon'

const props = defineProps<{
  recentPlugins: string[]
}>()

const emit = defineEmits<{
  openTool: [pluginId: string]
}>()

// 最近使用的插件列表
const recentPluginsList = computed(() => {
  const plugins = props.recentPlugins
    .map((id) => pluginRegistry.get(id))
    .filter((plugin): plugin is NonNullable<typeof plugin> => plugin?.enabled === true)

  console.log('最近使用列表加载', plugins.length, '个插件')
  return plugins
})

// 处理打开工具
const handleOpenTool = (pluginId: string): void => {
  console.log('打开最近使用的工具:', pluginId)
  emit('openTool', pluginId)
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
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <button
          v-for="(plugin, index) in recentPluginsList"
          :key="plugin.metadata.id"
          class="group p-3 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-green-300 dark:hover:border-green-700 text-left relative overflow-hidden"
          @click="handleOpenTool(plugin.metadata.id)"
        >
          <!-- 背景装饰 -->
          <div
            class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-xl -mr-12 -mt-12 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all"
          ></div>

          <div class="relative">
            <div class="flex items-start justify-between mb-2">
              <PluginIcon :icon="plugin.metadata.icon" size="md" />
              <!-- 序号标记 -->
              <div
                class="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold"
              >
                #{{ index + 1 }}
              </div>
            </div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1"
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
