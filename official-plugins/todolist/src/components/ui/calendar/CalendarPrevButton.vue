<script setup lang="ts">
import { CalendarPrev, type CalendarPrevProps } from 'radix-vue'
import { ChevronLeft } from 'lucide-vue-next'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<CalendarPrevProps>(), {
  step: 'month'
})
</script>

<template>
  <CalendarPrev
    :class="
      cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        props.class
      )
    "
    v-bind="props"
  >
    <slot>
      <ChevronLeft class="h-4 w-4" />
    </slot>
  </CalendarPrev>
</template>
