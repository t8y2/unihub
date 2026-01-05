<template>
  <div class="w-8 h-8 flex items-center justify-center">
    <!-- 加载中状态 -->
    <div v-if="loading" class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

    <!-- 真实图标 -->
    <img
      v-else-if="iconSrc"
      :src="iconSrc"
      class="w-8 h-8 rounded"
      :alt="`${appName} icon`"
      @error="onImageError"
    />

    <!-- 备用图标 -->
    <div v-else class="w-8 h-8 flex items-center justify-center text-2xl">📱</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  appPath: string
  appName: string
}>()

const loading = ref(true)
const iconSrc = ref<string>()

const loadIcon = async (): Promise<void> => {
  try {
    const result = await window.api.apps.getIcon(props.appPath)
    if (result.success && result.data) {
      iconSrc.value = result.data
    }
  } catch (error) {
    console.error(`[LazyAppIcon] 加载图标失败: ${props.appPath}`, error)
  } finally {
    loading.value = false
  }
}

const onImageError = (): void => {
  iconSrc.value = undefined
}

onMounted(() => {
  loadIcon()
})
</script>
