<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { pluginRegistry } from '../plugins'
import {
  unifiedSearchEngine,
  type UnifiedSearchResult,
  type LocalApp
} from '@/utils/unified-search'
import { CATEGORY_NAMES } from '@/constants'
import { Kbd } from '@/components/ui/kbd'
import { PluginIcon } from '@/components/ui/plugin-icon'
import LazyAppIcon from './LazyAppIcon.vue'

const emit = defineEmits<{
  openPlugin: [pluginId: string]
  openApp: [appPath: string]
  close: []
}>()

const props = defineProps<{
  visible: boolean
  standalone?: boolean // 是否为独立窗口模式
}>()

const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()
const resultRefs = ref<HTMLElement[]>([])
const isScrolling = ref(false)
const localApps = ref<LocalApp[]>([])
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

// 加载本地应用列表（混合策略：快速加载 + 渐进式图标预加载）
const loadApps = async (): Promise<void> => {
  try {
    // 第一步：快速加载应用列表（无图标）
    const quickResult = await window.api.apps.listQuick()
    if (quickResult.success && quickResult.data) {
      // 转换为带有空图标的格式，兼容现有接口
      const appsWithEmptyIcons = quickResult.data.map((app) => ({
        ...app,
        icon: undefined
      }))

      localApps.value = appsWithEmptyIcons
      unifiedSearchEngine.buildAppIndex(appsWithEmptyIcons)
      console.log(`[GlobalSearch] 快速加载 ${quickResult.data.length} 个应用（无图标）`)

      // 第二步：异步预加载前20个应用的图标（用户最可能搜索的）
      const topAppPaths = quickResult.data.slice(0, 20).map((app) => app.path)
      if (topAppPaths.length > 0) {
        setTimeout(async () => {
          try {
            const iconResult = await window.api.apps.preloadIcons(topAppPaths)
            if (iconResult.success && iconResult.data) {
              console.log(`[GlobalSearch] 预加载了 ${Object.keys(iconResult.data).length} 个图标`)
            }
          } catch (error) {
            console.warn('[GlobalSearch] 预加载图标失败:', error)
          }
        }, 100) // 100ms 后开始预加载，不阻塞界面
      }
    }
  } catch (error) {
    console.error('[GlobalSearch] 加载应用列表失败:', error)
    // 降级到完整加载
    try {
      const fullResult = await window.api.apps.list()
      if (fullResult.success && fullResult.data) {
        localApps.value = fullResult.data
        unifiedSearchEngine.buildAppIndex(fullResult.data)
        console.log(`[GlobalSearch] 降级到完整加载 ${fullResult.data.length} 个应用`)
      }
    } catch (fallbackError) {
      console.error('[GlobalSearch] 降级加载也失败:', fallbackError)
    }
  }
}

// 搜索结果（使用统一搜索引擎）
const searchResults = computed(() => {
  const plugins = pluginRegistry.getEnabled()
  // 构建插件索引
  unifiedSearchEngine.buildPluginIndex(plugins)
  // 统一搜索
  return unifiedSearchEngine.search(query.value, plugins)
})

// 监听 visible 变化，自动聚焦
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // 使用 nextTick 确保 DOM 已更新
      nextTick(() => {
        // 强制聚焦函数
        const focusInput = (): void => {
          if (searchInput.value) {
            // 先让输入框失去焦点，再重新获得焦点（强制刷新）
            searchInput.value.blur()
            setTimeout(() => {
              if (searchInput.value) {
                searchInput.value.focus()
                console.log('[GlobalSearch] 输入框已聚焦')
              }
            }, 10)
          } else {
            console.warn('[GlobalSearch] 输入框未找到')
          }
        }

        // 立即聚焦
        focusInput()

        // 多次尝试聚焦，确保成功（特别是在插件加载时）
        setTimeout(focusInput, 50)
        setTimeout(focusInput, 150)
        setTimeout(focusInput, 300)
      })
      selectedIndex.value = 0
      resultRefs.value = []
    } else {
      query.value = ''
      resultRefs.value = []
      selectedIndex.value = 0
    }
  },
  { immediate: true } // 立即执行一次
)

// 监听搜索结果变化，重置选中索引
watch(searchResults, () => {
  selectedIndex.value = 0
})

// 监听选中索引变化，滚动到可见区域
watch(selectedIndex, (newIndex, oldIndex) => {
  const element = resultRefs.value[newIndex]
  if (element) {
    // 标记正在滚动
    isScrolling.value = true

    // 清除之前的定时器
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    // 根据滚动方向决定对齐方式
    // 往下滚（newIndex > oldIndex）：对齐到底部
    // 往上滚（newIndex < oldIndex）：对齐到顶部
    const block = newIndex > oldIndex ? 'end' : 'start'
    element.scrollIntoView({ block, behavior: 'auto' })

    // 滚动结束后恢复鼠标悬停
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false
    }, 100)
  }
})

// 键盘导航
const handleKeyDown = (e: KeyboardEvent): void => {
  if (!props.visible) return

  // 检查是否是我们需要处理的按键
  const isHandledKey = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)
  if (!isHandledKey) return

  // 阻止默认行为和事件冒泡
  e.preventDefault()
  e.stopPropagation()

  switch (e.key) {
    case 'ArrowDown':
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
      break
    case 'ArrowUp':
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      if (searchResults.value[selectedIndex.value]) {
        selectResult(searchResults.value[selectedIndex.value])
      }
      break
    case 'Escape':
      // 独立模式：直接关闭搜索窗口
      // 浮层模式：触发 close 事件
      if (props.standalone) {
        window.api.search.close()
      } else {
        emit('close')
      }
      break
  }
}

const selectResult = (result: UnifiedSearchResult): void => {
  if (result.type === 'plugin') {
    emit('openPlugin', result.id)
  } else if (result.type === 'app' && result.path) {
    emit('openApp', result.path)
  }
  emit('close')
}

const handleMouseEnter = (index: number): void => {
  // 只有在非滚动状态下才响应鼠标悬停
  if (!isScrolling.value) {
    selectedIndex.value = index
  }
}

onMounted(() => {
  // 使用 capture 阶段捕获事件，确保优先处理
  window.addEventListener('keydown', handleKeyDown, true)
  // 加载本地应用
  loadApps()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown, true)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<template>
  <!-- 浮层模式 -->
  <Teleport v-if="!standalone" to="body">
    <Transition name="search-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
        @keydown.esc.stop="emit('close')"
      >
        <div
          class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
          tabindex="-1"
          @click.stop
          @keydown.esc.stop="emit('close')"
        >
          <!-- 搜索框 -->
          <div
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <svg
              class="w-5 h-5 text-gray-400 flex-shrink-0"
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
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="搜索插件（支持拼音）..."
              class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              @keydown.esc.stop="emit('close')"
            />
            <Kbd>ESC</Kbd>
          </div>

          <!-- 搜索结果 -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="searchResults.length === 0" class="px-4 py-8 text-center">
              <svg
                class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
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

            <div
              v-for="(result, index) in searchResults"
              :key="result.id"
              :ref="
                (el) => {
                  if (el) resultRefs[index] = el as HTMLElement
                }
              "
              :class="[
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
              @click="selectResult(result)"
              @mouseenter="handleMouseEnter(index)"
            >
              <!-- 图标 -->
              <template v-if="result.type === 'app' && result.path">
                <div class="flex-shrink-0">
                  <!-- 懒加载图标 -->
                  <LazyAppIcon :app-path="result.path" :app-name="result.name" />
                </div>
              </template>
              <PluginIcon v-else :icon="result.icon" size="md" />

              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ result.name }}
                  </h3>
                  <span
                    v-if="result.type === 'plugin'"
                    class="px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    {{ CATEGORY_NAMES[result.category] || result.category }}
                  </span>
                  <span
                    v-else-if="result.type === 'app'"
                    class="px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded"
                  >
                    应用
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {{ result.description }}
                </p>
                <div v-if="result.keywords.length > 0" class="flex gap-1 mt-1 flex-wrap">
                  <span
                    v-for="keyword in result.keywords.slice(0, 3)"
                    :key="keyword"
                    class="px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>

              <!-- 快捷键提示 -->
              <div v-if="index === selectedIndex" class="flex-shrink-0">
                <Kbd>↵</Kbd>
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div
            class="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                导航
              </span>
              <span class="flex items-center gap-1">
                <Kbd>↵</Kbd>
                选择
              </span>
              <span class="flex items-center gap-1">
                <Kbd>ESC</Kbd>
                关闭
              </span>
            </div>
            <span>{{ searchResults.length }} 个结果</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 独立窗口模式 -->
  <div v-else-if="visible" class="w-full h-full flex flex-col bg-white dark:bg-gray-800">
    <!-- 搜索框 - 固定 -->
    <div
      class="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <svg
        class="w-5 h-5 text-gray-400 flex-shrink-0"
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
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        placeholder="搜索插件（支持拼音）..."
        class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
      <Kbd>ESC</Kbd>
    </div>

    <!-- 搜索结果 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="searchResults.length === 0" class="px-4 py-8 text-center">
        <svg
          class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
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

      <div
        v-for="(result, index) in searchResults"
        :key="result.id"
        :ref="
          (el) => {
            if (el) resultRefs[index] = el as HTMLElement
          }
        "
        :class="[
          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
          index === selectedIndex
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        ]"
        @click="selectResult(result)"
        @mouseenter="handleMouseEnter(index)"
      >
        <!-- 图标 -->
        <template v-if="result.type === 'app' && result.path">
          <div class="flex-shrink-0">
            <!-- 懒加载图标 -->
            <LazyAppIcon :app-path="result.path" :app-name="result.name" />
          </div>
        </template>
        <PluginIcon v-else :icon="result.icon" size="md" />

        <!-- 信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ result.name }}
            </h3>
            <span
              v-if="result.type === 'plugin'"
              class="px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
            >
              {{ CATEGORY_NAMES[result.category] || result.category }}
            </span>
            <span
              v-else-if="result.type === 'app'"
              class="px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded"
            >
              应用
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {{ result.description }}
          </p>
          <div v-if="result.keywords.length > 0" class="flex gap-1 mt-1 flex-wrap">
            <span
              v-for="keyword in result.keywords.slice(0, 3)"
              :key="keyword"
              class="px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded"
            >
              {{ keyword }}
            </span>
          </div>
        </div>

        <!-- 快捷键提示 -->
        <div v-if="index === selectedIndex" class="flex-shrink-0">
          <Kbd>↵</Kbd>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div
      class="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          导航
        </span>
        <span class="flex items-center gap-1">
          <Kbd>↵</Kbd>
          选择
        </span>
        <span class="flex items-center gap-1">
          <Kbd>ESC</Kbd>
          关闭
        </span>
      </div>
      <span>{{ searchResults.length }} 个结果</span>
    </div>
  </div>
</template>

<style scoped>
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-active > div,
.search-fade-leave-active > div {
  transition: transform 0.2s ease;
}

.search-fade-enter-from > div {
  transform: scale(0.95) translateY(-20px);
}

.search-fade-leave-to > div {
  transform: scale(0.95) translateY(-20px);
}
</style>
