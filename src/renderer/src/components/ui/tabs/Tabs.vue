<script setup lang="ts">
import { TabsRoot, type TabsRootProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsRootProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <TabsRoot v-bind="delegatedProps" :class="cn('', props.class)">
    <slot />
  </TabsRoot>
</template>
