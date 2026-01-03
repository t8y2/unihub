<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'

const message = ref('Hello UniHub Plugin!')

const showToast = (): void => {
  toast.success('这是一个成功提示！', {
    description: '使用 vue-sonner 显示通知'
  })
}

const showErrorToast = (): void => {
  toast.error('这是一个错误提示！', {
    description: '可以显示不同类型的通知'
  })
}

const showInfoToast = (): void => {
  toast.info('这是一个信息提示！', {
    description: '支持多种通知类型'
  })
}
</script>

<template>
  <Toaster position="top-center" :duration="3000" />
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-foreground">{{ message }}</h1>
      <p class="mt-2 text-muted-foreground">这是一个插件模板，你可以在此基础上开发自己的插件</p>
    </div>

    <div class="mt-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-3 text-xl font-semibold text-card-foreground">快速开始</h2>
      <ul class="space-y-2 text-sm text-muted-foreground">
        <li>✅ 修改 package.json 中的插件信息</li>
        <li>✅ 在 src/App.vue 中编写你的插件逻辑</li>
        <li>✅ 运行 pnpm run dev 进行开发</li>
        <li>✅ 运行 pnpm run build 构建插件</li>
        <li>✅ 运行 pnpm run package 打包插件</li>
      </ul>
    </div>

    <div class="mt-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-3 text-xl font-semibold text-card-foreground">Vue Sonner 示例</h2>
      <div class="flex gap-2">
        <button
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="showToast"
        >
          成功提示
        </button>
        <button
          class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          @click="showErrorToast"
        >
          错误提示
        </button>
        <button
          class="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
          @click="showInfoToast"
        >
          信息提示
        </button>
      </div>
    </div>
  </div>
</template>
