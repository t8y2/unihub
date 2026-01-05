<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const emit = defineEmits<{
  close: []
}>()

const pluginId = ref('')
const devUrl = ref('http://localhost:5173')
const autoReload = ref(true)
const devPlugins = ref<Array<{ id: string; url: string; autoReload: boolean }>>([])
const loading = ref(false)
const message = ref('')

// 加载开发模式插件列表
const loadDevPlugins = async (): Promise<void> => {
  try {
    const result = await window.api.plugin.dev.list()
    if (result.success && result.data) {
      devPlugins.value = result.data.map((item) => ({
        id: item.pluginId,
        url: item.devUrl,
        autoReload: item.autoReload
      }))
    }
  } catch (error) {
    console.error('加载开发模式插件失败:', error)
  }
}

// 注册开发模式插件
const registerDevPlugin = async (): Promise<void> => {
  if (!pluginId.value.trim() || !devUrl.value.trim()) {
    message.value = '请填写插件 ID 和开发服务器 URL'
    return
  }

  loading.value = true
  message.value = ''

  try {
    const result = await window.api.plugin.dev.register(
      pluginId.value.trim(),
      devUrl.value.trim(),
      autoReload.value
    )

    if (result.success) {
      message.value = `✅ 已注册开发模式: ${pluginId.value}`
      pluginId.value = ''
      await loadDevPlugins()
    } else {
      message.value = `❌ 注册失败: ${result.error}`
    }
  } catch (error) {
    message.value = `❌ 注册失败: ${error}`
  } finally {
    loading.value = false
  }
}

// 取消注册开发模式插件
const unregisterDevPlugin = async (id: string): Promise<void> => {
  try {
    const result = await window.api.plugin.dev.unregister(id)
    if (result.success) {
      message.value = `✅ 已取消开发模式: ${id}`
      await loadDevPlugins()
    }
  } catch (error) {
    message.value = `❌ 取消失败: ${error}`
  }
}

onMounted(() => {
  loadDevPlugins()
})
</script>

<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>插件开发模式</DialogTitle>
        <DialogDescription>
          在开发模式下，插件会直接加载开发服务器的内容，支持热重载
        </DialogDescription>
      </DialogHeader>

      <!-- 注册表单 -->
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">插件 ID</label>
          <Input v-model="pluginId" placeholder="com.example.myplugin" :disabled="loading" />
          <p class="text-xs text-gray-500">
            插件的唯一标识符，需要与 package.json 中的 unihub.id 一致
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">开发服务器 URL</label>
          <Input v-model="devUrl" placeholder="http://localhost:5173" :disabled="loading" />
          <p class="text-xs text-gray-500">Vite 开发服务器的地址，通常是 http://localhost:5173</p>
        </div>

        <div class="flex items-center gap-2">
          <input
            id="autoReload"
            v-model="autoReload"
            type="checkbox"
            class="w-4 h-4"
            :disabled="loading"
          />
          <label for="autoReload" class="text-sm"> 自动重载（文件变化时自动刷新） </label>
        </div>

        <Button :disabled="loading" class="w-full" @click="registerDevPlugin">
          {{ loading ? '注册中...' : '注册开发模式' }}
        </Button>

        <p
          v-if="message"
          class="text-sm"
          :class="message.startsWith('✅') ? 'text-green-600' : 'text-red-600'"
        >
          {{ message }}
        </p>
      </div>

      <!-- 已注册的开发模式插件 -->
      <div v-if="devPlugins.length > 0" class="border-t pt-4">
        <h3 class="text-sm font-semibold mb-3">已注册的开发模式插件</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="plugin in devPlugins"
            :key="plugin.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <Badge variant="secondary" class="text-xs">DEV</Badge>
                <span class="text-sm font-medium truncate">{{ plugin.id }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 truncate">{{ plugin.url }}</p>
            </div>
            <Button variant="ghost" size="sm" class="ml-2" @click="unregisterDevPlugin(plugin.id)">
              取消
            </Button>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="border-t pt-4 text-xs text-gray-600 dark:text-gray-400 space-y-2">
        <p><strong>使用步骤：</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>
            在插件目录运行
            <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run dev</code>
          </li>
          <li>在上方输入插件 ID 和开发服务器 URL</li>
          <li>点击"注册开发模式"</li>
          <li>在主界面打开插件，即可看到开发服务器的内容</li>
          <li>修改代码后，插件会自动刷新（如果启用了自动重载）</li>
        </ol>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
