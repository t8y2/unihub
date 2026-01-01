<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { log } from '@/utils/logger'

const activeTab = ref('general')

const tabs = [
  {
    id: 'general',
    name: '通用',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
  },
  {
    id: 'shortcuts',
    name: '快捷键',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  { id: 'about', name: '关于', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
]

// 设置数据
interface Settings {
  shortcuts: {
    toggleWindow: string
    globalSearch: string
  }
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

// 正在录制的快捷键
const recordingShortcut = ref<string | null>(null)
const recordedKeys = ref<string[]>([])

// 加载设置
const loadSettings = async (): Promise<void> => {
  try {
    log.info('加载设置')
    const data = await window.api.settings.getAll()
    settings.value = data
    log.debug('设置加载成功', data)
  } catch (error) {
    log.error('加载设置失败', error)
  }
}

// 保存快捷键
const saveShortcut = async (key: 'toggleWindow' | 'globalSearch', value: string): Promise<void> => {
  try {
    log.info('保存快捷键', { key, value })
    await window.api.settings.setShortcut(key, value)
    settings.value.shortcuts[key] = value
    toast.success('快捷键已保存')
  } catch (error) {
    log.error('保存快捷键失败', error)
    toast.error('保存快捷键失败')
  }
}

// 开始录制快捷键
const startRecording = (key: string): void => {
  recordingShortcut.value = key
  recordedKeys.value = []
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent): void => {
  if (!recordingShortcut.value) return

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
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
    // 转换特殊键名
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right'
    }
    keys.push(keyMap[key] || key.toUpperCase())
  }

  recordedKeys.value = keys
}

// 处理键盘释放
const handleKeyUp = async (): Promise<void> => {
  if (!recordingShortcut.value || recordedKeys.value.length === 0) return

  // 必须有至少一个修饰键和一个主键
  const modifiers = ['Command', 'Ctrl', 'Alt', 'Shift']
  const hasModifier = recordedKeys.value.some((k) => modifiers.includes(k))
  const hasMainKey = recordedKeys.value.some((k) => !modifiers.includes(k))

  if (hasModifier && hasMainKey) {
    const shortcut = recordedKeys.value.join('+')
    await saveShortcut(recordingShortcut.value as 'toggleWindow' | 'globalSearch', shortcut)
  }

  recordingShortcut.value = null
  recordedKeys.value = []
}

// 取消录制
const cancelRecording = (): void => {
  recordingShortcut.value = null
  recordedKeys.value = []
}

// 重置设置
const resetSettings = async (): Promise<void> => {
  if (confirm('确定要重置所有设置吗？')) {
    try {
      log.warn('重置所有设置')
      await window.api.settings.reset()
      await loadSettings()
      toast.success('设置已重置')
    } catch (error) {
      log.error('重置设置失败', error)
      toast.error('重置设置失败')
    }
  }
}

// 清除最近访问记录
const clearRecentPlugins = async (): Promise<void> => {
  try {
    log.info('清除最近访问记录')
    await window.api.db.clearRecents()
    toast.success('已清除最近访问记录')
  } catch (error) {
    log.error('清除最近访问记录失败', error)
    toast.error('清除失败')
  }
}

onMounted(() => {
  loadSettings()
  loadSystemInfo()
})

// 从 package.json 获取版本信息
const appInfo = {
  name: 'UniHub',
  version: '1.0.0',
  description: '开发者的通用工具集',
  author: 'UniHub Team',
  license: 'MIT',
  repository: 'https://github.com/unihub/unihub'
}

const systemInfo = ref({
  platform: navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Win') ? 'Windows' : 'Linux',
  userAgent: navigator.userAgent,
  language: navigator.language,
  electron: 'N/A',
  node: 'N/A',
  chrome: 'N/A'
})

// 加载系统信息
const loadSystemInfo = async (): Promise<void> => {
  try {
    log.debug('加载系统信息')
    const versions = (window as unknown as { versions?: Record<string, string> }).versions
    if (versions) {
      systemInfo.value.electron = versions.electron || 'N/A'
      systemInfo.value.node = versions.node || 'N/A'
      systemInfo.value.chrome = versions.chrome || 'N/A'
    }
  } catch (error) {
    log.error('加载系统信息失败', error)
  }
}

const openExternal = (url: string): void => {
  window.open(url, '_blank')
}

const exportSystemInfo = (): void => {
  const info = {
    app: appInfo,
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

// 快捷键显示名称
const shortcutLabels: Record<string, string> = {
  toggleWindow: '显示/隐藏窗口',
  globalSearch: '全局搜索'
}

// 内置快捷键（不可修改）
const builtinShortcuts = [
  { name: '关闭标签', shortcut: '⌘W / Ctrl+W' },
  { name: '新建标签', shortcut: '⌘N / Ctrl+N' },
  { name: '切换侧边栏', shortcut: '⌘B / Ctrl+B' },
  { name: '打开搜索', shortcut: '⌘K / Ctrl+K' }
]
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
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
            v-for="tab in tabs"
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
      <div class="flex-1 overflow-auto bg-white dark:bg-gray-900">
        <!-- 通用设置 -->
        <div v-if="activeTab === 'general'" class="p-6 min-h-full">
          <div class="max-w-2xl">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">通用设置</h2>

            <div class="space-y-6">
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
                  <button
                    class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors ml-3"
                    @click="resetSettings"
                  >
                    重置所有设置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷键设置 -->
        <div v-if="activeTab === 'shortcuts'" class="p-6 min-h-full">
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
                      {{ shortcutLabels[key] || key }}
                    </span>
                    <div class="flex items-center gap-2">
                      <button
                        :class="[
                          'px-3 py-1.5 min-w-32 text-sm font-mono rounded border transition-colors text-center',
                          recordingShortcut === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 animate-pulse'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                        ]"
                        @click="startRecording(key)"
                        @keydown="handleKeyDown"
                        @keyup="handleKeyUp"
                        @blur="cancelRecording"
                      >
                        {{
                          recordingShortcut === key
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
                    v-for="item in builtinShortcuts"
                    :key="item.name"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.name }}</span>
                    <kbd
                      class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300"
                    >
                      {{ item.shortcut }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于页面 -->
        <div v-if="activeTab === 'about'" class="p-6 min-h-full">
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
                    {{ appInfo.name }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ appInfo.description }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    版本 {{ appInfo.version }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">作者：</span>
                  <span class="text-gray-900 dark:text-gray-100">{{ appInfo.author }}</span>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">许可证：</span>
                  <span class="text-gray-900 dark:text-gray-100">{{ appInfo.license }}</span>
                </div>
              </div>

              <div class="flex gap-3 mt-4">
                <button
                  class="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors text-sm font-medium"
                  @click="openExternal(appInfo.repository)"
                >
                  GitHub 仓库
                </button>
                <button
                  class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  @click="openExternal('https://github.com/unihub/unihub/issues')"
                >
                  反馈问题
                </button>
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
