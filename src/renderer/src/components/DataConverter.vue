<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import yaml from 'js-yaml'
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { json2xml, xml2json } from 'xml-js'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import yamlLang from 'highlight.js/lib/languages/yaml'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'
import { Buffer } from 'buffer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useClipboard } from '@/composables/useClipboard'

const { copy } = useClipboard()

// 确保 Buffer 在全局可用
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).Buffer = Buffer
}

hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yamlLang)
hljs.registerLanguage('xml', xml)

type Format = 'json' | 'yaml' | 'toml' | 'xml'

const input = ref('')
const output = ref('')
const error = ref('')
const fromFormat = ref<Format>('json')
const toFormat = ref<Format>('yaml')
const indent = ref(2)
const wordWrap = ref(false)

const highlightedOutput = computed(() => {
  if (!output.value) return ''
  try {
    const lang = toFormat.value === 'toml' ? 'yaml' : toFormat.value
    return hljs.highlight(output.value, { language: lang }).value
  } catch {
    return output.value
  }
})

// 解析输入
const parseInput = (text: string, format: Format): unknown => {
  switch (format) {
    case 'json':
      return JSON.parse(text)
    case 'yaml':
      return yaml.load(text)
    case 'toml':
      return parseToml(text)
    case 'xml': {
      const jsonStr = xml2json(text, { compact: true, spaces: 0 })
      return JSON.parse(jsonStr)
    }
    default:
      throw new Error('不支持的格式')
  }
}

// 序列化输出
const serializeOutput = (data: unknown, format: Format): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, indent.value)
    case 'yaml':
      return yaml.dump(data, { indent: indent.value })
    case 'toml':
      return stringifyToml(data)
    case 'xml': {
      const jsonStr = JSON.stringify(data)
      return json2xml(jsonStr, { compact: true, spaces: indent.value })
    }
    default:
      throw new Error('不支持的格式')
  }
}

// 转换
const convert = (): void => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入数据'
      return
    }

    const data = parseInput(input.value, fromFormat.value)
    output.value = serializeOutput(data, toFormat.value)
  } catch (e) {
    error.value = `转换失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

// 监听输入变化
watch([input, fromFormat, toFormat, indent], () => {
  if (!input.value.trim()) {
    output.value = ''
    error.value = ''
    return
  }

  try {
    const data = parseInput(input.value, fromFormat.value)
    output.value = serializeOutput(data, toFormat.value)
    error.value = ''
  } catch {
    error.value = ''
  }
})

const copyToClipboard = async (): Promise<void> => {
  await copy(output.value)
}

const clearAll = (): void => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const swapFormats = (): void => {
  const temp = fromFormat.value
  fromFormat.value = toFormat.value
  toFormat.value = temp

  if (output.value) {
    input.value = output.value
    convert()
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <div class="flex items-center gap-2">
        <Label class="text-sm text-gray-600 font-medium">从:</Label>
        <Select v-model="fromFormat">
          <SelectTrigger class="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
            <SelectItem value="toml">TOML</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button size="icon" variant="ghost" title="交换格式" @click="swapFormats">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </Button>

      <div class="flex items-center gap-2">
        <Label class="text-sm text-gray-600 font-medium">到:</Label>
        <Select v-model="toFormat">
          <SelectTrigger class="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
            <SelectItem value="toml">TOML</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="h-8 w-px bg-gray-300"></div>

      <Button size="sm" @click="convert"> 转换 </Button>

      <Button size="sm" variant="ghost" @click="clearAll"> 清空 </Button>

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

    <!-- 编辑器区域 -->
    <div class="flex-1 flex min-h-0 overflow-hidden">
      <!-- 输入区 -->
      <div class="flex-1 flex flex-col border-r border-gray-200 min-w-0">
        <div
          class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0"
        >
          <span
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
          >
            输入 ({{ fromFormat.toUpperCase() }})
          </span>
        </div>
        <div class="flex-1 overflow-auto min-h-0">
          <textarea
            v-model="input"
            :placeholder="`粘贴或输入 ${fromFormat.toUpperCase()} 数据...`"
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      <!-- 输出区 -->
      <div class="flex-1 flex flex-col min-w-0">
        <div
          class="h-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between flex-shrink-0"
        >
          <span
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
          >
            输出 ({{ toFormat.toUpperCase() }})
          </span>
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
            转换结果...
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
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
