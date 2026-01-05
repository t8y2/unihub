import { ref, computed, type ComputedRef } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let toastId = 0
const MAX_TOASTS = 3 // 最多同时显示3个

export function useToast(): {
  toasts: ComputedRef<Toast[]>
  show: (message: string, type?: Toast['type'], duration?: number) => string
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  remove: (id: string) => void
} {
  const show = (message: string, type: Toast['type'] = 'info', duration = 2000): string => {
    // 检查是否已经有相同的消息
    const existingToast = toasts.value.find((t) => t.message === message && t.type === type)
    if (existingToast) {
      return existingToast.id
    }

    const id = `toast-${toastId++}`
    const toast: Toast = { id, message, type, duration }

    // 如果超过最大数量，移除最旧的
    if (toasts.value.length >= MAX_TOASTS) {
      toasts.value.shift()
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: string): void => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number): string => show(message, 'success', duration)
  const error = (message: string, duration?: number): string => show(message, 'error', duration)
  const warning = (message: string, duration?: number): string => show(message, 'warning', duration)
  const info = (message: string, duration?: number): string => show(message, 'info', duration)

  return {
    toasts: computed(() => toasts.value),
    show,
    success,
    error,
    warning,
    info,
    remove
  }
}
