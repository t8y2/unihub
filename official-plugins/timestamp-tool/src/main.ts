import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// 新增：同步主应用的深色模式
const syncTheme = () => {
  const theme = localStorage.getItem('unihub-theme')
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  document.documentElement.classList.toggle('dark', isDark)
  console.log('[时间戳插件] 主题已同步:', isDark ? 'dark' : 'light')
}

// 新增：初始化主题
syncTheme()

// 新增：监听主应用主题变化
if (window.electron?.ipcRenderer) {
  window.electron.ipcRenderer.on('theme-changed', (_event: unknown, ...args: unknown[]) => {
    const theme = args[0] as 'light' | 'dark'
    console.log('[时间戳插件] 收到主题变化通知:', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  })
}

// 新增：系统主题变化时同步（主应用为 system）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const theme = localStorage.getItem('unihub-theme')
  if (theme === 'system') {
    syncTheme()
  }
})
