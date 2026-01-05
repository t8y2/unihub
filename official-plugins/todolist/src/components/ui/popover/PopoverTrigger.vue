<script setup lang="ts">
import { PopoverTrigger, type PopoverTriggerProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<PopoverTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: className, ...delegated } = props
  return delegated
})
</script>

<template>
  <PopoverTrigger v-bind="delegatedProps" :class="cn('', props.class)">
    <slot />
  </PopoverTrigger>
</template>
