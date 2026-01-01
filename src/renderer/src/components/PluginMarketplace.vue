<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'vue-sonner'
import PermissionDialog from './PermissionDialog.vue'
import { MARKETPLACE_URL, MARKETPLACE_CATEGORIES, CATEGORY_NAMES } from '@/constants'

interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: {
    name: string
    email?: string
    url?: string
  }
  icon: string
  category: string
  keywords: string[]
  permissions: string[]
  downloadUrl: string
  homepage?: string
  repository?: string
  screenshots: string[]
  downloads: number
  rating: number
  createdAt: string
  updatedAt: string
}

const plugins = ref<Plugin[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedPlugin = ref<Plugin | null>(null)
const showPermissionDialog = ref(false)
const installing = ref(false)
const installedPluginIds = ref<Set<string>>(new Set())

// 事件处理器引用
let pluginChangeHandler: (() => void) | null = null

// 加载已安装插件列表
const loadInstalledPlugins = async (): Promise<void> => {
  try {
    const installed = await window.api.plugin.list()
    installedPluginIds.value = new Set(installed.map((p) => p.id as string))
  } catch (err) {
    console.error('加载已安装插件失败:', err)
  }
}

// 检查插件是否已安装
const isPluginInstalled = (pluginId: string): boolean => {
  return installedPluginIds.value.has(pluginId)
}

// 加载插件列表
const loadPlugins = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''

    const response = await fetch(MARKETPLACE_URL)
    if (!response.ok) {
      throw new Error('加载插件列表失败')
    }

    const data = await response.json()
    plugins.value = data.plugins || []
  } catch (err) {
    error.value = (err as Error).message
    console.error('加载插件失败:', err)
  } finally {
    loading.value = false
  }
}

// 过滤插件
const filteredPlugins = computed(() => {
  let result = plugins.value

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    result = result.filter((p) => p.category === selectedCategory.value)
  }

  // 按搜索词过滤
  const query = searchQuery.value.trim()
  if (query) {
    const lowerQuery = query.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    )
  }

  return result
})

// 打开插件详情
const openPluginDetail = (plugin: Plugin): void => {
  selectedPlugin.value = plugin
}

// 关闭插件详情
const closePluginDetail = (): void => {
  selectedPlugin.value = null
}

// 安装插件
const installPlugin = async (plugin: Plugin): Promise<void> => {
  // 显示权限对话框
  selectedPlugin.value = plugin
  showPermissionDialog.value = true
}

// 确认安装
const confirmInstall = async (): Promise<void> => {
  if (!selectedPlugin.value) return

  try {
    installing.value = true
    showPermissionDialog.value = false

    const result = await window.api.plugin.install(selectedPlugin.value.downloadUrl)

    if (result.success) {
      toast.success(`${selectedPlugin.value.name} 安装成功！`)
      closePluginDetail()
      
      // 重新加载插件
      const { pluginInstaller } = await import('@/plugins/marketplace/installer')
      await pluginInstaller.loadInstalledPlugins()
      
      // 更新已安装列表
      await loadInstalledPlugins()
      
      // 触发全局刷新事件（通知其他组件）
      window.dispatchEvent(new CustomEvent('plugin-installed'))
    } else {
      toast.error(`安装失败: ${result.message}`)
    }
  } catch (err) {
    toast.error(`安装失败: ${(err as Error).message}`)
  } finally {
    installing.value = false
  }
}

onMounted(() => {
  loadPlugins()
  loadInstalledPlugins()
  
  // 监听插件变更事件
  pluginChangeHandler = () => {
    console.log('收到插件变更事件，刷新已安装列表')
    loadInstalledPlugins()
  }
  
  window.addEventListener('plugin-installed', pluginChangeHandler)
  window.addEventListener('plugin-uninstalled', pluginChangeHandler)
})

onUnmounted(() => {
  // 清理事件监听
  if (pluginChangeHandler) {
    window.removeEventListener('plugin-installed', pluginChangeHandler)
    window.removeEventListener('plugin-uninstalled', pluginChangeHandler)
  }
})
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 头部 -->
    <div class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">插件市场</h1>

      <!-- 搜索和筛选 -->
      <div class="flex gap-4">
        <div class="flex-1">
          <Input v-model="searchQuery" placeholder="搜索插件..." class="w-full" />
        </div>

        <select
          v-model="selectedCategory"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option v-for="cat in MARKETPLACE_CATEGORIES" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>

        <Button :disabled="loading" @click="loadPlugins">
          <svg
            class="w-4 h-4 mr-2"
            :class="{ 'animate-spin': loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </Button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">加载插件列表...</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="flex items-center justify-center h-64">
        <div class="text-center max-w-md">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-red-600 dark:text-red-400"
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
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">加载失败</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
          <Button @click="loadPlugins">重试</Button>
        </div>
      </div>

      <!-- 插件列表 -->
      <div
        v-else-if="filteredPlugins.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="plugin in filteredPlugins"
          :key="plugin.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
          @click="openPluginDetail(plugin)"
        >
          <!-- 插件图标和信息 -->
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"
            >
              <!-- 如果 icon 是 SVG path，显示 SVG；否则显示 emoji -->
              <svg
                v-if="
                  plugin.icon.startsWith('M') || plugin.icon.startsWith('m')
                "
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="plugin.icon"
                />
              </svg>
              <span v-else class="text-2xl">{{ plugin.icon }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ plugin.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ plugin.author.name }} · v{{ plugin.version }}
              </p>
            </div>
          </div>

          <!-- 描述 -->
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {{ plugin.description }}
          </p>

          <!-- 标签 -->
          <div class="flex flex-wrap gap-2 mb-3">
            <Badge v-if="isPluginInstalled(plugin.id)" variant="default" class="bg-green-600">
              ✓ 已安装
            </Badge>
            <Badge variant="secondary">
              {{ CATEGORY_NAMES[plugin.category] || plugin.category }}
            </Badge>
            <Badge
              v-for="keyword in plugin.keywords.slice(0, 2)"
              :key="keyword"
              variant="outline"
            >
              {{ keyword }}
            </Badge>
          </div>

          <!-- 统计 -->
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{{ plugin.downloads }} 下载</span>
            <span>⭐ {{ plugin.rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg
            class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">未找到匹配的插件</p>
        </div>
      </div>
    </div>

    <!-- 插件详情对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedPlugin"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="closePluginDetail"
        >
          <div
            class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
            @click.stop
          >
            <!-- 详情头部 -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-start gap-4">
                <div
                  class="w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"
                >
                  <!-- 如果 icon 是 SVG path，显示 SVG；否则显示 emoji -->
                  <svg
                    v-if="
                      selectedPlugin.icon.startsWith('M') ||
                      selectedPlugin.icon.startsWith('m')
                    "
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="selectedPlugin.icon"
                    />
                  </svg>
                  <span v-else class="text-3xl">{{ selectedPlugin.icon }}</span>
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {{ selectedPlugin.name }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {{ selectedPlugin.author.name }} · v{{ selectedPlugin.version }}
                  </p>
                  <div class="flex gap-2">
                    <Badge variant="secondary">
                      {{ CATEGORY_NAMES[selectedPlugin.category] }}
                    </Badge>
                    <Badge variant="outline">{{ selectedPlugin.downloads }} 下载</Badge>
                    <Badge variant="outline">⭐ {{ selectedPlugin.rating.toFixed(1) }}</Badge>
                  </div>
                </div>
                <button
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  @click="closePluginDetail"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <!-- 详情内容 -->
            <div class="p-6 max-h-96 overflow-y-auto">
              <p class="text-gray-700 dark:text-gray-300 mb-4">
                {{ selectedPlugin.description }}
              </p>

              <!-- 关键词 -->
              <div class="mb-4">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">关键词</h3>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="keyword in selectedPlugin.keywords"
                    :key="keyword"
                    variant="outline"
                  >
                    {{ keyword }}
                  </Badge>
                </div>
              </div>

              <!-- 权限 -->
              <div class="mb-4">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  需要的权限
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="permission in selectedPlugin.permissions"
                    :key="permission"
                    class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ permission }}
                  </div>
                </div>
              </div>

              <!-- 链接 -->
              <div class="flex gap-4 text-sm">
                <a
                  v-if="selectedPlugin.homepage"
                  :href="selectedPlugin.homepage"
                  target="_blank"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  主页
                </a>
                <a
                  v-if="selectedPlugin.repository"
                  :href="selectedPlugin.repository"
                  target="_blank"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  源码
                </a>
              </div>
            </div>

            <!-- 详情底部 -->
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" @click="closePluginDetail">取消</Button>
              <Button
                v-if="!isPluginInstalled(selectedPlugin.id)"
                :disabled="installing"
                @click="installPlugin(selectedPlugin)"
              >
                {{ installing ? '安装中...' : '安装插件' }}
              </Button>
              <Button v-else variant="secondary" disabled>
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                已安装
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 权限对话框 -->
    <PermissionDialog
      v-if="selectedPlugin"
      :visible="showPermissionDialog"
      :plugin-name="selectedPlugin.name"
      :permissions="selectedPlugin.permissions"
      @confirm="confirmInstall"
      @cancel="showPermissionDialog = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
