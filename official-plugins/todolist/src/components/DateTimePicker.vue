<script setup lang="ts">
import { computed } from 'vue'
import { Calendar as CalendarIcon, Clock } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { DateFormatter, getLocalTimeZone, today, parseDate } from '@internationalized/date'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const df = new DateFormatter('zh-CN', {
  dateStyle: 'medium'
})

const selectedDate = computed({
  get: () => {
    if (!props.modelValue) return undefined
    try {
      return parseDate(props.modelValue.split('T')[0])
    } catch {
      return undefined
    }
  },
  set: (value) => {
    if (value) {
      const dateStr = value.toString()
      const timeStr = selectedTime.value || '09:00'
      emit('update:modelValue', `${dateStr}T${timeStr}`)
    } else {
      emit('update:modelValue', '')
    }
  }
})

const selectedTime = computed({
  get: () => {
    if (!props.modelValue) return '09:00'
    const parts = props.modelValue.split('T')
    return parts[1] || '09:00'
  },
  set: (value) => {
    if (selectedDate.value) {
      const dateStr = selectedDate.value.toString()
      emit('update:modelValue', `${dateStr}T${value}`)
    }
  }
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const [datePart, timePart] = props.modelValue.split('T')
  if (!datePart) return ''

  try {
    const date = parseDate(datePart)
    const todayDate = today(getLocalTimeZone())
    const tomorrow = todayDate.add({ days: 1 })

    let dateText = df.format(date.toDate(getLocalTimeZone()))
    if (date.compare(todayDate) === 0) dateText = '今天'
    else if (date.compare(tomorrow) === 0) dateText = '明天'

    return timePart ? `${dateText} ${timePart}` : dateText
  } catch {
    return ''
  }
})

const clearDate = (): void => {
  emit('update:modelValue', '')
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button
        :class="
          cn(
            'flex items-center gap-2 h-7 px-2 bg-input border-0 rounded-md text-xs hover:bg-accent transition-colors',
            !modelValue && 'text-muted-foreground'
          )
        "
      >
        <CalendarIcon :size="14" />
        <span>{{ displayValue || '选择日期' }}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <div class="flex">
        <!-- 日历 -->
        <Calendar v-model="selectedDate" initial-focus />

        <!-- 时间选择器 -->
        <div class="border-l border-border p-4 flex flex-col justify-center gap-3 min-w-[140px]">
          <div class="flex items-center gap-2">
            <Clock :size="14" class="text-muted-foreground" />
            <span class="text-xs font-medium text-muted-foreground">选择时间</span>
          </div>

          <input
            v-model="selectedTime"
            type="time"
            class="w-full h-10 px-3 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            class="w-full h-8 px-3 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            @click="clearDate"
          >
            清除
          </button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
