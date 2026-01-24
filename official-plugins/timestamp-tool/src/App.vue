<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  CheckCircle2,
  Clock,
  Copy,
  Info,
  Pause,
  Play,
  RefreshCw
} from 'lucide-vue-next'

type Unit = 'ns' | 'ms' | 's'

type TimezoneOption = {
  id: string
  label: string
  offset: number
}

const units: Array<{ label: string; value: Unit }> = [
  { label: '纳秒', value: 'ns' },
  { label: '毫秒', value: 'ms' },
  { label: '秒', value: 's' }
]

// 时区预设（分钟偏移）
const timezones: TimezoneOption[] = [
  { id: 'utc-12', label: 'UTC-12:00 | 国际日期变更线西', offset: -720 },
  { id: 'utc-8', label: 'UTC-08:00 | 洛杉矶', offset: -480 },
  { id: 'utc-5', label: 'UTC-05:00 | 纽约', offset: -300 },
  { id: 'utc-3', label: 'UTC-03:00 | 布宜诺斯艾利斯', offset: -180 },
  { id: 'utc+0', label: 'UTC+00:00 | 伦敦', offset: 0 },
  { id: 'utc+1', label: 'UTC+01:00 | 柏林', offset: 60 },
  { id: 'utc+3', label: 'UTC+03:00 | 莫斯科', offset: 180 },
  { id: 'utc+5-30', label: 'UTC+05:30 | 新德里', offset: 330 },
  { id: 'utc+7', label: 'UTC+07:00 | 曼谷', offset: 420 },
  { id: 'utc+8', label: 'UTC+08:00 | 北京', offset: 480 },
  { id: 'utc+9', label: 'UTC+09:00 | 东京', offset: 540 },
  { id: 'utc+10', label: 'UTC+10:00 | 悉尼', offset: 600 },
  { id: 'utc+12', label: 'UTC+12:00 | 奥克兰', offset: 720 },
  { id: 'utc+14', label: 'UTC+14:00 | 基里巴斯', offset: 840 }
]

const unit = ref<Unit>('s')
const selectedTimezoneId = ref('utc+8')
const dateInput = ref('')
const timestampInput = ref('')
const showHint = ref(false)
const isRunning = ref(true)
const nowMs = ref(Date.now())
// 轻量提示状态
const toast = reactive({ visible: false, message: '', kind: 'success' as 'success' | 'error' })

// 时间段输入
const duration = reactive({
  days: '',
  hours: '',
  minutes: '',
  seconds: '',
  milliseconds: ''
})

let timerId: number | undefined

const selectedTimezone = computed(() => {
  return timezones.find((zone) => zone.id === selectedTimezoneId.value) ?? timezones[0]
})

const timezoneOffset = computed(() => selectedTimezone.value.offset)
const timezoneCity = computed(() => {
  const parts = selectedTimezone.value.label.split('|')
  return (parts[1] || selectedTimezone.value.label).trim()
})

// 时间格式化工具
const pad = (value: number, length = 2) => String(value).padStart(length, '0')

const formatDateTimeInput = (ms: number, offset: number) => {
  const date = new Date(ms + offset * 60000)
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hour = pad(date.getUTCHours())
  const minute = pad(date.getUTCMinutes())
  const second = pad(date.getUTCSeconds())
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

const formatDateTimeDisplay = (ms: number, offset: number, withMilliseconds: boolean) => {
  const date = new Date(ms + offset * 60000)
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hour = pad(date.getUTCHours())
  const minute = pad(date.getUTCMinutes())
  const second = pad(date.getUTCSeconds())
  if (!withMilliseconds) {
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  const msPart = pad(date.getUTCMilliseconds(), 3)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${msPart}`
}

const parseDateTimeInput = (value: string) => {
  if (!value) return null
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null
  const [yearStr, monthStr, dayStr] = datePart.split('-')
  const [hourStr, minuteStr, secondStr = '0'] = timePart.split(':')
  const [secondRaw, msRaw] = secondStr.split('.')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  const second = Number(secondRaw)
  const millisecond = msRaw ? Number(msRaw.padEnd(3, '0').slice(0, 3)) : 0
  if (
    [year, month, day, hour, minute, second, millisecond].some(
      (item) => Number.isNaN(item)
    )
  ) {
    return null
  }
  return { year, month, day, hour, minute, second, millisecond }
}

// 单位换算（毫秒 ↔ 秒/毫秒/纳秒）
const toTimestampString = (ms: number, mode: Unit) => {
  switch (mode) {
    case 's':
      return Math.floor(ms / 1000).toString()
    case 'ms':
      return Math.floor(ms).toString()
    case 'ns':
      return Math.floor(ms * 1_000_000).toString()
    default:
      return ''
  }
}

const parseTimestampToMs = (value: string, mode: Unit) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null
  const numericValue = Number(trimmed)
  if (!Number.isFinite(numericValue)) return null
  switch (mode) {
    case 's':
      return numericValue * 1000
    case 'ms':
      return numericValue
    case 'ns':
      return numericValue / 1_000_000
    default:
      return null
  }
}

// 日期 → 时间戳
const dateToTimestamp = computed(() => {
  const parsed = parseDateTimeInput(dateInput.value)
  if (!parsed) return ''
  const ms =
    Date.UTC(
      parsed.year,
      parsed.month - 1,
      parsed.day,
      parsed.hour,
      parsed.minute,
      parsed.second,
      parsed.millisecond
    ) -
    timezoneOffset.value * 60000
  return toTimestampString(ms, unit.value)
})

// 时间戳 → 日期
const timestampToDate = computed(() => {
  const ms = parseTimestampToMs(timestampInput.value, unit.value)
  if (ms === null) return ''
  return formatDateTimeDisplay(ms, timezoneOffset.value, unit.value !== 's')
})

// 时间段 → 时间戳
const durationToTimestamp = computed(() => {
  // 修复：输入组件可能返回非字符串，统一转为字符串再判空
  const values = Object.values(duration).map((value) => String(value ?? ''))
  if (values.every((value) => value.trim() === '')) return ''
  const days = Number(duration.days) || 0
  const hours = Number(duration.hours) || 0
  const minutes = Number(duration.minutes) || 0
  const seconds = Number(duration.seconds) || 0
  const milliseconds = Number(duration.milliseconds) || 0
  const totalMs =
    (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds
  return toTimestampString(totalMs, unit.value)
})

// 当前时间戳
const currentTimestamp = computed(() => toTimestampString(nowMs.value, unit.value))

// 轻量提示样式
const toastClass = computed(() => {
  return toast.kind === 'error'
    ? 'border-rose-200/80 text-rose-600 dark:border-rose-400/20 dark:text-rose-200'
    : 'border-emerald-200/80 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-200'
})

// 轻量提示
const showToast = (message: string, kind: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.kind = kind
  toast.visible = true
  window.setTimeout(() => {
    toast.visible = false
  }, 2000)
}

// 复制文本（优先走 UniHub 剪贴板）
const copyText = async (value: string) => {
  if (!value) return
  try {
    if (window.unihub?.clipboard?.writeText) {
      await window.unihub.clipboard.writeText(value)
    } else {
      await navigator.clipboard.writeText(value)
    }
    showToast('复制成功', 'success')
  } catch {
    showToast('复制失败', 'error')
  }
}

// 当前时间戳定时刷新
const startTimer = () => {
  if (timerId) return
  timerId = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 100)
}

const stopTimer = () => {
  if (!timerId) return
  window.clearInterval(timerId)
  timerId = undefined
}

const toggleTimer = () => {
  isRunning.value = !isRunning.value
}

// 重置输入
const resetAll = () => {
  dateInput.value = formatDateTimeInput(Date.now(), timezoneOffset.value)
  timestampInput.value = ''
  duration.days = ''
  duration.hours = ''
  duration.minutes = ''
  duration.seconds = ''
  duration.milliseconds = ''
  nowMs.value = Date.now()
  isRunning.value = true
}

watch(isRunning, (value) => {
  if (value) {
    startTimer()
  } else {
    stopTimer()
  }
})

watch(timezoneOffset, () => {
  if (!dateInput.value) {
    dateInput.value = formatDateTimeInput(Date.now(), timezoneOffset.value)
  }
})

onMounted(() => {
  // 初始化默认日期
  dateInput.value = formatDateTimeInput(Date.now(), timezoneOffset.value)
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="relative flex h-full w-full overflow-hidden">
    <!-- 新增：背景氛围层 -->
    <div
      class="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-200/20"
    ></div>
    <div
      class="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-200/20"
    ></div>
    <div
      class="absolute left-1/3 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-300/10"
    ></div>

    <div class="relative z-10 flex h-full w-full flex-col gap-5 p-6">
      <!-- 新增：顶部控制区 -->
      <header class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
            <Clock class="h-5 w-5 text-primary" />
            时间戳转换
          </div>
          <div class="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span class="rounded-full bg-white/70 px-2 py-1 dark:bg-slate-800/70">
              Unix / ISO / Duration
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div
            class="flex w-fit items-center rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-slate-200/70 backdrop-blur dark:bg-slate-800/70 dark:ring-slate-700/60"
          >
            <button
              v-for="item in units"
              :key="item.value"
              class="rounded-full px-4 py-1 text-sm font-medium transition"
              :class="
                unit === item.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              "
              @click="unit = item.value"
            >
              {{ item.label }}
            </button>
          </div>

          <div class="relative">
            <select
              v-model="selectedTimezoneId"
              class="h-10 rounded-2xl border border-slate-200/70 bg-white/80 px-4 pr-8 text-sm font-medium text-slate-700 shadow-sm backdrop-blur focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
            >
              <option v-for="zone in timezones" :key="zone.id" :value="zone.id">
                {{ zone.label }}
              </option>
            </select>
          </div>

          <button
            class="flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 text-sm text-slate-600 shadow-sm backdrop-blur transition hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:text-white"
            @click="showHint = !showHint"
          >
            <Info class="h-4 w-4" />
            说明
          </button>

          <span
            v-if="showHint"
            class="text-xs text-slate-500 dark:text-slate-400"
          >
            JS Date 以毫秒为基准，纳秒为近似换算。
          </span>
        </div>
      </header>

      <!-- 新增：转换区块 -->
      <main class="flex-1 overflow-y-auto pr-1">
        <div class="grid gap-4">
          <div class="grid gap-4 lg:grid-cols-2">
            <section
              class="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-900/70"
            >
              <div class="mb-4 flex items-center justify-between">
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  日期 → ({{ timezoneCity }}) 时间戳
                </div>
                <button
                  class="flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  @click="dateInput = formatDateTimeInput(Date.now(), timezoneOffset)"
                >
                  <RefreshCw class="h-3.5 w-3.5" />
                  现在
                </button>
              </div>
              <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <input
                  v-model="dateInput"
                  type="datetime-local"
                  step="1"
                  class="h-12 w-full rounded-2xl border border-slate-200/70 bg-white/70 px-4 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
                />
                <button
                  class="group flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200"
                  @click="copyText(dateToTimestamp)"
                >
                  <span class="font-mono text-base">
                    {{ dateToTimestamp || '-' }}
                  </span>
                  <Copy class="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
                </button>
              </div>
            </section>

            <section
              class="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-900/70"
            >
              <div class="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                时间戳 → ({{ timezoneCity }}) 日期
              </div>
              <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <input
                  v-model="timestampInput"
                  type="text"
                  inputmode="numeric"
                  placeholder="请输入时间戳"
                  class="h-12 w-full rounded-2xl border border-slate-200/70 bg-white/70 px-4 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
                />
                <button
                  class="group flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200"
                  @click="copyText(timestampToDate)"
                >
                  <span class="font-mono text-base">
                    {{ timestampToDate || '-' }}
                  </span>
                  <Copy class="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
                </button>
              </div>
            </section>
          </div>

          <section
            class="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-900/70"
          >
            <div class="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              时间段 → 时间戳
            </div>
            <div class="grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
              <input
                v-model="duration.days"
                type="number"
                min="0"
                placeholder="天"
                class="h-11 rounded-2xl border border-slate-200/70 bg-white/70 px-3 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
              />
              <input
                v-model="duration.hours"
                type="number"
                min="0"
                placeholder="小时"
                class="h-11 rounded-2xl border border-slate-200/70 bg-white/70 px-3 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
              />
              <input
                v-model="duration.minutes"
                type="number"
                min="0"
                placeholder="分钟"
                class="h-11 rounded-2xl border border-slate-200/70 bg-white/70 px-3 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
              />
              <input
                v-model="duration.seconds"
                type="number"
                min="0"
                placeholder="秒"
                class="h-11 rounded-2xl border border-slate-200/70 bg-white/70 px-3 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
              />
              <input
                v-model="duration.milliseconds"
                type="number"
                min="0"
                placeholder="毫秒"
                class="h-11 rounded-2xl border border-slate-200/70 bg-white/70 px-3 text-sm font-medium text-slate-800 shadow-inner focus:border-primary focus:outline-none dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100"
              />
              <button
                class="group flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200"
                @click="copyText(durationToTimestamp)"
              >
                <span class="font-mono text-base">
                  {{ durationToTimestamp || '-' }}
                </span>
                <Copy class="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
              </button>
            </div>
          </section>

          <section
            class="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-900/70"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">当前时间戳</div>
                <div class="mt-2 flex items-end gap-3">
                  <div class="text-3xl font-semibold text-slate-900 dark:text-white">
                    {{ currentTimestamp }}
                  </div>
                  <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                    {{ unit.toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200"
                  @click="toggleTimer"
                >
                  <component :is="isRunning ? Pause : Play" class="h-4 w-4" />
                  {{ isRunning ? '暂停' : '继续' }}
                </button>
                <button
                  class="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200"
                  @click="copyText(currentTimestamp)"
                >
                  <Copy class="h-4 w-4" />
                  复制
                </button>
                <button
                  class="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200"
                  @click="resetAll"
                >
                  <RefreshCw class="h-4 w-4" />
                  重置数据
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- 新增：复制提示气泡 -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toast.visible"
        class="absolute right-6 top-6 flex items-center gap-2 rounded-2xl border bg-white/90 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur dark:bg-slate-900/90"
        :class="toastClass"
      >
        <CheckCircle2 class="h-4 w-4" />
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>
