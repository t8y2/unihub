<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { pluginRegistry } from '../plugins'
import { pinyin } from 'pinyin-pro'

const emit = defineEmits<{
  openPlugin: [pluginId: string]
  close: []
}>()

const props = defineProps<{
  visible: boolean
}>()

const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()

interface SearchResult {
  id: string
  name: string
  description: string
  icon: string
  keywords: string[]
  category: string
  score: number
}

// 拼音缓存（性能优化）
const pinyinCache = new Map<string, string>()

/**
 * 获取文本的拼音（带缓存）
 */
function getPinyin(text: string): string {
  if (pinyinCache.has(text)) {
    return pinyinCache.get(text)!
  }
  
  // 获取拼音（不带音调，连续输出）
  const py = pinyin(text, { toneType: 'none', type: 'array' }).join('')
  pinyinCache.set(text, py)
  return py
}

/**
 * 获取文本的拼音首字母（带缓存）
 */
function getPinyinInitials(text: string): string {
  const cacheKey = `initials:${text}`
  if (pinyinCache.has(cacheKey)) {
    return pinyinCache.get(cacheKey)!
  }
  
  // 获取拼音首字母
  const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('')
  pinyinCache.set(cacheKey, initials)
  return initials
}

/**
 * 检查是否匹配（支持拼音）
 */
function matchesSearch(text: string, searchTerm: string): boolean {
  const lowerText = text.toLowerCase()
  const lowerSearch = searchTerm.toLowerCase()
  
  // 1. 直接匹配
  if (lowerText.includes(lowerSearch)) {
    return true
  }
  
  // 2. 拼音全拼匹配
  const py = getPinyin(text).toLowerCase()
  if (py.includes(lowerSearch)) {
    return true
  }
  
  // 3. 拼音首字母匹配
  const initials = getPinyinInitials(text).toLowerCase()
  if (initials.includes(lowerSearch)) {
    return true
  }
  
  return false
}

// 搜索缓存（性能优化）
const searchCache = new Map<string, SearchResult[]>()
const MAX_CACHE_SIZE = 50

// 搜索结果（带缓存和拼音搜索）
const searchResults = computed(() => {
  const searchTerm = query.value.trim()
  
  if (!searchTerm) {
    // 无搜索词时，显示所有启用的插件
    const plugins = pluginRegistry.getEnabled()
    return plugins.map((plugin) => ({
      id: plugin.metadata.id,
      name: plugin.metadata.name,
      description: plugin.metadata.description,
      icon: plugin.metadata.icon,
      keywords: plugin.metadata.keywords || [],
      category: plugin.metadata.category,
      score: 0
    }))
  }

  // 检查缓存
  if (searchCache.has(searchTerm)) {
    return searchCache.get(searchTerm)!
  }

  const results: SearchResult[] = []
  const plugins = pluginRegistry.getEnabled()

  // 性能优化：使用 for 循环代替 forEach
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    let score = 0

    // 匹配插件名称（支持拼音）
    if (matchesSearch(plugin.metadata.name, searchTerm)) {
      score += 100
    }

    // 匹配描述（支持拼音）
    if (matchesSearch(plugin.metadata.description, searchTerm)) {
      score += 50
    }

    // 匹配关键词（支持拼音）
    const keywords = plugin.metadata.keywords || []
    for (let j = 0; j < keywords.length; j++) {
      if (matchesSearch(keywords[j], searchTerm)) {
        score += 80
        break // 只需匹配一次
      }
    }

    // 匹配分类（支持拼音）
    if (matchesSearch(plugin.metadata.category, searchTerm)) {
      score += 30
    }

    if (score > 0) {
      results.push({
        id: plugin.metadata.id,
        name: plugin.metadata.name,
        description: plugin.metadata.description,
        icon: plugin.metadata.icon,
        keywords: keywords,
        category: plugin.metadata.category,
        score
      })
    }
  }

  // 按分数排序
  results.sort((a, b) => b.score - a.score)

  // 缓存结果（限制缓存大小）
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) {
      searchCache.delete(firstKey)
    }
  }
  searchCache.set(searchTerm, results)

  return results
})

// 监听 visible 变化，自动聚焦
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      setTimeout(() => {
        searchInput.value?.focus()
      }, 100)
      selectedIndex.value = 0
    } else {
      query.value = ''
    }
  }
)

// 监听搜索结果变化，重置选中索引
watch(searchResults, () => {
  selectedIndex.value = 0
})

// 键盘导航
const handleKeyDown = (e: KeyboardEvent): void => {
  if (!props.visible) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (searchResults.value[selectedIndex.value]) {
        selectResult(searchResults.value[selectedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
  }
}

const selectResult = (result: SearchResult): void => {
  emit('openPlugin', result.id)
  emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 分类名称映射
const categoryNames: Record<string, string> = {
  formatter: '格式化',
  tool: '工具',
  encoder: '编码',
  custom: '自定义'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
          @click.stop
        >
          <!-- 搜索框 -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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
            <kbd
              class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
            >
              ESC
            </kbd>
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
              :class="[
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
              @click="selectResult(result)"
              @mouseenter="selectedIndex = index"
            >
              <!-- 图标 -->
              <div
                class="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0"
              >
                <svg
                  v-if="result.icon.startsWith('M')"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="result.icon"
                  />
                </svg>
                <span v-else class="text-xl">{{ result.icon }}</span>
              </div>

              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ result.name }}
                  </h3>
                  <span
                    class="px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    {{ categoryNames[result.category] || result.category }}
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
                <kbd
                  class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  ↵
                </kbd>
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div
            class="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">↑</kbd>
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">↓</kbd>
                导航
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">↵</kbd>
                选择
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">ESC</kbd>
                关闭
              </span>
            </div>
            <span>{{ searchResults.length }} 个结果</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
