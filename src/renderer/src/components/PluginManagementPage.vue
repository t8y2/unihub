<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { pluginRegistry } from '@/plugins'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { PluginIcon } from '@/components/ui/plugin-icon'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import PluginDevMode from './PluginDevMode.vue'
import PluginStore from './PluginStore.vue'
import { CATEGORY_NAMES } from '@/constants'

type ActiveTab = 'store' | 'installed' | 'install'

const activeTab = ref<ActiveTab>('store')
const showDevMode = ref(false)
const installUrl = ref('')
const installing = ref(false)
const isDragging = ref(false)
const dragCounter = ref(0) // 用于跟踪拖拽进入/离开的次数

const fileInput = ref<HTMLInputElement>()
const showUninstallDialog = ref(false)
const pluginToUninstall = ref<{ id: string; name: string } | null>(null)
const refreshKey = ref(0)

// 事件处理器引用
let pluginEventHandler: (() => void) | null = null

// 内置插件（不包括第三方）
const builtInPlugins = computed(() => {
  void pluginRegistry.version.value
  void refreshKey.value
  return pluginRegistry.getAll().filter((p) => !p.metadata.isThirdParty)
})

// 第三方插件（从 registry 获取，确保状态同步）
const thirdPartyPlugins = computed(() => {
  void pluginRegistry.version.value
  void refreshKey.value
  return pluginRegistry.getAll().filter((p) => p.metadata.isThirdParty)
})

interface InstalledPlugin {
  id: string
  version: string
  source: string
  installedAt: string
  enabled: boolean
  metadata: {
    name: string
    description: string
  }
}

// 已安装的第三方插件（用于显示详细信息）
const installedPlugins = ref<InstalledPlugin[]>([])

// 按分类分组（只包含内置插件）
const pluginsByCategory = computed(() => {
  const categories = new Map<string, typeof builtInPlugins.value>()
  void refreshKey.value

  for (const plugin of builtInPlugins.value) {
    const category = plugin.metadata.category
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)!.push(plugin)
  }

  return categories
})

const enabledCount = computed(() => pluginRegistry.getEnabled().length)

// 切换插件状态
const togglePlugin = (id: string): void => {
  pluginRegistry.toggle(id)
  refreshKey.value++
}

// 加载已安装的第三方插件
const loadInstalledPlugins = async (): Promise<void> => {
  try {
    const plugins = await window.api.plugin.list()
    installedPlugins.value = plugins as unknown as InstalledPlugin[]
  } catch (err) {
    console.error('加载已安装插件失败:', err)
  }
}

onMounted(() => {
  loadInstalledPlugins()

  // 监听插件安装/卸载事件
  pluginEventHandler = () => {
    console.log('收到插件变更事件，刷新列表')
    loadInstalledPlugins()
    refreshKey.value++
  }

  window.addEventListener('plugin-installed', pluginEventHandler)
  window.addEventListener('plugin-uninstalled', pluginEventHandler)
})

onUnmounted(() => {
  // 清理事件监听
  if (pluginEventHandler) {
    window.removeEventListener('plugin-installed', pluginEventHandler)
    window.removeEventListener('plugin-uninstalled', pluginEventHandler)
  }
})

// 从 URL 安装
const installFromUrl = async (): Promise<void> => {
  if (!installUrl.value.trim()) {
    toast.error('请输入插件 URL')
    return
  }

  try {
    installing.value = true
    await pluginInstaller.installFromUrl(installUrl.value)
    toast.success('插件安装成功！')
    installUrl.value = ''
    // 先重新加载插件列表，再刷新注册表
    await pluginInstaller.loadInstalledPlugins()
    await loadInstalledPlugins()
    // 强制刷新视图
    refreshKey.value++
    // 触发全局事件
    window.dispatchEvent(new CustomEvent('plugin-installed'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '安装失败')
  } finally {
    installing.value = false
  }
}

// 处理文件拖拽
const handleDragEnter = (event: DragEvent): void => {
  event.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent): void => {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

const handleDrop = async (event: DragEvent): Promise<void> => {
  event.preventDefault()
  dragCounter.value = 0
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) {
    toast.error('请拖拽一个文件')
    return
  }

  await installFile(file)
}

// 触发文件选择
const triggerFileSelect = (): void => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    await installFile(file)
    target.value = '' // 清空，允许重复选择
  }
}

// 安装文件
const installFile = async (file: File): Promise<void> => {
  if (!file.name.endsWith('.zip')) {
    toast.error('只支持 .zip 格式的插件文件')
    return
  }

  try {
    installing.value = true
    await pluginInstaller.installFromFile(file)
    toast.success('插件安装成功！')
    // 先重新加载插件列表，再刷新注册表
    await pluginInstaller.loadInstalledPlugins()
    await loadInstalledPlugins()
    // 强制刷新视图
    refreshKey.value++
    // 触发全局事件
    window.dispatchEvent(new CustomEvent('plugin-installed'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '安装失败')
  } finally {
    installing.value = false
  }
}

// 卸载插件 - 显示确认对话框
const confirmUninstall = (pluginId: string, pluginName: string): void => {
  pluginToUninstall.value = { id: pluginId, name: pluginName }
  showUninstallDialog.value = true
}

// 执行卸载
const uninstallPlugin = async (): Promise<void> => {
  if (!pluginToUninstall.value) return

  try {
    await pluginInstaller.uninstall(pluginToUninstall.value.id)
    toast.success('插件已卸载')
    await loadInstalledPlugins()
    // 强制刷新视图
    refreshKey.value++
    // 触发全局事件
    window.dispatchEvent(new CustomEvent('plugin-uninstalled'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '卸载失败')
  } finally {
    showUninstallDialog.value = false
    pluginToUninstall.value = null
  }
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
            activeTab === 'store'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'store'"
        >
          插件市场
        </button>
        <button
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'installed'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          ]"
          @click="activeTab = 'installed'"
        >
          已安装
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
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="showDevMode = true"> 开发模式 </Button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
      <!-- 已安装插件标签页 -->
      <div v-show="activeTab === 'installed'" class="space-y-6 pt-4">
        <!-- 第三方插件 -->
        <div v-if="thirdPartyPlugins.length > 0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            第三方插件
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              {{ thirdPartyPlugins.length }} 个已安装
            </span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div
              v-for="plugin in thirdPartyPlugins"
              :key="plugin.metadata.id"
              class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <!-- 图标 -->
              <PluginIcon :icon="plugin.metadata.icon" size="md" />

              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ plugin.metadata.name }}
                  </h4>
                  <Badge variant="secondary" class="text-xs">
                    v{{ plugin.metadata.version }}
                  </Badge>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ plugin.metadata.description }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <Button
                size="sm"
                variant="outline"
                class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                @click="confirmUninstall(plugin.metadata.id, plugin.metadata.name)"
              >
                卸载
              </Button>
            </div>
          </div>
        </div>

        <!-- 内置插件 -->
        <div
          :class="{
            'pt-6 border-t border-gray-200 dark:border-gray-700': thirdPartyPlugins.length > 0
          }"
        >
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
                {{ CATEGORY_NAMES[category] || category }}
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

      <!-- 插件市场标签页 -->
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
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @click="triggerFileSelect"
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
        </div>
      </div>
    </div>

    <!-- 开发模式对话框 -->
    <PluginDevMode v-if="showDevMode" @close="showDevMode = false" />

    <!-- 卸载确认对话框 -->
    <Dialog :open="showUninstallDialog" @update:open="showUninstallDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认卸载插件</DialogTitle>
          <DialogDescription>
            确定要卸载插件 "{{ pluginToUninstall?.name }}" 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" @click="showUninstallDialog = false">取消</Button>
          <Button variant="destructive" @click="uninstallPlugin">确认卸载</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
