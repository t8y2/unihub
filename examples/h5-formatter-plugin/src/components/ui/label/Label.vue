<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <label :class="`text-sm font-medium leading-none ${props.class || ''}`">
    <slot />
  </label>
</template>
