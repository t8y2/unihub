<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-vue-next'

const { toasts } = useToast()

const getIcon = (type: string): typeof CheckCircle2 => {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return XCircle
    case 'warning':
      return AlertCircle
    default:
      return Info
  }
}

const getIconColorClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    default:
      return 'text-blue-600'
  }
}
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-foreground shadow-lg border border-border/50 backdrop-blur-sm"
      >
        <component
          :is="getIcon(toast.type)"
          :size="20"
          :class="['flex-shrink-0', getIconColorClass(toast.type)]"
        />
        <span class="text-sm font-medium">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-leave-active {
  transition: all 0.2s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-100%) scale(0.6);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
