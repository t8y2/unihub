<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PluginIcon } from '@/components/ui/plugin-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import PermissionDialog from './PermissionDialog.vue'
import PluginRating from './PluginRating.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  MARKETPLACE_URL,
  MARKETPLACE_CDN_URL,
  MARKETPLACE_CATEGORIES,
  CATEGORY_NAMES
} from '@/constants'
import { pluginStatsService } from '@/plugins/marketplace/stats'

type ViewMode = 'grid' | 'list'

interface PluginInstallOptions {
  zip?: string
  npm?: string
  github?: string
}

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
  install: PluginInstallOptions
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
const showPluginDetail = ref(false)
const showPermissionDialog = ref(false)
const installing = ref(false)
const installedPluginIds = ref<Set<string>>(new Set())
const pluginStats = ref<Map<string, { downloads: number; averageRating: number }>>(new Map())
const loadingStats = ref(false)
const viewMode = ref<ViewMode>('grid')

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

    // 优先从 API 获取，失败时降级到 CDN
    let response = await fetch(MARKETPLACE_URL)

    // 如果 API 失败，尝试 CDN
    if (!response.ok && MARKETPLACE_CDN_URL) {
      console.warn('API 获取失败，尝试从 CDN 获取插件列表')
      response = await fetch(MARKETPLACE_CDN_URL)
    }

    if (!response.ok) {
      throw new Error('加载插件列表失败')
    }

    const data = await response.json()
    plugins.value = data.plugins || []

    // 加载统计数据
    loadPluginStats()
  } catch (err) {
    error.value = (err as Error).message
    console.error('加载插件失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载插件统计数据
const loadPluginStats = async (): Promise<void> => {
  if (plugins.value.length === 0) return

  try {
    loadingStats.value = true
    const pluginIds = plugins.value.map((p) => p.id)
    const stats = await pluginStatsService.getBatchStats(pluginIds)
    pluginStats.value = stats
  } catch (err) {
    console.warn('加载统计数据失败:', err)
  } finally {
    loadingStats.value = false
  }
}

// 获取插件显示的统计数据（优先使用实时数据）
const getPluginDisplayStats = (plugin: Plugin): { downloads: number; rating: number } => {
  const liveStats = pluginStats.value.get(plugin.id)
  return {
    downloads: liveStats?.downloads ?? plugin.downloads ?? 0,
    rating: liveStats?.averageRating ?? plugin.rating ?? 0
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
  showPluginDetail.value = true
}

// 关闭插件详情
const closePluginDetail = (): void => {
  showPluginDetail.value = false
  // 延迟清空，等动画结束
  setTimeout(() => {
    selectedPlugin.value = null
  }, 200)
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

    console.log('📦 [Marketplace] 开始安装插件:', selectedPlugin.value.name)

    // 使用 install.zip
    const installUrl = selectedPlugin.value.install?.zip

    if (!installUrl) {
      throw new Error('插件没有提供 ZIP 安装地址')
    }

    const result = await window.api.plugin.install(installUrl)

    if (result.success) {
      console.log('✅ [Marketplace] 插件安装成功')

      // 记录下载统计
      if (selectedPlugin.value.id) {
        console.log('📊 [Marketplace] 记录下载统计:', selectedPlugin.value.id)
        pluginStatsService.trackDownload(selectedPlugin.value.id).catch((err) => {
          console.warn('⚠️ [Marketplace] 记录下载失败:', err)
        })
      }

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
    <!-- 搜索和筛选 -->
    <div class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
      <div class="flex gap-4 items-center">
        <div class="flex-1">
          <Input v-model="searchQuery" placeholder="搜索插件..." class="w-full" />
        </div>

        <Select v-model="selectedCategory">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="cat in MARKETPLACE_CATEGORIES" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- 视图切换按钮 -->
        <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
          <button
            title="网格视图"
            :class="[
              'p-1.5 rounded-l-md transition-colors',
              viewMode === 'grid'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            ]"
            @click="viewMode = 'grid'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            title="列表视图"
            :class="[
              'p-1.5 rounded-r-md transition-colors border-l border-gray-200 dark:border-gray-700',
              viewMode === 'list'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            ]"
            @click="viewMode = 'list'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <Button :disabled="loading" @click="loadPlugins"> 刷新 </Button>
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
      <div v-else-if="filteredPlugins.length > 0">
        <!-- 网格视图 -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="plugin in filteredPlugins"
            :key="plugin.id"
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
          >
            <!-- 插件图标和信息 -->
            <div
              class="flex items-start gap-3 mb-3 cursor-pointer"
              @click="openPluginDetail(plugin)"
            >
              <PluginIcon :icon="plugin.icon" size="lg" />
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
            <p
              class="text-sm text-gray-600 dark:text-gray-400 mb-3 cursor-pointer truncate"
              @click="openPluginDetail(plugin)"
            >
              {{ plugin.description }}
            </p>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-3 cursor-pointer" @click="openPluginDetail(plugin)">
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

            <!-- 统计和操作按钮 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ getPluginDisplayStats(plugin).downloads }} 下载</span>
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {{ getPluginDisplayStats(plugin).rating.toFixed(1) }}
                </span>
              </div>

              <!-- 安装/已安装按钮 - App Store 风格 -->
              <button
                v-if="!isPluginInstalled(plugin.id)"
                class="px-4 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                :disabled="installing"
                @click.stop="installPlugin(plugin)"
              >
                安装
              </button>
              <button
                v-else
                class="px-4 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full cursor-default"
                disabled
              >
                已安装
              </button>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="space-y-2">
          <div
            v-for="plugin in filteredPlugins"
            :key="plugin.id"
            class="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow"
          >
            <!-- 图标 -->
            <div class="cursor-pointer" @click="openPluginDetail(plugin)">
              <PluginIcon :icon="plugin.icon" size="md" />
            </div>

            <!-- 信息 -->
            <div class="flex-1 min-w-0 cursor-pointer" @click="openPluginDetail(plugin)">
              <div class="flex items-center gap-2 mb-0.5">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ plugin.name }}
                </h3>
                <Badge variant="secondary" class="text-xs py-0">
                  {{ CATEGORY_NAMES[plugin.category] || plugin.category }}
                </Badge>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 truncate mb-0.5">
                {{ plugin.description }}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ plugin.author.name }}</span>
                <span>v{{ plugin.version }}</span>
                <span>{{ getPluginDisplayStats(plugin).downloads }} 下载</span>
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {{ getPluginDisplayStats(plugin).rating.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- 关键词标签 -->
            <div class="flex gap-1.5 cursor-pointer" @click="openPluginDetail(plugin)">
              <Badge
                v-for="keyword in plugin.keywords.slice(0, 3)"
                :key="keyword"
                variant="outline"
                class="text-xs py-0"
              >
                {{ keyword }}
              </Badge>
            </div>

            <!-- 安装/已安装按钮 - App Store 风格 -->
            <button
              v-if="!isPluginInstalled(plugin.id)"
              class="px-5 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 whitespace-nowrap"
              :disabled="installing"
              @click.stop="installPlugin(plugin)"
            >
              安装
            </button>
            <button
              v-else
              class="px-5 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full cursor-default whitespace-nowrap"
              disabled
            >
              已安装
            </button>
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
    <Dialog v-model:open="showPluginDetail">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader v-if="selectedPlugin">
          <div class="flex items-start gap-4 mb-4">
            <PluginIcon :icon="selectedPlugin.icon" size="xl" />
            <div class="flex-1">
              <DialogTitle class="text-2xl">{{ selectedPlugin.name }}</DialogTitle>
              <DialogDescription class="mt-1">
                {{ selectedPlugin.author.name }} · v{{ selectedPlugin.version }}
              </DialogDescription>
              <div class="flex gap-2 mt-2">
                <Badge variant="secondary">
                  {{ CATEGORY_NAMES[selectedPlugin.category] }}
                </Badge>
                <Badge variant="outline">
                  {{ getPluginDisplayStats(selectedPlugin).downloads }} 下载
                </Badge>
                <Badge variant="outline" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {{ getPluginDisplayStats(selectedPlugin).rating.toFixed(1) }}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div v-if="selectedPlugin" class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            {{ selectedPlugin.description }}
          </p>

          <!-- 关键词 -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">关键词</h3>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="keyword in selectedPlugin.keywords" :key="keyword" variant="outline">
                {{ keyword }}
              </Badge>
            </div>
          </div>

          <!-- 评分 -->
          <PluginRating
            v-if="isPluginInstalled(selectedPlugin.id)"
            :plugin-id="selectedPlugin.id"
            :plugin-name="selectedPlugin.name"
          />

          <!-- 权限 -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">需要的权限</h3>
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

        <DialogFooter v-if="selectedPlugin">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
