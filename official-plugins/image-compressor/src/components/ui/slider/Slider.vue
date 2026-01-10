<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const sliderClass = computed(() => {
  const base = 'relative flex w-full touch-none select-none items-center'
  return `${base} ${props.class || ''}`
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}

const percentage = computed(() => {
  return ((props.modelValue || 0 - props.min) / (props.max - props.min)) * 100
})
</script>

<template>
  <div :class="sliderClass">
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      class="slider-input"
      @input="handleInput"
    />
  </div>
</template>

<style scoped>
.slider-input {
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.slider-input::-webkit-slider-track {
  width: 100%;
  height: 4px;
  background: hsl(var(--muted));
  border-radius: 2px;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: hsl(var(--primary));
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-input::-moz-range-track {
  width: 100%;
  height: 4px;
  background: hsl(var(--muted));
  border-radius: 2px;
}

.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: hsl(var(--primary));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.1);
}
</style>
