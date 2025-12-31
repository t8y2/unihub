<script setup lang="ts">
import { ref, computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'
import * as prettier from 'prettier'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserPostcss from 'prettier/parser-postcss'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

hljs.registerLanguage('html', xml)

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)
const copied = ref(false)
const wordWrap = ref(false)

const highlightedOutput = computed(() => {
  if (!output.value) return ''
  try {
    return hljs.highlight(output.value, { language: 'html' }).value
  } catch {
    return output.value
  }
})

const formatCode = async (): Promise<void> => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 HTML 代码'
      return
    }

    const formatted = await prettier.format(input.value, {
      parser: 'html' as const,
      plugins: [parserHtml, parserBabel, parserPostcss],
      tabWidth: indent.value,
      useTabs: false,
      printWidth: 80,
      htmlWhitespaceSensitivity: 'css' as const
    })

    output.value = formatted
  } catch (e) {
    error.value = `格式化失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const compressCode = (): void => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 HTML 代码'
      return
    }

    const compressed = input.value.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()

    output.value = compressed
  } catch (e) {
    error.value = `压缩失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const clearInput = (): void => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const copyToClipboard = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    error.value = '复制失败'
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 h-screen">
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <Button size="sm" @click="formatCode">
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

      <Button size="sm" variant="secondary" @click="compressCode">
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

        <div class="flex items-center gap-2">
          <Label class="text-sm text-gray-600 dark:text-gray-400">缩进:</Label>
          <Input v-model.number="indent" type="number" min="2" max="8" class="w-16 h-8" />
        </div>
      </div>
    </div>

    <div class="flex-1 flex min-h-0 overflow-hidden">
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
            placeholder="粘贴或输入完整的 HTML 页面（支持内联 CSS 和 JavaScript）..."
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      <div class="flex-1 flex flex-col min-w-0">
        <div
          class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between flex-shrink-0"
        >
          <span
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
            >输出</span
          >
          <Button
            v-if="output"
            size="sm"
            :variant="copied ? 'default' : 'default'"
            class="flex items-center gap-1.5"
            @click="copyToClipboard"
          >
            <svg
              v-if="!copied"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ copied ? '已复制' : '复制' }}
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

    <div
      v-if="error"
      class="h-12 bg-red-50 border-t border-red-200 flex items-center px-4 gap-3 flex-shrink-0"
    >
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
