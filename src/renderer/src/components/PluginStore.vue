<script setup lang="ts">
import { ref } from 'vue'
import PluginMarketplace from './PluginMarketplace.vue'
import { Button } from '@/components/ui/button'

const activeTab = ref<'marketplace' | 'local'>('marketplace')
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 标签页 -->
    <div class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
      <div class="flex gap-1 p-2">
        <Button
          :variant="activeTab === 'marketplace' ? 'default' : 'ghost'"
          @click="activeTab = 'marketplace'"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          插件市场
        </Button>

        <Button
          :variant="activeTab === 'local' ? 'default' : 'ghost'"
          @click="activeTab = 'local'"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          本地安装
        </Button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-hidden">
      <!-- 插件市场 -->
      <PluginMarketplace v-if="activeTab === 'marketplace'" />

      <!-- 本地安装 -->
      <div v-else class="h-full flex items-center justify-center p-6">
        <div class="text-center max-w-md">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            从本地安装插件
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            选择一个 .zip 格式的插件包进行安装
          </p>
          <Button @click="selectLocalPlugin">选择文件</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    async selectLocalPlugin() {
      // 创建文件选择器
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.zip'

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = new Uint8Array(arrayBuffer)

          const result = await window.api.plugin.installFromBuffer(
            Array.from(buffer),
            file.name
          )

          if (result.success) {
            alert(`✅ ${file.name} 安装成功！`)
          } else {
            alert(`❌ 安装失败: ${result.message}`)
          }
        } catch (error) {
          alert(`❌ 安装失败: ${(error as Error).message}`)
        }
      }

      input.click()
    }
  }
}
</script>
