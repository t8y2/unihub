<script setup lang="ts">
import { CalendarCell, type CalendarCellProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarCellProps>()
</script>

<template>
  <CalendarCell
    v-bind="props"
    :class="
      cn(
        'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50',
        props.class
      )
    "
  >
    <slot />
  </CalendarCell>
</template>
