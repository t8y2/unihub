<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Kbd } from '@/components/ui/kbd'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  SETTINGS_TABS,
  SHORTCUT_LABELS,
  BUILTIN_SHORTCUTS,
  KEYBOARD_KEY_MAP,
  MODIFIER_KEYS,
  EXCLUDED_KEYS,
  APP_INFO
} from '@/constants'

const activeTab = ref('general')

// 设置数据
interface Settings {
  shortcuts: {
    toggleWindow: string
    globalSearch: string
  }
  pluginShortcuts: Array<{ pluginId: string; shortcut: string }>
  general: {
    launchAtStartup: boolean
    minimizeToTray: boolean
    language: string
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    sidebarWidth: number
  }
}

const settings = ref<Settings>({
  shortcuts: {
    toggleWindow: '',
    globalSearch: ''
  },
  pluginShortcuts: [],
  general: {
    launchAtStartup: false,
    minimizeToTray: true,
    language: 'zh-CN'
  },
  appearance: {
    theme: 'system',
    sidebarWidth: 208
  }
})

interface InstalledPlugin {
  id: string
  enabled: boolean
  metadata: {
    name: string
    icon?: string
  }
}

// 正在录制的快捷键
const recordingTarget = ref<
  | { type: 'global'; key: 'toggleWindow' | 'globalSearch' }
  | { type: 'plugin'; pluginId: string }
  | null
>(null)
const recordedKeys = ref<string[]>([])
// 设置页仅展示已安装且启用的插件
const installedPlugins = ref<InstalledPlugin[]>([])
const showPluginShortcutDialog = ref(false)
const pluginSearchQuery = ref('')
const selectedPluginId = ref('')
const dialogRecording = ref(false)
let pluginEventHandler: (() => void) | null = null

// 加载设置
const loadSettings = async (): Promise<void> => {
  try {
    console.log('加载设置')
    const data = await window.api.settings.getAll()
    settings.value = data
    console.log('设置加载成功', data)
  } catch (error) {
    console.error('加载设置失败', error)
  }
}

const loadInstalledPlugins = async (): Promise<void> => {
  try {
    const plugins = await window.api.plugin.list()
    installedPlugins.value = (plugins as InstalledPlugin[]).filter((plugin) => plugin.enabled)
    if (
      selectedPluginId.value &&
      !installedPlugins.value.some((plugin) => plugin.id === selectedPluginId.value)
    ) {
      selectedPluginId.value = ''
    }
  } catch (error) {
    console.error('加载已安装插件失败', error)
  }
}

// 保存快捷键
const saveShortcut = async (key: 'toggleWindow' | 'globalSearch', value: string): Promise<void> => {
  try {
    console.log('保存快捷键', key, value)
    await window.api.settings.setShortcut(key, value)
    settings.value.shortcuts[key] = value
    toast.success('快捷键已保存')
  } catch (error) {
    console.error('保存快捷键失败', error)
    toast.error('保存快捷键失败')
  }
}

const savePluginShortcut = async (pluginId: string, value: string): Promise<boolean> => {
  try {
    console.log('保存插件快捷键', pluginId, value)
    const result = await window.api.settings.setPluginShortcut(pluginId, value)
    if (!result.success) {
      throw new Error(result.message || '保存插件快捷键失败')
    }

    const existingIndex = settings.value.pluginShortcuts.findIndex(
      (item) => item.pluginId === pluginId
    )
    if (existingIndex >= 0) {
      settings.value.pluginShortcuts[existingIndex].shortcut = value
    } else {
      settings.value.pluginShortcuts.push({ pluginId, shortcut: value })
    }

    toast.success('插件快捷键已保存')
    return true
  } catch (error) {
    console.error('保存插件快捷键失败', error)
    toast.error('保存插件快捷键失败')
    return false
  }
}

const removePluginShortcut = async (pluginId: string): Promise<void> => {
  try {
    console.log('移除插件快捷键', pluginId)
    // 清除设置并注销全局快捷键
    await window.api.settings.removePluginShortcut(pluginId)
    settings.value.pluginShortcuts = settings.value.pluginShortcuts.filter(
      (item) => item.pluginId !== pluginId
    )
    toast.success('插件快捷键已清除')
  } catch (error) {
    console.error('移除插件快捷键失败', error)
    toast.error('移除插件快捷键失败')
  }
}

const getPluginShortcut = (pluginId: string): string => {
  // 用于渲染输入框中的当前快捷键
  return settings.value.pluginShortcuts.find((item) => item.pluginId === pluginId)?.shortcut || ''
}

const configuredPluginShortcuts = computed(() => {
  return settings.value.pluginShortcuts.map((item) => ({
    ...item,
    name:
      installedPlugins.value.find((plugin) => plugin.id === item.pluginId)?.metadata?.name ||
      item.pluginId
  }))
})

const availablePlugins = computed(() => {
  const configuredIds = new Set(settings.value.pluginShortcuts.map((item) => item.pluginId))
  return installedPlugins.value.filter((plugin) => !configuredIds.has(plugin.id))
})

const filteredPlugins = computed(() => {
  const query = pluginSearchQuery.value.trim().toLowerCase()
  if (!query) return availablePlugins.value
  return availablePlugins.value.filter((plugin) => {
    const name = plugin.metadata?.name?.toLowerCase() || ''
    const id = plugin.id.toLowerCase()
    return name.includes(query) || id.includes(query)
  })
})

const openPluginShortcutDialog = (): void => {
  showPluginShortcutDialog.value = true
  pluginSearchQuery.value = ''
  selectedPluginId.value = ''
  dialogRecording.value = false
}

const closePluginShortcutDialog = (): void => {
  showPluginShortcutDialog.value = false
  pluginSearchQuery.value = ''
  selectedPluginId.value = ''
  dialogRecording.value = false
  cancelRecording()
}

const startDialogRecording = (): void => {
  if (!selectedPluginId.value) {
    toast.error('请先选择插件')
    return
  }
  dialogRecording.value = true
  startRecordingPlugin(selectedPluginId.value)
// 保存通用设置（开机自启动/最小化到托盘）
const saveGeneralSetting = async <K extends keyof Settings['general']>(
  key: K,
  value: Settings['general'][K]
): Promise<void> => {
  try {
    console.log('保存通用设置', key, value)
    await window.api.settings.update({
      general: {
        [key]: value
      }
    })
    settings.value.general[key] = value
    toast.success('设置已保存')
  } catch (error) {
    console.error('保存通用设置失败', error)
    toast.error('保存通用设置失败')
  }
}

const toggleLaunchAtStartup = async (value: boolean): Promise<void> => {
  await saveGeneralSetting('launchAtStartup', value)
}

const toggleMinimizeToTray = async (value: boolean): Promise<void> => {
  await saveGeneralSetting('minimizeToTray', value)
}

// 开始录制快捷键
const startRecordingGlobal = (key: string): void => {
  if (key !== 'toggleWindow' && key !== 'globalSearch') return
  recordingTarget.value = { type: 'global', key }
  recordedKeys.value = []
}

const startRecordingPlugin = (pluginId: string): void => {
  recordingTarget.value = { type: 'plugin', pluginId }
  recordedKeys.value = []
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent): void => {
  if (!recordingTarget.value) return

  e.preventDefault()
  e.stopPropagation()

  const keys: string[] = []

  // 修饰键
  if (e.metaKey) keys.push('Command')
  if (e.ctrlKey) keys.push('Ctrl')
  if (e.altKey) keys.push('Alt')
  if (e.shiftKey) keys.push('Shift')

  // 主键（排除单独的修饰键）
  const key = e.key
  if (!EXCLUDED_KEYS.includes(key as 'Alt' | 'Shift' | 'Meta' | 'Control')) {
    // 转换特殊键名
    const mappedKey = KEYBOARD_KEY_MAP[key] || key.toUpperCase()
    if (mappedKey) {
      keys.push(mappedKey)
    }
  }

  recordedKeys.value = keys
}

// 处理键盘释放
const handleKeyUp = async (): Promise<void> => {
  if (!recordingTarget.value || recordedKeys.value.length === 0) return

  // 必须有至少一个修饰键和一个主键
  const hasModifier = recordedKeys.value.some((k) =>
    MODIFIER_KEYS.includes(k as 'Command' | 'Ctrl' | 'Alt' | 'Shift')
  )
  const hasMainKey = recordedKeys.value.some(
    (k) => !MODIFIER_KEYS.includes(k as 'Command' | 'Ctrl' | 'Alt' | 'Shift')
  )

  if (hasModifier && hasMainKey) {
    const shortcut = recordedKeys.value.join('+')
    if (recordingTarget.value.type === 'global') {
      await saveShortcut(recordingTarget.value.key, shortcut)
    } else {
      const success = await savePluginShortcut(recordingTarget.value.pluginId, shortcut)
      if (success && dialogRecording.value) {
        closePluginShortcutDialog()
      }
    }
  }

  dialogRecording.value = false
  recordingTarget.value = null
  recordedKeys.value = []
}

// 取消录制
const cancelRecording = (): void => {
  recordingTarget.value = null
  recordedKeys.value = []
}

// 重置设置
const showResetDialog = ref(false)
const resetSettings = async (): Promise<void> => {
  try {
    console.warn('重置所有设置')
    await window.api.settings.reset()
    await loadSettings()
    toast.success('设置已重置')
    showResetDialog.value = false
  } catch (error) {
    console.error('重置设置失败', error)
    toast.error('重置设置失败')
  }
}

// 清除最近访问记录
const clearRecentPlugins = async (): Promise<void> => {
  try {
    console.log('清除最近访问记录')
    await window.api.db.clearRecents()
    toast.success('已清除最近访问记录')
  } catch (error) {
    console.error('清除最近访问记录失败', error)
    toast.error('清除失败')
  }
}

// 检查更新
const checkForUpdatesFromParent = inject<(() => void) | undefined>('checkForUpdates')

const checkForUpdates = async (): Promise<void> => {
  try {
    console.log('手动检查更新')
    if (checkForUpdatesFromParent) {
      checkForUpdatesFromParent()
    } else {
      // 降级方案：直接调用 API
      await window.api.updater.check()
    }
  } catch (error) {
    console.error('检查更新失败', error)
    toast.error('检查更新失败')
  }
}

onMounted(() => {
  loadSettings()
  loadInstalledPlugins()
  loadSystemInfo()

  pluginEventHandler = () => {
    loadSettings()
    loadInstalledPlugins()
  }
  window.addEventListener('plugin-installed', pluginEventHandler)
  window.addEventListener('plugin-uninstalled', pluginEventHandler)
})

onUnmounted(() => {
  if (pluginEventHandler) {
    window.removeEventListener('plugin-installed', pluginEventHandler)
    window.removeEventListener('plugin-uninstalled', pluginEventHandler)
  }
})

const systemInfo = ref({
  platform: navigator.userAgent.includes('Mac')
    ? 'macOS'
    : navigator.userAgent.includes('Win')
      ? 'Windows'
      : 'Linux',
  userAgent: navigator.userAgent,
  language: navigator.language,
  electron: 'N/A',
  node: 'N/A',
  chrome: 'N/A'
})

// 加载系统信息
const loadSystemInfo = async (): Promise<void> => {
  try {
    console.log('加载系统信息')
    const versions = (window as unknown as { versions?: Record<string, string> }).versions
    if (versions) {
      systemInfo.value.electron = versions.electron || 'N/A'
      systemInfo.value.node = versions.node || 'N/A'
      systemInfo.value.chrome = versions.chrome || 'N/A'
    }
  } catch (error) {
    console.error('加载系统信息失败', error)
  }
}

const openExternal = (url: string): void => {
  window.open(url, '_blank')
}

const exportSystemInfo = (): void => {
  const info = {
    app: APP_INFO,
    system: systemInfo.value,
    timestamp: new Date().toISOString()
  }

  const dataStr = JSON.stringify(info, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'unihub-system-info.json'
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 头部 -->
    <div
      class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      <div class="px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">设置</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">管理应用程序设置和偏好</p>
      </div>
    </div>

    <div class="flex-1 flex min-h-0">
      <!-- 侧边栏 -->
      <div
        class="w-48 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      >
        <nav class="p-4 space-y-1">
          <button
            v-for="tab in SETTINGS_TABS"
            :key="tab.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
              activeTab === tab.id
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            @click="activeTab = tab.id"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- 主内容区 -->
      <div class="flex-1 overflow-auto">
        <!-- 通用设置 -->
        <div v-if="activeTab === 'general'" class="p-6 bg-white dark:bg-gray-900">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">通用设置</h2>

            <div class="space-y-6">
              <!-- 启动与托盘 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  启动与托盘
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  管理开机自启动与最小化/关闭行为
                </p>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm text-gray-800 dark:text-gray-200">开机自启动</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        系统启动后自动运行应用
                      </div>
                    </div>
                    <Switch
                      :checked="settings.general.launchAtStartup"
                      @update:checked="toggleLaunchAtStartup"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm text-gray-800 dark:text-gray-200">最小化到托盘</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        点击关闭或最小化时隐藏到系统托盘
                      </div>
                    </div>
                    <Switch
                      :checked="settings.general.minimizeToTray"
                      @update:checked="toggleMinimizeToTray"
                    />
                  </div>
                </div>
              </div>

              <!-- 主题设置 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">外观</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">选择应用程序的主题</p>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  主题切换功能已集成在侧边栏底部，点击月亮/太阳图标即可切换。
                </div>
              </div>

              <!-- 数据管理 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">数据管理</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">管理应用程序数据</p>
                <div class="space-y-3">
                  <button
                    class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                    @click="clearRecentPlugins"
                  >
                    清除最近访问记录
                  </button>
                  <AlertDialog v-model:open="showResetDialog">
                    <AlertDialogTrigger as-child>
                      <button
                        class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors ml-3"
                      >
                        重置所有设置
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认重置设置</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将重置所有设置为默认值，包括快捷键、主题等配置。此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction @click="resetSettings">确认重置</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <!-- 应用更新 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">应用更新</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">检查并安装应用更新</p>
                <button
                  class="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                  @click="checkForUpdates"
                >
                  检查更新
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷键设置 -->
        <div v-if="activeTab === 'shortcuts'" class="p-6 bg-white dark:bg-gray-900">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快捷键设置</h2>

            <div class="space-y-6">
              <!-- 全局快捷键（可自定义） -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  全局快捷键
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  这些快捷键在应用程序未聚焦时也可使用，点击输入框后按下新的快捷键组合即可修改
                </p>

                <div class="space-y-3">
                  <div
                    v-for="(value, key) in settings.shortcuts"
                    :key="key"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ SHORTCUT_LABELS[key] || key }}
                    </span>
                    <div class="flex items-center gap-2">
                      <button
                        :class="[
                          'px-3 py-1.5 min-w-32 text-sm font-mono rounded border transition-colors text-center',
                          recordingTarget?.type === 'global' && recordingTarget.key === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 animate-pulse'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                        ]"
                        @click="startRecordingGlobal(key)"
                        @keydown="handleKeyDown"
                        @keyup="handleKeyUp"
                        @blur="cancelRecording"
                      >
                        {{
                          recordingTarget?.type === 'global' && recordingTarget.key === key
                            ? recordedKeys.length > 0
                              ? recordedKeys.join('+')
                              : '按下快捷键...'
                            : value || '未设置'
                        }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 插件快捷键 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">插件快捷键</h3>
                  <button
                    class="px-2.5 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                    @click="openPluginShortcutDialog"
                  >
                    添加插件快捷键
                  </button>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  手动添加需要配置快捷键的插件，触发时直接打开对应插件
                </p>

                <div v-if="configuredPluginShortcuts.length === 0" class="text-xs text-gray-500">
                  暂无已配置的插件快捷键
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="plugin in configuredPluginShortcuts"
                    :key="plugin.pluginId"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ plugin.name }}
                    </span>
                    <div class="flex items-center gap-2">
                      <button
                        :class="[
                          'px-3 py-1.5 min-w-32 text-sm font-mono rounded border transition-colors text-center',
                          recordingTarget?.type === 'plugin' &&
                          recordingTarget.pluginId === plugin.pluginId
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 animate-pulse'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                        ]"
                        @click="startRecordingPlugin(plugin.pluginId)"
                        @keydown="handleKeyDown"
                        @keyup="handleKeyUp"
                        @blur="cancelRecording"
                      >
                        {{
                          recordingTarget?.type === 'plugin' &&
                          recordingTarget.pluginId === plugin.pluginId
                            ? recordedKeys.length > 0
                              ? recordedKeys.join('+')
                              : '按下快捷键...'
                            : getPluginShortcut(plugin.pluginId) || '未设置'
                        }}
                      </button>
                      <button
                        v-if="getPluginShortcut(plugin.pluginId)"
                        class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        @click="removePluginShortcut(plugin.pluginId)"
                      >
                        清除
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Dialog
                v-model:open="showPluginShortcutDialog"
                @update:open="(value) => (value ? null : closePluginShortcutDialog())"
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加插件快捷键</DialogTitle>
                    <DialogDescription>选择一个插件并录制全局快捷键</DialogDescription>
                  </DialogHeader>
                  <div class="space-y-3">
                    <Input v-model="pluginSearchQuery" placeholder="搜索插件名称或 ID" />
                    <div
                      class="max-h-56 overflow-auto rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <div v-if="filteredPlugins.length === 0" class="p-3 text-xs text-gray-500">
                        暂无可添加的插件
                      </div>
                      <label
                        v-for="plugin in filteredPlugins"
                        :key="plugin.id"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <input
                          v-model="selectedPluginId"
                          type="radio"
                          name="plugin-shortcut"
                          :value="plugin.id"
                        />
                        <span class="truncate">{{ plugin.metadata.name || plugin.id }}</span>
                        <span class="text-xs text-gray-400">{{ plugin.id }}</span>
                      </label>
                    </div>
                    <button
                      :class="[
                        'px-3 py-1.5 text-sm font-mono rounded border transition-colors text-center',
                        recordingTarget?.type === 'plugin' &&
                        recordingTarget.pluginId === selectedPluginId
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                      ]"
                      @click="startDialogRecording"
                      @keydown="handleKeyDown"
                      @keyup="handleKeyUp"
                      @blur="cancelRecording"
                    >
                      {{
                        recordingTarget?.type === 'plugin' &&
                        recordingTarget.pluginId === selectedPluginId
                          ? recordedKeys.length > 0
                            ? recordedKeys.join('+')
                            : '按下快捷键...'
                          : '录制快捷键'
                      }}
                    </button>
                  </div>
                  <DialogFooter>
                    <button
                      class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                      @click="closePluginShortcutDialog"
                    >
                      关闭
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <!-- 应用内快捷键（不可修改） -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  应用内快捷键
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  这些快捷键仅在应用程序聚焦时可用
                </p>

                <div class="space-y-2">
                  <div
                    v-for="item in BUILTIN_SHORTCUTS"
                    :key="item.name"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.name }}</span>
                    <Kbd>{{ item.shortcut }}</Kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于页面 -->
        <div v-if="activeTab === 'about'" class="p-6 bg-white dark:bg-gray-900">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">关于 UniHub</h2>

            <!-- 应用信息 -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                >
                  <svg
                    class="w-9 h-9 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {{ APP_INFO.name }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ APP_INFO.description }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    版本 {{ APP_INFO.version }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">作者：</span>
                  <span class="text-gray-900 dark:text-gray-100">{{ APP_INFO.author }}</span>
                </div>
                <div class="flex items-center justify-end">
                  <div class="flex gap-2">
                    <button
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors text-xs font-medium"
                      title="访问 GitHub 仓库"
                      @click="openExternal(APP_INFO.repository)"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                      GitHub
                    </button>
                    <button
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
                      title="反馈问题"
                      @click="openExternal(APP_INFO.issues)"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      反馈
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 系统信息 -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">系统信息</h3>
                <button
                  class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  @click="exportSystemInfo"
                >
                  导出信息
                </button>
              </div>

              <div class="space-y-3 text-sm">
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">平台</span>
                  <span class="text-gray-900 dark:text-gray-100 font-mono">{{
                    systemInfo.platform
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">语言</span>
                  <span class="text-gray-900 dark:text-gray-100 font-mono">{{
                    systemInfo.language
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Electron</span>
                  <span class="text-gray-900 dark:text-gray-100 font-mono">{{
                    systemInfo.electron
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Node.js</span>
                  <span class="text-gray-900 dark:text-gray-100 font-mono">{{
                    systemInfo.node
                  }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600 dark:text-gray-400">Chrome</span>
                  <span class="text-gray-900 dark:text-gray-100 font-mono">{{
                    systemInfo.chrome
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 版权信息 -->
            <div class="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
              <p>© 2024 UniHub Team. All rights reserved.</p>
              <p class="mt-1">Built with ❤️ using Electron + Vue 3 + TypeScript</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
