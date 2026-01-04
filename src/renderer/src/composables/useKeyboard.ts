/**
 * 优化的键盘快捷键处理 Hook
 * 减少事件处理开销，提升响应速度
 */

import { onMounted, onUnmounted } from 'vue'

type KeyHandler = () => void
type KeyMap = Record<string, KeyHandler>

/**
 * 键盘快捷键 Hook（优化版）
 * @param keyMap 键映射表
 * @param shouldHandle 是否应该处理快捷键的判断函数
 */
export function useKeyboard(keyMap: KeyMap, shouldHandle?: () => boolean): void {
  // 预编译键映射，减少运行时查找开销
  const compiledKeyMap = new Map<string, KeyHandler>()
  for (const [key, handler] of Object.entries(keyMap)) {
    compiledKeyMap.set(key.toLowerCase(), handler)
  }

  // 优化的事件处理器
  const handleKeyDown = (e: KeyboardEvent): void => {
    // 快速检查是否应该处理
    if (shouldHandle && !shouldHandle()) {
      return
    }

    // 检查是否是 Cmd/Ctrl + 键
    const isCmdOrCtrl = e.metaKey || e.ctrlKey
    if (!isCmdOrCtrl) {
      return
    }

    // 快速查找处理器
    const key = e.key.toLowerCase()
    const handler = compiledKeyMap.get(key)

    if (handler) {
      e.preventDefault()
      e.stopPropagation()

      // 使用 requestAnimationFrame 确保不阻塞渲染
      requestAnimationFrame(() => {
        try {
          handler()
        } catch (error) {
          console.error(`[Keyboard] 快捷键处理失败: ${key}`, error)
        }
      })
    }
  }

  onMounted(() => {
    // 使用捕获阶段，确保优先处理
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, { capture: true })
  })
}
