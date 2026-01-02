<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pluginStatsService } from '@/plugins/marketplace/stats'
import { toast } from 'vue-sonner'

const props = defineProps<{
  pluginId: string
  pluginName: string
}>()

const userRating = ref<number>(0)
const hoverRating = ref<number>(0)
const submitting = ref(false)
const loading = ref(true)

// 加载用户评分
onMounted(async () => {
  try {
    const rating = await pluginStatsService.getUserRating(props.pluginId)
    if (rating) {
      userRating.value = rating
    }
  } catch (error) {
    console.warn('获取用户评分失败:', error)
  } finally {
    loading.value = false
  }
})

// 提交评分
const submitRating = async (rating: number): Promise<void> => {
  if (submitting.value) return

  try {
    submitting.value = true
    const userId = localStorage.getItem('unihub_user_id') || 'anonymous'

    const success = await pluginStatsService.submitRating({
      pluginId: props.pluginId,
      rating,
      userId
    })

    if (success) {
      userRating.value = rating
      toast.success('评分成功！')
    } else {
      toast.error('评分失败，请稍后重试')
    }
  } catch (error) {
    console.error('提交评分失败:', error)
    toast.error('评分失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 鼠标悬停
const onHover = (rating: number): void => {
  if (!submitting.value) {
    hoverRating.value = rating
  }
}

// 鼠标离开
const onLeave = (): void => {
  hoverRating.value = 0
}

// 点击星星
const onClick = (rating: number): void => {
  submitRating(rating)
}

// 显示的评分（悬停时显示悬停值，否则显示用户评分）
const displayRating = (index: number): boolean => {
  const target = hoverRating.value || userRating.value
  return index <= target
}
</script>

<template>
  <div class="mb-4">
    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ userRating > 0 ? '你的评分' : '给插件评分' }}
    </h3>

    <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-500">
      <div
        class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
      ></div>
      加载中...
    </div>

    <div v-else class="flex items-center gap-2">
      <div class="flex gap-1" @mouseleave="onLeave">
        <button
          v-for="i in 5"
          :key="i"
          class="transition-all duration-150 focus:outline-none disabled:cursor-not-allowed"
          :class="{
            'scale-110': hoverRating === i,
            'opacity-50': submitting
          }"
          :disabled="submitting"
          @mouseenter="onHover(i)"
          @click="onClick(i)"
        >
          <svg
            class="w-8 h-8 transition-colors"
            :class="displayRating(i) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      </div>

      <span v-if="userRating > 0" class="text-sm text-gray-600 dark:text-gray-400">
        {{ userRating }} 星
      </span>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400"> 点击星星评分 </span>
    </div>

    <p v-if="userRating > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      点击星星可以修改评分
    </p>
  </div>
</template>
