<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { pluginStorage } from '@/plugins/marketplace/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const emit = defineEmits<{
  close: []
}>()

// ESC 键关闭对话框
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const activeTab = ref<'install' | 'installed'>('install')
const installUrl = ref('')
const installing = ref(false)
const error = ref('')
const success = ref('')

// 已安装的插件
const installedPlugins = computed(() => pluginStorage.getInstalledPlugins())

// 从 URL 安装
const installFromUrl = async (): Promise<void> => {
  if (!installUrl.value.trim()) {
    error.value = '请输入插件 URL'
    return
  }
  
  try {
    installing.value = true
    error.value = ''
    success.value = ''
    
    await pluginInstaller.installFromUrl(installUrl.value)
    
    success.value = '✅ 插件安装成功！'
    installUrl.value = ''
    
    // 5秒后清除成功消息并刷新
    setTimeout(() => {
      success.value = ''
      window.location.reload()
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '安装失败'
  } finally {
    installing.value = false
  }
}

// 卸载插件
const uninstallPlugin = async (pluginId: string): Promise<void> => {
  try {
    await pluginInstaller.uninstall(pluginId)
    success.value = '✅ 插件已卸载！'
    
    // 刷新页面以重新加载插件列表
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '卸载失败'
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取来源标签
const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    official: '官方',
    url: '第三方',
    local: '本地'
  }
  return labels[source] || source
}
</script>

<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-4xl max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>插件商店</DialogTitle>
        <DialogDescription>
          安装和管理第三方插件
        </DialogDescription>
      </DialogHeader>

      <!-- 标签页 -->
      <Tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="install">安装插件</TabsTrigger>
          <TabsTrigger value="installed">已安装 ({{ installedPlugins.length }})</TabsTrigger>
        </TabsList>

        <!-- 安装插件标签页 -->
        <TabsContent value="install" class="flex-1 overflow-y-auto space-y-6 mt-4">
          <!-- 从 URL 安装 -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              从 URL 安装插件
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              输入插件 ZIP 文件的 URL（支持纯前端和带 Rust 后端的插件）
            </p>
            
            <div class="flex gap-3">
              <Input
                v-model="installUrl"
                placeholder="http://localhost:8080/plugin.zip"
                class="flex-1"
                :disabled="installing"
              />
              <Button
                @click="installFromUrl"
                :disabled="installing || !installUrl.trim()"
              >
                {{ installing ? '安装中...' : '安装' }}
              </Button>
            </div>
            
            <!-- 成功消息 -->
            <div v-if="success" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm text-green-900 dark:text-green-100">{{ success }}</span>
            </div>
            
            <!-- 错误消息 -->
            <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-red-900 dark:text-red-100">{{ error }}</span>
            </div>
          </div>

          <!-- 插件开发指南 -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              开发者指南
            </h3>
            <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">
              想要开发自己的插件？查看我们的文档：
            </p>
            <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>完整指南：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">PLUGIN_GUIDE.md</code></li>
              <li>示例代码：<code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">examples/</code></li>
            </ul>
          </div>
        </TabsContent>

        <!-- 已安装插件标签页 -->
        <TabsContent value="installed" class="flex-1 overflow-y-auto mt-4">
          <div v-if="installedPlugins.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400">还没有安装任何第三方插件</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="plugin in installedPlugins"
              :key="plugin.id"
              class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ plugin.id }}
                  </h4>
                  <Badge variant="secondary" class="text-xs">
                    v{{ plugin.version }}
                  </Badge>
                  <Badge variant="outline" class="text-xs">
                    {{ getSourceLabel(plugin.source) }}
                  </Badge>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  安装于 {{ formatDate(plugin.installedAt) }}
                </p>
                <p v-if="plugin.sourceUrl" class="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                  {{ plugin.sourceUrl }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <Button
                @click="uninstallPlugin(plugin.id)"
                size="sm"
                variant="destructive"
              >
                卸载
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="flex items-center justify-between">
        <p class="text-xs text-gray-500 dark:text-gray-500">
          ⚠️ 仅安装来自可信来源的插件
        </p>
        <Button @click="emit('close')" variant="outline">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
