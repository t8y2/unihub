<script setup lang="ts">
import { CalendarNext, type CalendarNextProps } from 'radix-vue'
import { ChevronRight } from 'lucide-vue-next'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<CalendarNextProps>(), {
  step: 'month'
})
</script>

<template>
  <CalendarNext
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
      <ChevronRight class="h-4 w-4" />
    </slot>
  </CalendarNext>
</template>
