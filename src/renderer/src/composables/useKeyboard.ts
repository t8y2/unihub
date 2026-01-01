/**
 * 键盘快捷键 Composable
 */

import { onMounted, onUnmounted } from 'vue'

export type ShortcutHandler = () => void
export type ShortcutMap = Record<string, ShortcutHandler>

export function useKeyboard(
  shortcuts: ShortcutMap,
  shouldHandle?: () => boolean
): {
  handleKeyDown: (e: KeyboardEvent) => void
} {
  const handleKeyDown = (e: KeyboardEvent): void => {
    // 检查是否应该处理快捷键
    if (shouldHandle && !shouldHandle()) return

    const isMod = e.metaKey || e.ctrlKey
    if (!isMod) return

    const handler = shortcuts[e.key]
    if (handler) {
      e.preventDefault()
      handler()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return { handleKeyDown }
}
