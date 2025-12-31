<template>
  <span v-if="isEmojiIcon" :class="emojiClass">
    {{ icon }}
  </span>
  <svg v-else :class="svgClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isEmoji } from '@/utils/icon'

const props = withDefaults(
  defineProps<{
    icon: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md'
  }
)

const isEmojiIcon = computed(() => isEmoji(props.icon))

const emojiClass = computed(() => {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }
  return sizes[props.size]
})

const svgClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return `${sizes[props.size]} text-blue-600 dark:text-blue-400`
})
</script>
