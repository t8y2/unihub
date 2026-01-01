/**
 * LocalStorage Composable
 * 提供类型安全的 localStorage 操作
 */

import { ref, watch, Ref } from 'vue'
import { safeJsonParse } from '@/utils'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  // 从 localStorage 读取初始值
  const storedValue = localStorage.getItem(key)
  const data = ref<T>(
    storedValue !== null ? safeJsonParse(storedValue, defaultValue) : defaultValue
  ) as Ref<T>

  // 监听变化并保存到 localStorage
  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`保存到 localStorage 失败 (${key}):`, error)
      }
    },
    { deep: true }
  )

  return data
}

/**
 * 简单的字符串存储
 */
export function useLocalStorageString(key: string, defaultValue: string = ''): Ref<string> {
  const data = ref(localStorage.getItem(key) || defaultValue)

  watch(data, (newValue) => {
    localStorage.setItem(key, newValue)
  })

  return data
}

/**
 * 布尔值存储
 */
export function useLocalStorageBoolean(key: string, defaultValue: boolean = false): Ref<boolean> {
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue !== null ? storedValue === 'true' : defaultValue)

  watch(data, (newValue) => {
    localStorage.setItem(key, String(newValue))
  })

  return data
}
