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
 * @param shouldHandle 是否应该处理快捷键的判断函数（可选，接收按键作为参数）
 */
export function useKeyboard(keyMap: KeyMap, shouldHandle?: (key?: string) => boolean): void {
  // 预编译键映射，减少运行时查找开销
  const compiledKeyMap = new Map<string, KeyHandler>()
  for (const [key, handler] of Object.entries(keyMap)) {
    compiledKeyMap.set(key.toLowerCase(), handler)
  }

  // 优化的事件处理器
  const handleKeyDown = (e: KeyboardEvent): void => {
    // 检查是否是 Cmd/Ctrl + 键
    const isCmdOrCtrl = e.metaKey || e.ctrlKey
    if (!isCmdOrCtrl) {
      return
    }

    // 快速查找处理器
    const key = e.key.toLowerCase()
    const handler = compiledKeyMap.get(key)

    if (!handler) {
      return
    }

    // 调试日志
    console.log(
      '[useKeyboard] 检测到快捷键:',
      key,
      '是否应该处理:',
      shouldHandle ? shouldHandle(key) : true
    )

    // 快速检查是否应该处理（传入按键参数）
    if (shouldHandle && !shouldHandle(key)) {
      console.log('[useKeyboard] 快捷键被 shouldHandle 拒绝')
      return
    }

    console.log('[useKeyboard] 处理快捷键:', key)
    e.preventDefault()
    e.stopPropagation()

    // 直接执行，不使用 requestAnimationFrame 以提高响应速度
    try {
      handler()
    } catch (error) {
      console.error(`[Keyboard] 快捷键处理失败: ${key}`, error)
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
