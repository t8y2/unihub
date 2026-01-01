/**
 * 主题管理 Composable
 */

import { ref } from 'vue'
import { STORAGE_KEYS } from '@/constants'

export type Theme = 'light' | 'dark' | 'system'

export function useTheme(): {
  isDark: ReturnType<typeof ref<boolean>>
  initTheme: () => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  watchSystemTheme: () => void
} {
  const isDark = ref(false)

  // 初始化主题
  const initTheme = (): void => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
    if (savedTheme === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  }

  // 切换主题
  const toggleTheme = (): void => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem(STORAGE_KEYS.THEME, isDark.value ? 'dark' : 'light')
  }

  // 设置主题
  const setTheme = (theme: Theme): void => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = theme === 'dark'
    }

    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }

  // 监听系统主题变化
  const watchSystemTheme = (): void => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
      if (savedTheme === 'system') {
        isDark.value = e.matches
        document.documentElement.classList.toggle('dark', e.matches)
      }
    })
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
    watchSystemTheme
  }
}
