<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showBackground?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showBackground: true
})

// 容器尺寸（带背景时）
const containerSizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

// 图标尺寸 - 强制固定宽高
const iconSizeClasses = {
  xs: 'w-3 h-3 text-sm',
  sm: 'w-4 h-4 text-base',
  md: 'w-5 h-5 text-xl',
  lg: 'w-6 h-6 text-2xl',
  xl: 'w-8 h-8 text-3xl'
}

const iconType = computed(() => {
  if (!props.icon) return 'emoji'

  if (props.icon.startsWith('M') || props.icon.startsWith('m')) {
    return 'svg'
  }

  if (props.icon.startsWith('http') || props.icon.startsWith('data:image')) {
    return 'image'
  }

  return 'emoji'
})

// 根据图标类型决定背景样式
const backgroundClass = computed(() => {
  if (!props.showBackground) return ''

  // 彩色图标使用浅色背景
  if (iconType.value === 'image') {
    return 'bg-gray-100 dark:bg-gray-800'
  }

  // SVG 和 emoji 使用渐变背景
  return 'bg-gradient-to-br from-blue-500 to-purple-600'
})
</script>

<template>
  <div
    v-if="showBackground"
    :class="[containerSizeClasses[size], backgroundClass]"
    class="flex items-center justify-center rounded-lg flex-shrink-0"
  >
    <!-- SVG Path -->
    <svg
      v-if="iconType === 'svg'"
      :class="iconSizeClasses[size]"
      class="text-white flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
    </svg>

    <!-- Image URL - 彩色图标，保持原始比例 -->
    <img
      v-else-if="iconType === 'image'"
      :src="icon"
      :class="iconSizeClasses[size]"
      class="object-contain rounded flex-shrink-0"
      style="min-width: inherit; min-height: inherit; max-width: 100%; max-height: 100%"
      alt="Plugin icon"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />

    <!-- Emoji -->
    <span v-else :class="iconSizeClasses[size]" class="flex-shrink-0 leading-none">{{ icon }}</span>
  </div>

  <!-- 无背景模式 -->
  <template v-else>
    <svg
      v-if="iconType === 'svg'"
      :class="iconSizeClasses[size]"
      class="flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
    </svg>

    <img
      v-else-if="iconType === 'image'"
      :src="icon"
      :class="iconSizeClasses[size]"
      class="object-contain rounded flex-shrink-0"
      style="min-width: inherit; min-height: inherit; max-width: 100%; max-height: 100%"
      alt="Plugin icon"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />

    <span v-else :class="iconSizeClasses[size]" class="flex-shrink-0 leading-none">{{ icon }}</span>
  </template>
</template>
