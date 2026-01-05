<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <th :class="cn('text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]', props.class)">
    <slot />
  </th>
</template>
