<script setup lang="ts">
import { computed } from 'vue'
import { pluginRegistry } from '@/plugins'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import PluginIcon from './PluginIcon.vue'

const emit = defineEmits<{
  close: []
}>()

const allPlugins = computed(() => pluginRegistry.getAll())

const pluginsByCategory = computed(() => {
  const categories = new Map<string, typeof allPlugins.value>()
  allPlugins.value.forEach((plugin) => {
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

const togglePlugin = (id: string): void => {
  pluginRegistry.toggle(id)
}

const enabledCount = computed(() => pluginRegistry.getEnabled().length)
</script>

<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-3xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>插件管理</DialogTitle>
        <DialogDescription>
          共 {{ allPlugins.length }} 个插件，已启用 {{ enabledCount }} 个
        </DialogDescription>
      </DialogHeader>

      <!-- 插件列表 -->
      <div class="flex-1 overflow-y-auto -mx-6 px-6">
        <div class="space-y-6">
          <div v-for="[category, plugins] in pluginsByCategory" :key="category">
            <h3
              class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
            >
              <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
              {{ categoryNames[category] || category }}
            </h3>

            <div class="space-y-2">
              <div
                v-for="plugin in plugins"
                :key="plugin.metadata.id"
                class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <!-- 图标 -->
                <div
                  class="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0"
                >
                  <PluginIcon :icon="plugin.metadata.icon" size="md" />
                </div>

                <!-- 信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{ plugin.metadata.name }}
                    </h4>
                    <Badge variant="secondary" class="text-xs">
                      v{{ plugin.metadata.version }}
                    </Badge>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {{ plugin.metadata.description }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-500">
                      作者: {{ plugin.metadata.author }}
                    </span>
                  </div>
                </div>

                <!-- 开关 -->
                <Switch
                  :checked="plugin.enabled"
                  @update:checked="() => togglePlugin(plugin.metadata.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button @click="emit('close')" variant="outline"> 关闭 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
