<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'

const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const output = ref('')
const error = ref('')
const copied = ref(false)

const encode = () => {
  try {
    error.value = ''
    if (!input.value) {
      error.value = '请输入要编码的内容'
      return
    }
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch (e: any) {
    error.value = `编码失败: ${e.message}`
  }
}

const decode = () => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入要解码的 Base64 字符串'
      return
    }
    output.value = decodeURIComponent(escape(atob(input.value.trim())))
  } catch (e: any) {
    error.value = `解码失败: ${e.message}`
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    error.value = '复制失败'
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const swapContent = () => {
  const temp = input.value
  input.value = output.value
  output.value = temp
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0">
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
        <Button
          @click="mode = 'encode'"
          size="sm"
          :variant="mode === 'encode' ? 'default' : 'ghost'"
        >
          编码
        </Button>
        <Button
          @click="mode = 'decode'"
          size="sm"
          :variant="mode === 'decode' ? 'default' : 'ghost'"
        >
          解码
        </Button>
      </div>

      <div class="h-8 w-px bg-gray-300"></div>

      <Button
        @click="mode === 'encode' ? encode() : decode()"
        size="sm"
      >
        {{ mode === 'encode' ? '编码' : '解码' }}
      </Button>

      <Button
        @click="swapContent"
        size="sm"
        variant="secondary"
        :disabled="!output"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </Button>

      <Button
        @click="clearAll"
        size="sm"
        variant="ghost"
      >
        清空
      </Button>
    </div>

    <!-- 编辑器区域 -->
    <div class="flex-1 flex min-h-0 overflow-hidden">
      <!-- 输入区 -->
      <div class="flex-1 flex flex-col border-r border-gray-200 min-w-0">
        <div class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {{ mode === 'encode' ? '原始文本' : 'Base64 字符串' }}
          </span>
        </div>
        <div class="flex-1 overflow-auto min-h-0">
          <textarea
            v-model="input"
            :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64 字符串...'"
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      <!-- 输出区 -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between flex-shrink-0">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {{ mode === 'encode' ? 'Base64 字符串' : '原始文本' }}
          </span>
          <Button
            v-if="output"
            @click="copyToClipboard"
            size="sm"
            class="flex items-center gap-1.5"
          >
            <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ copied ? '已复制' : '复制' }}
          </Button>
        </div>
        <div class="flex-1 overflow-auto bg-white min-h-0">
          <pre v-if="output" class="p-4 text-sm font-mono whitespace-pre-wrap break-all">{{ output }}</pre>
          <div v-else class="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">结果...</div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="h-12 bg-red-50 border-t border-red-200 flex items-center px-4 gap-3 flex-shrink-0">
      <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm text-red-900 flex-1">{{ error }}</span>
      <Button @click="error = ''" size="icon" variant="ghost" class="text-red-400 hover:text-red-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  </div>
</template>
