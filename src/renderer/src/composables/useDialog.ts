/**
 * 对话框管理 Composable
 * 简化对话框状态管理
 */

import { ref, Ref } from 'vue'

export function useDialog<T = unknown>(): {
  visible: Ref<boolean>
  data: Ref<T | null>
  open: (payload?: T) => void
  close: () => void
  toggle: () => void
} {
  const visible = ref(false)
  const data = ref<T | null>(null)

  const open = (payload?: T): void => {
    data.value = payload || null
    visible.value = true
  }

  const close = (): void => {
    visible.value = false
    // 延迟清空数据，避免关闭动画时数据消失
    setTimeout(() => {
      data.value = null
    }, 300)
  }

  const toggle = (): void => {
    visible.value ? close() : open()
  }

  return {
    visible,
    data,
    open,
    close,
    toggle
  }
}
