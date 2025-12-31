<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('general')

const tabs = [
  {
    id: 'general',
    name: '通用',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
  },
  { id: 'about', name: '关于', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
]

// 从 package.json 获取版本信息（这里先写死，实际项目中可以通过构建时注入）
const appInfo = {
  name: 'UniHub',
  version: '1.0.0',
  description: '开发者的通用工具集',
  author: 'UniHub Team',
  license: 'MIT',
  repository: 'https://github.com/unihub/unihub'
}

const systemInfo = {
  platform: navigator.platform,
  userAgent: navigator.userAgent,
  language: navigator.language,
  electron: process.versions?.electron || 'N/A',
  node: process.versions?.node || 'N/A',
  chrome: process.versions?.chrome || 'N/A'
}

const openExternal = (url: string): void => {
  if (window.electron?.shell) {
    window.electron.shell.openExternal(url)
  } else {
    window.open(url, '_blank')
  }
}

// Remove unused function
// const copyToClipboard = async (text: string): Promise<void> => {
//   try {
//     await navigator.clipboard.writeText(text)
//     console.log('已复制到剪贴板')
//   } catch (error) {
//     console.error('复制失败:', error)
//   }
// }

const exportSystemInfo = (): void => {
  const info = {
    app: appInfo,
    system: systemInfo,
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
        class="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
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
      <div class="flex-1 overflow-auto">
        <!-- 通用设置 -->
        <div v-if="activeTab === 'general'" class="p-6">
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

              <!-- 快捷键 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">快捷键</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">应用程序快捷键</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700 dark:text-gray-300">关闭标签</span>
                    <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono"
                      >⌘W / Ctrl+W</kbd
                    >
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700 dark:text-gray-300">切换侧边栏</span>
                    <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono"
                      >⌘B / Ctrl+B</kbd
                    >
                  </div>
                </div>
              </div>

              <!-- 数据管理 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">数据管理</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">管理应用程序数据</p>
                <div class="space-y-3">
                  <button
                    class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                    @click="localStorage.removeItem('recentPlugins')"
                  >
                    清除最近访问记录
                  </button>
                  <button
                    class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                    @click="localStorage.clear()"
                  >
                    清除所有本地数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于页面 -->
        <div v-if="activeTab === 'about'" class="p-6">
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
