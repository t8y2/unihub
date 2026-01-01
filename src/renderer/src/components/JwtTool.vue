<script setup lang="ts">
import { ref, computed } from 'vue'
import * as jose from 'jose'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useClipboard } from '@/composables/useClipboard'

const { copy } = useClipboard()

hljs.registerLanguage('json', json)

const mode = ref<'decode' | 'encode'>('decode')
const input = ref('')
const output = ref('')
const error = ref('')

// 编码参数
const payload = ref('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
const secret = ref('your-secret-key')
const algorithm = ref<'HS256' | 'HS384' | 'HS512'>('HS256')
const expiresIn = ref('1h')

const highlightedOutput = computed(() => {
  if (!output.value) return ''
  try {
    return hljs.highlight(output.value, { language: 'json' }).value
  } catch {
    return output.value
  }
})

// 解析过期时间字符串为秒数
const parseExpiresIn = (exp: string): number | undefined => {
  if (!exp) return undefined
  const match = exp.match(/^(\d+)([smhd])$/)
  if (!match || !match[1] || !match[2]) return undefined

  const value = parseInt(match[1])
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  }

  return value * (multipliers[unit] || 1)
}

const decodeJwt = (): void => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 JWT Token'
      return
    }

    // 解码（不验证签名）
    const decoded = jose.decodeJwt(input.value)
    const header = jose.decodeProtectedHeader(input.value)

    const result = {
      header,
      payload: decoded
    }

    output.value = JSON.stringify(result, null, 2)
  } catch (e) {
    error.value = `解码失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const verifyJwt = async (): Promise<void> => {
  try {
    error.value = ''
    if (!input.value.trim()) {
      error.value = '请输入 JWT Token'
      return
    }
    if (!secret.value.trim()) {
      error.value = '请输入密钥'
      return
    }

    // 验证并解码
    const secretKey = new TextEncoder().encode(secret.value)
    const { payload: decoded } = await jose.jwtVerify(input.value, secretKey)

    output.value = JSON.stringify(decoded, null, 2)
  } catch (e) {
    error.value = `验证失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const encodeJwt = async (): Promise<void> => {
  try {
    error.value = ''
    if (!payload.value.trim()) {
      error.value = '请输入 Payload'
      return
    }
    if (!secret.value.trim()) {
      error.value = '请输入密钥'
      return
    }

    const payloadObj = JSON.parse(payload.value)
    const secretKey = new TextEncoder().encode(secret.value)

    const jwt = new jose.SignJWT(payloadObj).setProtectedHeader({ alg: algorithm.value })

    // 添加过期时间
    const expSeconds = parseExpiresIn(expiresIn.value)
    if (expSeconds) {
      jwt.setExpirationTime(Math.floor(Date.now() / 1000) + expSeconds)
    }

    const token = await jwt.sign(secretKey)
    output.value = token
  } catch (e) {
    error.value = `编码失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const copyToClipboard = async (): Promise<void> => {
  await copy(output.value)
}

const clearAll = (): void => {
  input.value = ''
  output.value = ''
  error.value = ''
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
        <Button
          size="sm"
          :variant="mode === 'decode' ? 'default' : 'ghost'"
          @click="mode = 'decode'"
        >
          解码
        </Button>
        <Button
          size="sm"
          :variant="mode === 'encode' ? 'default' : 'ghost'"
          @click="mode = 'encode'"
        >
          编码
        </Button>
      </div>

      <div class="h-8 w-px bg-gray-300"></div>

      <Button v-if="mode === 'decode'" size="sm" @click="decodeJwt"> 解码 Token </Button>

      <Button v-if="mode === 'decode'" size="sm" variant="secondary" @click="verifyJwt">
        验证 Token
      </Button>

      <Button v-if="mode === 'encode'" size="sm" @click="encodeJwt"> 生成 Token </Button>

      <Button size="sm" variant="ghost" @click="clearAll"> 清空 </Button>

      <div v-if="mode === 'encode'" class="ml-auto flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">算法:</label>
          <select
            v-model="algorithm"
            class="h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HS256">HS256</option>
            <option value="HS384">HS384</option>
            <option value="HS512">HS512</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <Label class="text-sm text-gray-600 dark:text-gray-400">过期时间:</Label>
          <Input v-model="expiresIn" type="text" placeholder="1h, 7d, 30m" class="w-24 h-8" />
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
            {{ mode === 'decode' ? 'JWT Token' : 'Payload (JSON)' }}
          </span>
        </div>
        <div class="flex-1 overflow-auto min-h-0">
          <textarea
            v-if="mode === 'decode'"
            v-model="input"
            placeholder="粘贴 JWT Token..."
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
          />
          <textarea
            v-else
            v-model="payload"
            placeholder="输入 Payload JSON..."
            class="w-full h-full p-4 bg-white text-sm font-mono resize-none focus:outline-none"
          />
        </div>

        <!-- 密钥输入 -->
        <div
          class="h-16 bg-gray-50 border-t border-gray-200 flex items-center px-4 gap-2 flex-shrink-0"
        >
          <label class="text-sm text-gray-600 font-medium">密钥:</label>
          <input
            v-model="secret"
            type="text"
            placeholder="输入密钥（用于验证/签名）"
            class="flex-1 h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {{ mode === 'decode' ? '解码结果' : '生成的 Token' }}
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
        <div class="flex-1 overflow-auto bg-[#0d1117] min-h-0 scrollbar-hide">
          <pre
            v-if="output && mode === 'decode'"
            class="p-4 text-sm whitespace-pre-wrap break-words"
          ><code class="hljs" v-html="highlightedOutput"></code></pre>
          <pre
            v-else-if="output"
            class="p-4 text-sm text-green-400 font-mono whitespace-pre-wrap break-all"
            >{{ output }}</pre
          >
          <div v-else class="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">结果...</div>
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
