<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useClipboard } from '@/composables/useClipboard'

const { copy } = useClipboard()

const currentTimestamp = ref(Math.floor(Date.now() / 1000))
const currentTimestampMs = ref(Date.now())
const timestampInput = ref('')
const dateInput = ref('')
const timestampResult = ref('')
const dateResult = ref('')

let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    currentTimestamp.value = Math.floor(Date.now() / 1000)
    currentTimestampMs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const currentDate = computed(() => {
  return new Date(currentTimestampMs.value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
})

const timestampToDate = (): void => {
  try {
    if (!timestampInput.value.trim()) {
      dateResult.value = '请输入时间戳'
      return
    }

    let ts = parseInt(timestampInput.value.trim())

    // 如果是 10 位，说明是秒级时间戳，转换为毫秒
    if (ts.toString().length === 10) {
      ts = ts * 1000
    }

    const date = new Date(ts)

    if (isNaN(date.getTime())) {
      dateResult.value = '无效的时间戳'
      return
    }

    dateResult.value = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    dateResult.value = `转换失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const dateToTimestamp = (): void => {
  try {
    if (!dateInput.value.trim()) {
      timestampResult.value = '请输入日期时间'
      return
    }

    const date = new Date(dateInput.value.trim())

    if (isNaN(date.getTime())) {
      timestampResult.value = '无效的日期格式'
      return
    }

    const timestamp = Math.floor(date.getTime() / 1000)
    const timestampMs = date.getTime()

    timestampResult.value = `秒级: ${timestamp}\n毫秒级: ${timestampMs}`
  } catch (e) {
    timestampResult.value = `转换失败: ${e instanceof Error ? e.message : String(e)}`
  }
}

const copyToClipboard = async (text: string): Promise<void> => {
  await copy(text)
}

const useCurrentTimestamp = (): void => {
  timestampInput.value = currentTimestamp.value.toString()
  timestampToDate()
}

const useCurrentDate = (): void => {
  const now = new Date()
  dateInput.value = now.toISOString().slice(0, 16)
  dateToTimestamp()
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
    <!-- 当前时间显示 -->
    <div
      class="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-6"
    >
      <div class="max-w-4xl mx-auto">
        <h2 class="text-lg font-semibold mb-4">当前时间</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div class="text-sm opacity-90 mb-1">秒级时间戳</div>
            <div class="text-2xl font-mono font-bold flex items-center justify-between">
              <span>{{ currentTimestamp }}</span>
              <Button
                size="icon"
                variant="ghost"
                @click="copyToClipboard(currentTimestamp.toString())"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div class="text-sm opacity-90 mb-1">毫秒级时间戳</div>
            <div class="text-2xl font-mono font-bold flex items-center justify-between">
              <span>{{ currentTimestampMs }}</span>
              <Button
                size="icon"
                variant="ghost"
                @click="copyToClipboard(currentTimestampMs.toString())"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center text-xl font-mono">
          {{ currentDate }}
        </div>
      </div>
    </div>

    <!-- 转换工具 -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 时间戳转日期 -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              时间戳转日期
            </CardTitle>
            <CardDescription>输入时间戳（支持秒级和毫秒级）</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-2">
              <Input
                v-model="timestampInput"
                type="text"
                placeholder="输入时间戳"
                class="flex-1 font-mono"
                @keyup.enter="timestampToDate"
              />
              <Button variant="secondary" @click="useCurrentTimestamp">使用当前</Button>
              <Button @click="timestampToDate">转换</Button>
            </div>
            <div
              v-if="dateResult"
              class="bg-muted rounded-md p-4 flex items-center justify-between"
            >
              <span class="font-mono text-lg">{{ dateResult }}</span>
              <Button size="icon" variant="ghost" @click="copyToClipboard(dateResult)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 日期转时间戳 -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              日期转时间戳
            </CardTitle>
            <CardDescription>选择日期时间进行转换</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-2">
              <Input
                v-model="dateInput"
                type="datetime-local"
                class="flex-1"
                @change="dateToTimestamp"
              />
              <Button variant="secondary" @click="useCurrentDate">使用当前</Button>
              <Button @click="dateToTimestamp">转换</Button>
            </div>
            <div
              v-if="timestampResult"
              class="bg-muted rounded-md p-4 flex items-center justify-between"
            >
              <pre class="font-mono text-sm">{{ timestampResult }}</pre>
              <Button size="icon" variant="ghost" @click="copyToClipboard(timestampResult)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
