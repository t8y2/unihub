<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pluginRegistry } from '@/plugins'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const activeTab = ref<'store' | 'installed' | 'install' | 'guide'>('store')
const installUrl = ref('')
const installing = ref(false)
const error = ref('')
const success = ref('')
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

// 官方插件商店
interface OfficialPlugin {
  id: string
  name: string
  description: string
  version: string
  author: { name: string }
  category: string
  keywords: string[]
  icon?: string
  downloadUrl: string
  homepage?: string
  downloads?: number
  rating?: number
  verified?: boolean
}

const officialPlugins = ref<OfficialPlugin[]>([])
const loadingOfficialPlugins = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('all')

// 强制刷新计数器
const refreshKey = ref(0)

// 内置插件
const builtInPlugins = computed(() => {
  // 依赖 pluginRegistry.version 来触发重新计算
  void pluginRegistry.version.value // 访问以触发响应式
  void refreshKey.value // 访问以触发响应式
  return pluginRegistry.getAll()
})

// 已安装的第三方插件
const installedPlugins = ref<Array<{
  id: string
  version: string
  source: string
  installedAt: string
  metadata: {
    name: string
    description: string
  }
}>>([])

// 加载官方插件列表
const loadOfficialPlugins = async (): Promise<void> => {
  try {
    loadingOfficialPlugins.value = true
    
    // 临时使用本地测试数据
    const testData = {
      plugins: [
        {
          id: "com.unihub.hash-tool",
          name: "哈希工具",
          description: "计算文件和文本的 MD5、SHA256 等哈希值，支持拖拽文件批量处理",
          version: "1.2.0",
          author: { name: "UniHub Team" },
          category: "tool",
          keywords: ["hash", "md5", "sha256", "crypto", "security"],
          icon: "M12 4v16m8-8H4",
          downloadUrl: "http://localhost:8080/hash-tool.zip",
          homepage: "https://github.com/unihub-team/hash-tool",
          downloads: 1250,
          rating: 4.8,
          verified: true
        },
        {
          id: "com.community.json-formatter",
          name: "JSON 格式化器",
          description: "美化和压缩 JSON 数据，支持语法高亮和错误检测",
          version: "2.1.0",
          author: { name: "张三" },
          category: "formatter",
          keywords: ["json", "format", "beautify", "minify"],
          icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
          downloadUrl: "http://localhost:8080/json-formatter.zip",
          homepage: "https://github.com/zhangsan/json-formatter",
          downloads: 890,
          rating: 4.5,
          verified: false
        },
        {
          id: "com.community.base64-encoder",
          name: "Base64 编码器",
          description: "Base64 编码和解码工具，支持文本和文件处理",
          version: "1.0.3",
          author: { name: "李四" },
          category: "encoder",
          keywords: ["base64", "encode", "decode", "text"],
          icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z",
          downloadUrl: "http://localhost:8080/base64-encoder.zip",
          downloads: 456,
          rating: 4.2,
          verified: false
        }
      ]
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    officialPlugins.value = testData.plugins || []
    
    // 正式版本使用这个：
    // const response = await fetch('https://raw.githubusercontent.com/awesome-unihub-plugins/main/plugins.json')
    // const data = await response.json()
    // officialPlugins.value = data.plugins || []
  } catch (err) {
    console.error('加载官方插件失败:', err)
    error.value = '加载官方插件列表失败'
  } finally {
    loadingOfficialPlugins.value = false
  }
}

// 过滤官方插件
const filteredOfficialPlugins = computed(() => {
  let plugins = officialPlugins.value
  
  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    plugins = plugins.filter((p) => p.category === selectedCategory.value)
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    plugins = plugins.filter((p) => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.keywords.some((k: string) => k.toLowerCase().includes(query))
    )
  }
  
  return plugins
})

// 获取官方插件的所有分类
const officialCategories = computed(() => {
  const cats = new Set(officialPlugins.value.map((p) => p.category))
  return Array.from(cats)
})

// 安装官方插件
const installOfficialPlugin = async (plugin: OfficialPlugin): Promise<void> => {
  try {
    installing.value = true
    error.value = ''
    success.value = ''

    await pluginInstaller.installFromUrl(plugin.downloadUrl)
    success.value = `✅ ${plugin.name} 安装成功！`

    // 重新加载插件列表
    await loadInstalledPlugins()
    await pluginInstaller.loadInstalledPlugins()

    setTimeout(() => {
      success.value = ''
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '安装失败'
  } finally {
    installing.value = false
  }
}

// 打开插件主页
const openPluginHomepage = (url: string): void => {
  window.open(url, '_blank')
}

// 按分类分组
const pluginsByCategory = computed(() => {
  const categories = new Map<string, typeof builtInPlugins.value>()
  // 触发响应式更新
  const plugins = builtInPlugins.value
  void refreshKey.value // 访问以触发重新计算
  
  plugins.forEach((plugin) => {
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
  // 强制刷新
  refreshKey.value++
}

const enabledCount = computed(() => pluginRegistry.getEnabled().length)

// 加载已安装的第三方插件
const loadInstalledPlugins = async (): Promise<void> => {
  try {
    const plugins = await window.api.plugin.list()
    installedPlugins.value = plugins
  } catch (err) {
    console.error('加载已安装插件失败:', err)
  }
}

onMounted(() => {
  loadInstalledPlugins()
  loadOfficialPlugins()
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

// 处理文件拖拽
const handleDrop = async (event: DragEvent): Promise<void> => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    error.value = '请拖拽一个文件'
    return
  }

  const file = files[0]
  await installFile(file)
}

// 触发文件选择
const triggerFileSelect = (): void => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) {
    return
  }

  const file = files[0]
  await installFile(file)

  // 清空文件输入，允许重复选择同一文件
  target.value = ''
}

// 安装文件的通用方法
const installFile = async (file: File): Promise<void> => {
  if (!file.name.endsWith('.zip')) {
    error.value = '只支持 .zip 格式的插件文件'
    return
  }

  try {
    installing.value = true
    error.value = ''
    success.value = ''

    // 直接调用文件安装方法
    await pluginInstaller.installFromFile(file)

    success.value = '✅ 插件安装成功！'

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
    <!-- 标签页切换 -->
    <div class="flex items-center gap-1 px-6 pt-4 pb-2">
      <div class="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'installed'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'installed'"
        >
          已安装 ({{ builtInPlugins.length + installedPlugins.length }})
        </button>
        <button
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'store'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'store'"
        >
          插件商店
        </button>
        <button
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'install'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'install'"
        >
          手动安装
        </button>
        <button
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'guide'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'guide'"
        >
          开发指南
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 已安装插件标签页 -->
      <div v-show="activeTab === 'installed'" class="px-6 pb-6 space-y-4">
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

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                    @update:checked="togglePlugin(plugin.metadata.id)"
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

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                variant="outline"
                @click="uninstallPlugin(plugin.id)"
                class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                卸载
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 插件商店标签页 -->
      <div v-show="activeTab === 'store'" class="px-6 pb-6 space-y-4">
        <!-- 官方插件商店 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">官方插件商店</h3>
            
            <!-- 搜索和过滤 -->
            <div class="flex gap-3">
              <Input
                v-model="searchQuery"
                placeholder="搜索插件..."
                class="flex-1"
              />
              <select
                v-model="selectedCategory"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">所有分类</option>
                <option v-for="cat in officialCategories" :key="cat" :value="cat">
                  {{ categoryNames[cat] || cat }}
                </option>
              </select>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loadingOfficialPlugins" class="p-12 text-center">
            <div
              class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            ></div>
            <p class="text-gray-600 dark:text-gray-400">加载插件列表中...</p>
          </div>

          <!-- 官方插件列表 -->
          <div v-else-if="filteredOfficialPlugins.length > 0" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div
                v-for="plugin in filteredOfficialPlugins"
                :key="plugin.id"
                class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <!-- 插件头部 -->
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="plugin.icon || 'M12 4v16m8-8H4'"
                      />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {{ plugin.name }}
                      </h4>
                      <Badge v-if="plugin.verified" variant="secondary" class="text-xs flex-shrink-0">
                        ✓ 官方
                      </Badge>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      v{{ plugin.version }} · {{ plugin.author.name }}
                    </p>
                  </div>
                </div>

                <!-- 插件描述 -->
                <p
                  class="text-sm text-gray-700 dark:text-gray-300 mb-3"
                  style="
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  "
                >
                  {{ plugin.description }}
                </p>

                <!-- 标签 -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <Badge
                    v-for="keyword in plugin.keywords.slice(0, 3)"
                    :key="keyword"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ keyword }}
                  </Badge>
                </div>

                <!-- 统计信息 -->
                <div
                  class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-3"
                >
                  <span>{{ plugin.downloads || 0 }} 下载</span>
                  <span v-if="plugin.rating">⭐ {{ plugin.rating }}</span>
                </div>

                <!-- 操作按钮 -->
                <div class="flex gap-2">
                  <Button
                    :disabled="installing"
                    size="sm"
                    class="flex-1"
                    @click="installOfficialPlugin(plugin)"
                  >
                    {{ installing ? '安装中...' : '安装' }}
                  </Button>
                  <Button
                    v-if="plugin.homepage"
                    size="sm"
                    variant="outline"
                    @click="openPluginHomepage(plugin.homepage)"
                  >
                    详情
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="p-12 text-center">
            <svg
              class="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <p class="text-gray-600 dark:text-gray-400">
              {{ searchQuery ? '没有找到匹配的插件' : '暂无插件' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 手动安装标签页 -->
      <div v-show="activeTab === 'install'" class="px-6 pb-6 space-y-4">
        <!-- 官方插件商店 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">官方插件商店</h3>
            
            <!-- 搜索和过滤 -->
            <div class="flex gap-3">
              <Input
                v-model="searchQuery"
                placeholder="搜索插件..."
                class="flex-1"
              />
              <select
                v-model="selectedCategory"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">所有分类</option>
                <option v-for="cat in officialCategories" :key="cat" :value="cat">
                  {{ categoryNames[cat] || cat }}
                </option>
              </select>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loadingOfficialPlugins" class="p-12 text-center">
            <div
              class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            ></div>
            <p class="text-gray-600 dark:text-gray-400">加载插件列表中...</p>
          </div>

          <!-- 官方插件列表 -->
          <div v-else-if="filteredOfficialPlugins.length > 0" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div
                v-for="plugin in filteredOfficialPlugins"
                :key="plugin.id"
                class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <!-- 插件头部 -->
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="plugin.icon || 'M12 4v16m8-8H4'"
                      />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {{ plugin.name }}
                      </h4>
                      <Badge v-if="plugin.verified" variant="secondary" class="text-xs flex-shrink-0">
                        ✓ 官方
                      </Badge>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      v{{ plugin.version }} · {{ plugin.author.name }}
                    </p>
                  </div>
                </div>

                <!-- 插件描述 -->
                <p
                  class="text-sm text-gray-700 dark:text-gray-300 mb-3"
                  style="
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  "
                >
                  {{ plugin.description }}
                </p>

                <!-- 标签 -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <Badge
                    v-for="keyword in plugin.keywords.slice(0, 3)"
                    :key="keyword"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ keyword }}
                  </Badge>
                </div>

                <!-- 统计信息 -->
                <div
                  class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-3"
                >
                  <span>{{ plugin.downloads || 0 }} 下载</span>
                  <span v-if="plugin.rating">⭐ {{ plugin.rating }}</span>
                </div>

                <!-- 操作按钮 -->
                <div class="flex gap-2">
                  <Button
                    :disabled="installing"
                    size="sm"
                    class="flex-1"
                    @click="installOfficialPlugin(plugin)"
                  >
                    {{ installing ? '安装中...' : '安装' }}
                  </Button>
                  <Button
                    v-if="plugin.homepage"
                    size="sm"
                    variant="outline"
                    @click="openPluginHomepage(plugin.homepage)"
                  >
                    详情
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="p-12 text-center">
            <svg
              class="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <p class="text-gray-600 dark:text-gray-400">
              {{ searchQuery ? '没有找到匹配的插件' : '暂无插件' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 手动安装标签页 -->
      <div v-show="activeTab === 'install'" class="px-6 pb-6 space-y-4">
        <!-- 从 URL 安装 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">手动安装插件</h3>

          <!-- 拖拽区域 -->
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            @click="triggerFileSelect"
            :class="[
              'border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            ]"
            @dragenter="isDragging = true"
            @dragleave="isDragging = false"
          >
            <svg
              class="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              拖拽 ZIP 文件到这里
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">或者点击选择文件</p>
            <Button variant="outline" size="sm" type="button" @click.stop> 选择文件 </Button>
          </div>

          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            accept=".zip"
            @change="handleFileSelect"
            class="hidden"
          />

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            支持三种安装方式：拖拽文件、点击选择文件，或输入 URL
          </p>

          <div class="flex gap-3">
            <Input
              v-model="installUrl"
              placeholder="http://localhost:8080/plugin.zip 或 file:///path/to/plugin.zip"
              class="flex-1"
              :disabled="installing"
            />
            <Button :disabled="installing || !installUrl.trim()" @click="installFromUrl">
              {{ installing ? '安装中...' : '从 URL 安装' }}
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
      </div>

      <!-- 开发指南标签页 -->
      <div v-show="activeTab === 'guide'" class="px-6 pb-6 space-y-4">
        <!-- 插件开发指南 -->
        <div
          class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3
            class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            插件开发指南
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200 mb-4">
            UniHub 支持完全开放的插件系统，你可以使用任意前端框架和后端语言开发插件。
          </p>
          
          <div class="space-y-4">
            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">📚 文档资源</h4>
              <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside ml-4">
                <li>
                  完整指南：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">PLUGIN_GUIDE.md</code>
                </li>
                <li>
                  架构设计：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">PLUGIN_ARCHITECTURE.md</code>
                </li>
                <li>
                  示例代码：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">examples/</code>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">🎨 支持的技术栈</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">前端框架</h5>
                  <ul class="text-xs text-blue-600 dark:text-blue-400 space-y-0.5 ml-2">
                    <li>• 原生 JavaScript</li>
                    <li>• Vue 3</li>
                    <li>• React</li>
                    <li>• Svelte</li>
                  </ul>
                </div>
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">后端语言</h5>
                  <ul class="text-xs text-blue-600 dark:text-blue-400 space-y-0.5 ml-2">
                    <li>• Python</li>
                    <li>• Go</li>
                    <li>• Node.js</li>
                    <li>• Rust</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 快速开始</h4>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded p-3">
                <pre class="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto"><code># 1. 查看示例插件
cd examples/vanilla-go-plugin

# 2. 构建插件
./build.sh && ./package.sh

# 3. 启动测试服务器
python3 -m http.server 8080

# 4. 在手动安装页面输入
# http://localhost:8080/plugin.zip</code></pre>
              </div>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">📦 插件结构</h4>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded p-3">
                <pre class="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto"><code>plugin.zip
├── manifest.json      # 插件元数据
├── frontend/          # 前端代码
│   └── index.html    # 入口文件
└── backend/           # 后端代码（可选）
    └── main.*        # 可执行文件</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 开发指南标签页 -->
      <div v-show="activeTab === 'guide'" class="px-6 pb-6 space-y-4">
        <!-- 插件开发指南 -->
        <div
          class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
        >
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
          <p class="text-sm text-blue-800 dark:text-blue-200 mb-4">
            想要开发自己的插件？查看我们的完整文档和示例代码：
          </p>
          
          <div class="space-y-4">
            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">📚 文档资源</h4>
              <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>
                  完整指南：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">PLUGIN_GUIDE.md</code>
                </li>
                <li>
                  架构设计：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">PLUGIN_ARCHITECTURE.md</code>
                </li>
                <li>
                  示例代码：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">examples/</code>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">🎨 支持的技术栈</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">前端框架</h5>
                  <ul class="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                    <li>• 原生 JavaScript</li>
                    <li>• Vue 3</li>
                    <li>• React</li>
                    <li>• Svelte</li>
                  </ul>
                </div>
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">后端语言</h5>
                  <ul class="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                    <li>• Python</li>
                    <li>• Go</li>
                    <li>• Rust</li>
                    <li>• Node.js</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 快速开始</h4>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <pre class="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto"><code># 1. 查看示例
cd examples/vanilla-go-plugin

# 2. 构建插件
./build.sh && ./package.sh

# 3. 测试安装
python3 -m http.server 8080
# 然后在插件商店输入: http://localhost:8080/plugin.zip</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
