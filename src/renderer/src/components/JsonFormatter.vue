<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useClipboard } from '@/composables/useClipboard'

const { copy } = useClipboard()

// Note: invoke is not available in this context, Rust backend disabled
// const { invoke } = window.electron || {}

// 注册 JSON 语言
hljs.registerLanguage('json', json)

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)
const escapeUnicode = ref(false)
const sortKeys = ref(false)
const collapsed = ref(false)
const useRustBackend = ref(false) // Electron 中不使用 Rust 后端
const wordWrap = ref(false)

// 1MB 阈值
const RUST_THRESHOLD = 1024 * 1024

// 高亮输出的 JSON
const highlightedOutput = computed(() => {
  if (!output.value) return ''
  try {
    return hljs.highlight(output.value, { language: 'json' }).value
  } catch {
    return output.value
  }
})

// 检查是否应该使用 Rust 后端
const shouldUseRust = (text: string): boolean => {
  const size = new Blob([text]).size
  return size > RUST_THRESHOLD
}

// 使用 Rust 后端格式化 (currently disabled)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatWithRust = async (_text: string, _indentSize: number | null): Promise<void> => {
  try {
    // Rust backend not available in this context
    error.value = 'Rust backend not available'
    /*
    const result = await invoke<{ success: boolean; output?: string; error?: string }>(
      'format_json',
      {
        input: text,
        options: {
          indent: indentSize,
          escape_unicode: escapeUnicode.value,
          sort_keys: sortKeys.value
        }
      }
    )

    if (result.success && result.output) {
      output.value = result.output
      error.value = ''
      useRustBackend.value = true
    } else {
      error.value = result.error || '格式化失败'
    }
    */
  } catch (e) {
    error.value = `Rust 后端错误: ${e instanceof Error ? e.message : String(e)}`
  }
}

// JSON 转换函数（前端）
const stringifyJson = (obj: unknown, space?: number): string => {
  if (sortKeys.value) {
    // 递归排序对象键
    const sortObject = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(sortObject)
      } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
          .sort()
          .reduce((result: Record<string, unknown>, key) => {
            result[key] = sortObject((obj as Record<string, unknown>)[key])
            return result
          }, {})
      }
      return obj
    }
    obj = sortObject(obj)
  }

  let result = space !== undefined ? JSON.stringify(obj, null, space) : JSON.stringify(obj)

  // 如果不转义 Unicode，将 \uXXXX 转换回原字符
  if (!escapeUnicode.value) {
    result = result.replace(/\\u([\d\w]{4})/gi, (_match, grp) => {
      return String.fromCharCode(parseInt(grp, 16))
    })
  }

  return result
}

// 监听输入变化，实时格式化
watch([input, indent, escapeUnicode, sortKeys], async () => {
  if (!input.value.trim()) {
    output.value = ''
    error.value = ''
    useRustBackend.value = false
    return
  }

  // 检查是否使用 Rust 后端
  if (shouldUseRust(input.value)) {
    await formatWithRust(input.value, indent.value)
    return
  }

  // 前端解析
  try {
    const parsed = JSON.parse(input.value)
    output.value = stringifyJson(parsed, indent.value)
    error.value = ''
    useRustBackend.value = false
  } catch {
    // 输入时如果 JSON 不完整，不显示错误，只在手动操作时显示
    error.value = ''
    useRustBackend.value = false
  }
})

const formatJson = async (): Promise<void> => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 JSON 内容'
      return
    }

    // 使用 Rust 后端处理大文件
    if (shouldUseRust(input.value)) {
      await formatWithRust(input.value, indent.value)
      return
    }

    // 前端处理小文件
    const parsed = JSON.parse(input.value)
    output.value = stringifyJson(parsed, indent.value)
    useRustBackend.value = false
  } catch (e) {
    error.value = `格式化失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const compressJson = async (): Promise<void> => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 JSON 内容'
      return
    }

    // 使用 Rust 后端处理大文件
    if (shouldUseRust(input.value)) {
      await formatWithRust(input.value, null)
      return
    }

    // 前端处理小文件
    const parsed = JSON.parse(input.value)
    output.value = stringifyJson(parsed)
    useRustBackend.value = false
  } catch (e) {
    error.value = `压缩失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const expandAll = async (): Promise<void> => {
  collapsed.value = false
  if (input.value.trim()) {
    await formatJson()
  }
}

const collapseAll = (): void => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 JSON 内容'
      return
    }
    const parsed = JSON.parse(input.value)
    // 创建一个只显示第一层的版本
    const preview = JSON.stringify(
      parsed,
      (key, value: unknown) => {
        if (key && typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            return `[${value.length} items]`
          }
          return `{${Object.keys(value).length} keys}`
        }
        return value
      },
      indent.value
    )
    output.value = preview
    collapsed.value = true
  } catch (e) {
    error.value = `折叠失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const clearInput = (): void => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const handlePaste = (event: ClipboardEvent): void => {
  // 获取粘贴的文本
  const pastedText = event.clipboardData?.getData('text')
  if (!pastedText) return

  // 阻止默认粘贴行为
  event.preventDefault()

  // 设置输入值
  input.value = pastedText

  // 延迟一下自动格式化，让 UI 更新
  setTimeout(() => {
    try {
      const parsed = JSON.parse(pastedText)
      output.value = JSON.stringify(parsed, null, indent.value)
      error.value = ''
    } catch (e) {
      // 如果解析失败，只显示错误但不清空输入
      error.value = `自动格式化失败: ${e instanceof Error ? e.message : String(e)}`
    }
  }, 10)
}

const copyToClipboard = async (): Promise<void> => {
  await copy(output.value)
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <Button size="sm" @click="formatJson">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        格式化
      </Button>

      <Button size="sm" variant="secondary" @click="compressJson">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        压缩
      </Button>

      <Button size="sm" variant="outline" @click="expandAll">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        展开
      </Button>

      <Button size="sm" variant="outline" @click="collapseAll">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        折叠
      </Button>

      <Button size="sm" variant="ghost" @click="clearInput">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        清空
      </Button>

      <div class="ml-auto flex items-center gap-4">
        <Label class="flex items-center gap-2 text-sm text-gray-600 font-normal cursor-pointer">
          <Checkbox v-model:checked="wordWrap" />
          自动换行
        </Label>

        <Label class="flex items-center gap-2 text-sm text-gray-600 font-normal cursor-pointer">
          <Checkbox v-model:checked="escapeUnicode" />
          转义 Unicode
        </Label>

        <Label class="flex items-center gap-2 text-sm text-gray-600 font-normal cursor-pointer">
          <Checkbox v-model:checked="sortKeys" />
          排序键名
        </Label>

        <div class="flex items-center gap-2">
          <Label class="text-sm text-gray-600 dark:text-gray-400">缩进:</Label>
          <Input v-model.number="indent" type="number" min="2" max="8" class="w-16 h-8" />
        </div>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="flex-1 flex min-h-0 overflow-hidden">
      <!-- 输入区 -->
      <div class="flex-1 flex flex-col border-r border-gray-200 min-w-0">
        <div
          class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0"
        >
          <span
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
            >输入</span
          >
        </div>
        <div class="flex-1 overflow-auto min-h-0">
          <textarea
            v-model="input"
            placeholder="粘贴或输入 JSON 代码..."
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
            @paste="handlePaste"
          />
        </div>
      </div>

      <!-- 输出区 -->
      <div class="flex-1 flex flex-col min-w-0">
        <div
          class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between flex-shrink-0"
        >
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
              >输出</span
            >
            <span
              v-if="useRustBackend"
              class="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded font-medium"
            >
              Rust 加速
            </span>
          </div>
          <Button
            v-if="output"
            size="sm"
            class="flex items-center gap-1.5"
            @click="copyToClipboard"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            复制
          </Button>
        </div>
        <div
          class="flex-1 overflow-auto bg-[#0d1117] min-h-0 scrollbar-hide"
          :class="{ 'overflow-x-auto': !wordWrap }"
        >
          <pre
            v-if="output"
            class="p-4 text-sm"
            :class="wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'"
          ><code class="hljs" v-html="highlightedOutput"></code></pre>
          <div v-else class="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
            格式化结果...
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="h-12 bg-red-50 border-t border-red-200 flex items-center px-4 gap-3">
      <svg
        class="w-5 h-5 text-red-600 flex-shrink-0"
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
      <span class="text-sm text-red-900 flex-1">{{ error }}</span>
      <Button
        size="icon"
        variant="ghost"
        class="text-red-400 hover:text-red-600"
        @click="error = ''"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Button>
    </div>
  </div>
</template>
