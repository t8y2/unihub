<script setup lang="ts">
/* eslint-disable @typescript-eslint/explicit-function-return-type */
interface Props {
  checked?: boolean
  class?: string
}

interface Emits {
  (e: 'update:checked', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:checked', !props.checked)
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :class="`h-4 w-4 shrink-0 rounded-sm border border-blue-600 shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-blue-600 text-white' : 'bg-white'} ${props.class || ''}`"
    @click="toggle"
  >
    <svg v-if="checked" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>
