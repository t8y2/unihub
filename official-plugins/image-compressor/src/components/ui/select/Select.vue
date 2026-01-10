<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectClass = computed(() => {
  const base =
    'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:text-sm [&>option]:py-1'
  return `${base} ${props.class || ''}`
})

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select :value="modelValue" :class="selectClass" @change="handleChange">
    <slot />
  </select>
</template>

<style scoped>
select option {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
</style>
