<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PluginDataInfo {
  pluginId: string
  pluginName: string
  dataSize: number
  fileCount: number
  lastModified: string
}

interface BackupInfo {
  id: string
  pluginId: string
  pluginName: string
  createdAt: string
  size: number
  fileCount: number
}

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('data')
const pluginsData = ref<PluginDataInfo[]>([])
const backups = ref<BackupInfo[]>([])
const loading = ref(false)

// 确认对话框
const showConfirmDialog = ref(false)
const confirmAction = ref<{
  type: 'backup' | 'restore' | 'delete' | 'clear' | 'cleanup'
  title: string
  description: string
  onConfirm: () => Promise<void>
} | null>(null)

// 加载数据
const loadData = async (): Promise<void> => {
  try {
    loading.value = true
    const [dataInfo, backupList] = await Promise.all([
      window.api.pluginData.getAllInfo(),
      window.api.pluginData.getAllBackups()
    ])
    pluginsData.value = dataInfo
    backups.value = backupList
  } catch (error) {
    toast.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算总数据大小
const totalDataSize = computed(() => {
  return pluginsData.value.reduce((sum, p) => sum + p.dataSize, 0)
})

// 计算总备份大小
const totalBackupSize = computed(() => {
  return backups.value.reduce((sum, b) => sum + b.size, 0)
})

// 备份插件数据
const backupPlugin = (pluginId: string, pluginName: string): void => {
  confirmAction.value = {
    type: 'backup',
    title: '备份插件数据',
    description: `确定要备份插件 "${pluginName}" 的数据吗？`,
    onConfirm: async () => {
      try {
        const result = await window.api.pluginData.backup(pluginId)
        if (result.success) {
          toast.success(result.message)
          await loadData()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('备份失败')
        console.error(error)
      }
    }
  }
  showConfirmDialog.value = true
}

// 恢复备份
const restoreBackup = (backupId: string, pluginName: string): void => {
  confirmAction.value = {
    type: 'restore',
    title: '恢复备份',
    description: `确定要恢复插件 "${pluginName}" 的备份吗？当前数据将被覆盖。`,
    onConfirm: async () => {
      try {
        const result = await window.api.pluginData.restore(backupId)
        if (result.success) {
          toast.success(result.message)
          await loadData()
          // 触发插件重新加载
          window.dispatchEvent(new CustomEvent('plugin-data-restored'))
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('恢复失败')
        console.error(error)
      }
    }
  }
  showConfirmDialog.value = true
}

// 删除备份
const deleteBackup = (backupId: string, pluginName: string): void => {
  confirmAction.value = {
    type: 'delete',
    title: '删除备份',
    description: `确定要删除插件 "${pluginName}" 的备份吗？此操作无法撤销。`,
    onConfirm: async () => {
      try {
        const result = await window.api.pluginData.deleteBackup(backupId)
        if (result.success) {
          toast.success(result.message)
          await loadData()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('删除失败')
        console.error(error)
      }
    }
  }
  showConfirmDialog.value = true
}

// 清理插件数据
const clearPluginData = (pluginId: string, pluginName: string): void => {
  confirmAction.value = {
    type: 'clear',
    title: '清理插件数据',
    description: `确定要清理插件 "${pluginName}" 的所有数据吗？此操作无法撤销。`,
    onConfirm: async () => {
      try {
        const result = await window.api.pluginData.clear(pluginId)
        if (result.success) {
          toast.success(result.message)
          await loadData()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('清理失败')
        console.error(error)
      }
    }
  }
  showConfirmDialog.value = true
}

// 清理过期备份
const cleanupOldBackups = (): void => {
  confirmAction.value = {
    type: 'cleanup',
    title: '清理过期备份',
    description: '确定要清理 30 天前的备份吗？此操作无法撤销。',
    onConfirm: async () => {
      try {
        const result = await window.api.pluginData.cleanupOldBackups(30)
        if (result.success) {
          toast.success(`${result.message}（${result.deletedCount} 个）`)
          await loadData()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('清理失败')
        console.error(error)
      }
    }
  }
  showConfirmDialog.value = true
}

// 执行确认操作
const executeConfirmAction = async (): Promise<void> => {
  if (confirmAction.value) {
    await confirmAction.value.onConfirm()
    showConfirmDialog.value = false
    confirmAction.value = null
  }
}

// 按插件分组备份
const backupsByPlugin = computed(() => {
  const grouped = new Map<string, BackupInfo[]>()
  for (const backup of backups.value) {
    if (!grouped.has(backup.pluginId)) {
      grouped.set(backup.pluginId, [])
    }
    grouped.get(backup.pluginId)!.push(backup)
  }
  return grouped
})
</script>

<template>
  <Dialog :open="true" @update:open="emit('close')">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>插件数据管理</DialogTitle>
        <DialogDescription> 管理插件数据、备份和恢复 </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="flex-1 min-h-0 flex flex-col">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="data">
            插件数据
            <Badge variant="secondary" class="ml-2">{{ pluginsData.length }}</Badge>
          </TabsTrigger>
          <TabsTrigger value="backups">
            备份管理
            <Badge variant="secondary" class="ml-2">{{ backups.length }}</Badge>
          </TabsTrigger>
        </TabsList>

        <!-- 插件数据标签页 -->
        <TabsContent value="data" class="flex-1 min-h-0 overflow-y-auto mt-4">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div
                class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          </div>

          <div v-else-if="pluginsData.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">暂无插件数据</p>
          </div>

          <div v-else class="space-y-4">
            <!-- 统计信息 -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">总数据大小</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ formatSize(totalDataSize) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600 dark:text-gray-400">插件数量</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ pluginsData.length }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 插件列表 -->
            <div class="space-y-2">
              <div
                v-for="plugin in pluginsData"
                :key="plugin.pluginId"
                class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {{ plugin.pluginName }}
                  </h4>
                  <div class="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{{ formatSize(plugin.dataSize) }}</span>
                    <span>{{ plugin.fileCount }} 个文件</span>
                    <span>{{ formatDate(plugin.lastModified) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="backupPlugin(plugin.pluginId, plugin.pluginName)"
                  >
                    备份
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    @click="clearPluginData(plugin.pluginId, plugin.pluginName)"
                  >
                    清理
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- 备份管理标签页 -->
        <TabsContent value="backups" class="flex-1 min-h-0 overflow-y-auto mt-4">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div
                class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          </div>

          <div v-else-if="backups.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">暂无备份</p>
          </div>

          <div v-else class="space-y-4">
            <!-- 统计信息 -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">总备份大小</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ formatSize(totalBackupSize) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600 dark:text-gray-400">备份数量</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ backups.length }}
                  </p>
                </div>
              </div>
              <div class="mt-4">
                <Button size="sm" variant="outline" @click="cleanupOldBackups">
                  清理过期备份（30天前）
                </Button>
              </div>
            </div>

            <!-- 按插件分组的备份列表 -->
            <div class="space-y-4">
              <div
                v-for="[pluginId, pluginBackups] in backupsByPlugin"
                :key="pluginId"
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div
                  class="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ pluginBackups[0].pluginName }}
                    <Badge variant="secondary" class="ml-2"
                      >{{ pluginBackups.length }} 个备份</Badge
                    >
                  </h4>
                </div>

                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                  <div
                    v-for="backup in pluginBackups"
                    :key="backup.id"
                    class="flex items-center justify-between p-4 bg-white dark:bg-gray-900"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>{{ formatDate(backup.createdAt) }}</span>
                        <span>{{ formatSize(backup.size) }}</span>
                        <span>{{ backup.fileCount }} 个文件</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        @click="restoreBackup(backup.id, backup.pluginName)"
                      >
                        恢复
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        @click="deleteBackup(backup.id, backup.pluginName)"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 确认对话框 -->
  <Dialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ confirmAction?.title }}</DialogTitle>
        <DialogDescription>
          {{ confirmAction?.description }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showConfirmDialog = false">取消</Button>
        <Button
          :variant="
            confirmAction?.type === 'clear' ||
            confirmAction?.type === 'delete' ||
            confirmAction?.type === 'cleanup'
              ? 'destructive'
              : 'default'
          "
          @click="executeConfirmAction"
        >
          确认
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
