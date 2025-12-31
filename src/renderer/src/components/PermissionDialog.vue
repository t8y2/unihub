<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  visible: boolean
  pluginName: string
  permissions: string[]
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// 权限描述映射
const permissionDescriptions: Record<string, { name: string; description: string; icon: string }> =
  {
    fs: {
      name: '文件系统访问',
      description: '读写文件、创建目录',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
    },
    clipboard: {
      name: '剪贴板访问',
      description: '读写剪贴板内容（文本和图片）',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    http: {
      name: 'HTTP 请求',
      description: '访问网络资源，发起 HTTP 请求',
      icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
    },
    notification: {
      name: '系统通知',
      description: '显示系统通知消息',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    },
    spawn: {
      name: '子进程执行',
      description: '运行 Sidecar 程序（Go/Rust/C++）',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    },
    system: {
      name: '系统信息',
      description: '访问系统信息（平台、路径等）',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    }
  }

// 获取权限信息
const permissionInfo = computed(() => {
  return props.permissions.map((permission) => {
    return (
      permissionDescriptions[permission] || {
        name: permission,
        description: '未知权限',
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    )
  })
})

// 风险等级
const riskLevel = computed(() => {
  const highRiskPermissions = ['fs', 'spawn']
  const hasHighRisk = props.permissions.some((p) => highRiskPermissions.includes(p))

  if (hasHighRisk) {
    return {
      level: 'high',
      text: '高风险',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  } else if (props.permissions.length > 2) {
    return {
      level: 'medium',
      text: '中风险',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  } else {
    return {
      level: 'low',
      text: '低风险',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  }
})
</script>

<template>
  <Dialog :open="visible" @update:open="(open) => !open && emit('cancel')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>权限请求</DialogTitle>
        <DialogDescription>
          插件 <strong>{{ pluginName }}</strong> 请求以下权限
        </DialogDescription>
      </DialogHeader>

      <!-- 风险等级 -->
      <div :class="['px-3 py-2 rounded-lg', riskLevel.bgColor]">
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 flex-shrink-0"
            :class="riskLevel.color"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span :class="['text-sm font-medium', riskLevel.color]">
            {{ riskLevel.text }}权限请求
          </span>
        </div>
      </div>

      <!-- 权限列表 -->
      <div class="space-y-3 max-h-64 overflow-y-auto">
        <div
          v-for="(info, index) in permissionInfo"
          :key="index"
          class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0"
          >
            <svg
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="info.icon"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ info.name }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ info.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 警告提示 -->
      <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>⚠️ 请仅安装来自可信来源的插件</p>
        <p>💡 插件只能访问其自身目录内的文件</p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('cancel')">取消</Button>
        <Button @click="emit('confirm')">允许并安装</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
