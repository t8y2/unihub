<script setup lang="ts">
/* eslint-disable @typescript-eslint/explicit-function-return-type */
interface Props {
  modelValue?: string | number
  type?: string
  min?: number
  max?: number
  placeholder?: string
  class?: string
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits<Emits>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :min="min"
    :max="max"
    :placeholder="placeholder"
    :class="`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${props.class || ''}`"
    @input="handleInput"
  />
</template>
