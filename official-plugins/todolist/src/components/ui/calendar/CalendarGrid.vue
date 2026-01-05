<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <table :class="cn('w-full border-collapse space-y-1', props.class)">
    <slot />
  </table>
</template>
