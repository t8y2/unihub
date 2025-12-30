<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pluginRegistry } from '@/plugins'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { pluginStorage } from '@/plugins/marketplace/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<'installed' | 'store'>('installed')
const installUrl = ref('')
const installing = ref(false)
const error = ref('')
const success = ref('')

// 内置插件
const builtInPlugins = computed(() => pluginRegistry.getAll())

// 已安装的第三方插件
const installedPlugins = ref<any[]>([])

// 按分类分组
const pluginsByCategory = computed(() => {
  const categories = new Map<string, typeof builtInPlugins.value>()
  builtInPlugins.value.forEach((plugin) => {
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

// 加载已安装的第三方插件
const loadInstalledPlugins = async () => {
  try {
    const plugins = await window.api.plugin.list()
    installedPlugins.value = plugins
  } catch (err) {
    console.error('加载已安装插件失败:', err)
  }
}

onMounted(() => {
  loadInstalledPlugins()
})

// 从 URL 安装
const installFromUrl = async (): Promise<void> => {
  if (!installUrl.value.trim()) {
    error.value = '请输入插件 URL'
    return
  }

  try {
    installing.value = true
    error.value = ''
    success.value = ''

    await pluginInstaller.installFromUrl(installUrl.value)

    success.value = '✅ 插件安装成功！'
    installUrl.value = ''

    // 重新加载插件列表
    await loadInstalledPlugins()
    await pluginInstaller.loadInstalledPlugins()

    // 2秒后清除成功消息
    setTimeout(() => {
      success.value = ''
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '安装失败'
  } finally {
    installing.value = false
  }
}

// 卸载插件
const uninstallPlugin = async (pluginId: string): Promise<void> => {
  try {
    await pluginInstaller.uninstall(pluginId)
    success.value = '✅ 插件已卸载！'

    // 重新加载插件列表
    await loadInstalledPlugins()

    setTimeout(() => {
      success.value = ''
    }, 1000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '卸载失败'
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取来源标签
const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    official: '官方',
    url: '第三方',
    local: '本地'
  }
  return labels[source] || source
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- 顶部标题栏 -->
    <div class="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">插件管理</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          管理内置插件和第三方插件
        </p>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="flex items-center gap-1 px-6 pt-4 bg-white dark:bg-gray-800">
      <button
        @click="activeTab = 'installed'"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
          activeTab === 'installed'
            ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        ]"
      >
        已安装插件 ({{ builtInPlugins.length + installedPlugins.length }})
      </button>
      <button
        @click="activeTab = 'store'"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
          activeTab === 'store'
            ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        ]"
      >
        插件商店
      </button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 已安装插件标签页 -->
      <div v-show="activeTab === 'installed'" class="p-6 space-y-6">
        <!-- 内置插件 -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            内置插件
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              已启用 {{ enabledCount }} 个
            </span>
          </h2>

          <div class="space-y-6">
            <div v-for="[category, plugins] in pluginsByCategory" :key="category">
              <h3
                class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
              >
                <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
                {{ categoryNames[category] || category }}
              </h3>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div
                  v-for="plugin in plugins"
                  :key="plugin.metadata.id"
                  class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <!-- 图标 -->
                  <div
                    class="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0"
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

        <!-- 第三方插件 -->
        <div v-if="installedPlugins.length > 0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            第三方插件
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              {{ installedPlugins.length }} 个
            </span>
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div
              v-for="plugin in installedPlugins"
              :key="plugin.id"
              class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ plugin.metadata.name }}
                  </h4>
                  <Badge variant="secondary" class="text-xs"> v{{ plugin.version }} </Badge>
                  <Badge variant="outline" class="text-xs">
                    {{ getSourceLabel(plugin.source) }}
                  </Badge>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ plugin.metadata.description }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  安装于 {{ formatDate(plugin.installedAt) }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <Button
                size="sm"
                variant="destructive"
                @click="uninstallPlugin(plugin.id)"
              >
                卸载
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 插件商店标签页 -->
      <div v-show="activeTab === 'store'" class="p-6 space-y-6">
        <!-- 从 URL 安装 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            从 URL 安装插件
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            输入插件 ZIP 文件的 URL（支持纯前端和带后端的插件）
          </p>

          <div class="flex gap-3">
            <Input
              v-model="installUrl"
              placeholder="http://localhost:8080/plugin.zip"
              class="flex-1"
              :disabled="installing"
            />
            <Button :disabled="installing || !installUrl.trim()" @click="installFromUrl">
              {{ installing ? '安装中...' : '安装' }}
            </Button>
          </div>

          <!-- 成功消息 -->
          <div
            v-if="success"
            class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-sm text-green-900 dark:text-green-100">{{ success }}</span>
          </div>

          <!-- 错误消息 -->
          <div
            v-if="error"
            class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
          >
            <svg
              class="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm text-red-900 dark:text-red-100">{{ error }}</span>
          </div>
        </div>

        <!-- 插件开发指南 -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3
            class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            开发者指南
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">
            想要开发自己的插件？查看我们的文档：
          </p>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>
              完整指南：<code
                class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded"
                >PLUGIN_GUIDE.md</code
              >
            </li>
            <li>
              示例代码：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded"
                >examples/</code
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
