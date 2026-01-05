<script setup lang="ts">
import { CalendarHeader, type CalendarHeaderProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarHeaderProps>()
</script>

<template>
  <CalendarHeader
    :class="cn('relative flex w-full items-center justify-between pt-1', props.class)"
    v-bind="props"
  >
    <slot />
  </CalendarHeader>
</template>
