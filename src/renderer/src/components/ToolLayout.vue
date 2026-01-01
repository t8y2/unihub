<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 头部 -->
    <div
      v-if="$slots.header || title"
      class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6"
    >
      <slot name="header">
        <h1 v-if="title" class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ title }}
        </h1>
        <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </slot>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>

    <!-- 底部（可选） -->
    <div
      v-if="$slots.footer"
      class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
