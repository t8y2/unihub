<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default'
})

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    default: 'bg-blue-600 text-white shadow hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    outline: 'border border-gray-300 bg-white shadow-sm hover:bg-gray-50'
  }

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    icon: 'h-9 w-9'
  }

  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${props.class || ''}`
})
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
