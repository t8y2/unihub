<script setup lang="ts">
import { CalendarCellTrigger, type CalendarCellTriggerProps } from 'radix-vue'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarCellTriggerProps>()
</script>

<template>
  <CalendarCellTrigger
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'h-9 w-9 p-0 font-normal cursor-pointer',
        '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
        // Selected
        'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground',
        // Disabled
        'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
        // Outside months
        'data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30',
        props.class
      )
    "
    v-bind="props"
  >
    <slot />
  </CalendarCellTrigger>
</template>
