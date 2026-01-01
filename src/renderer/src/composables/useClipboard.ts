/**
 * 剪贴板操作 Composable
 */

import { toast } from 'vue-sonner'

export function useClipboard(): {
  copy: (text: string, successMessage?: string) => Promise<void>
  paste: () => Promise<string>
} {
  /**
   * 复制文本到剪贴板
   */
  const copy = async (text: string, successMessage = '已复制到剪贴板'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  /**
   * 从剪贴板粘贴文本
   */
  const paste = async (): Promise<string> => {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('粘贴失败:', error)
      toast.error('粘贴失败')
      return ''
    }
  }

  return {
    copy,
    paste
  }
}
