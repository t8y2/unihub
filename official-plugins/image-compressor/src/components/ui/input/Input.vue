<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  class?: string
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputClass = computed(() => {
  const base =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
  return `${base} ${props.class || ''}`
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.valueAsNumber || 0)
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :class="inputClass"
    @input="handleInput"
  />
</template>
