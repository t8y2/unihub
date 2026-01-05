<script setup lang="ts">
import { CalendarHeading, type CalendarHeadingProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarHeadingProps>()
</script>

<template>
  <CalendarHeading
    v-slot="{ headingValue }"
    :class="cn('text-sm font-medium', props.class)"
    v-bind="props"
  >
    <slot>
      {{ headingValue }}
    </slot>
  </CalendarHeading>
</template>
