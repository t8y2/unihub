<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pluginRegistry } from '@/plugins'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import PluginDevMode from './PluginDevMode.vue'
import PluginStore from './PluginStore.vue'

const activeTab = ref<'store' | 'installed' | 'install' | 'guide'>('store')
const showDevMode = ref(false)
const installUrl = ref('')
const installing = ref(false)
const error = ref('')
const success = ref('')
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

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
const installedPlugins = ref<
  Array<{
    id: string
    version: string
    source: string
    installedAt: string
    metadata: {
      name: string
      description: string
    }
  }>
>([])

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
    <div class="flex items-center justify-between px-6 pt-4 pb-2">
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

      <!-- 开发模式按钮 -->
      <Button variant="outline" size="sm" @click="showDevMode = true"> 开发模式 </Button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
      <!-- 已安装插件标签页 -->
      <div v-show="activeTab === 'installed'" class="space-y-6 pt-4">
        <!-- 第三方插件 -->
        <div v-if="installedPlugins.length > 0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            第三方插件
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              {{ installedPlugins.length }} 个已安装
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
                class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                @click="uninstallPlugin(plugin.id)"
              >
                卸载
              </Button>
            </div>
          </div>
        </div>

        <!-- 内置插件 -->
        <div :class="{ 'pt-6 border-t border-gray-200 dark:border-gray-700': installedPlugins.length > 0 }">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            内置插件
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              已启用 {{ enabledCount }} / {{ builtInPlugins.length }} 个
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
      </div>

      <!-- 插件商店标签页 -->
      <div v-show="activeTab === 'store'" class="h-full">
        <PluginStore />
      </div>

      <!-- 手动安装标签页 -->
      <div v-show="activeTab === 'install'" class="space-y-4 pt-4">
        <!-- 从 URL 安装 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">手动安装插件</h3>

          <!-- 拖拽区域 -->
          <div
            :class="[
              'border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            ]"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            @click="triggerFileSelect"
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
            class="hidden"
            @change="handleFileSelect"
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
      <div v-show="activeTab === 'guide'" class="space-y-4 pt-4">
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
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📚 文档资源
              </h4>
              <ul
                class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside ml-4"
              >
                <li>
                  完整指南：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded"
                    >PLUGIN_GUIDE.md</code
                  >
                </li>
                <li>
                  架构设计：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded"
                    >PLUGIN_ARCHITECTURE.md</code
                  >
                </li>
                <li>
                  示例代码：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded"
                    >examples/</code
                  >
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎨 支持的技术栈
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    前端框架
                  </h5>
                  <ul class="text-xs text-blue-600 dark:text-blue-400 space-y-0.5 ml-2">
                    <li>• 原生 JavaScript</li>
                    <li>• Vue 3</li>
                    <li>• React</li>
                    <li>• Svelte</li>
                  </ul>
                </div>
                <div>
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    后端语言
                  </h5>
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
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🚀 快速开始
              </h4>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded p-3">
                <pre
                  class="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto"
                ><code># 1. 查看示例插件
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
              <h4 class="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📦 插件结构
              </h4>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded p-3">
                <pre
                  class="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto"
                ><code>plugin.zip
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
    </div>

    <!-- 开发模式对话框 -->
    <PluginDevMode v-if="showDevMode" @close="showDevMode = false" />
  </div>
</template>
