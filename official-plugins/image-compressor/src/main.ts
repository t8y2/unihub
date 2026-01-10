import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// ============================================
// 主题同步（深色模式支持）
// ============================================
const syncTheme = () => {
  const theme = localStorage.getItem('unihub-theme')
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

syncTheme()

if (window.electron?.ipcRenderer) {
  window.electron.ipcRenderer.on('theme-changed', (_event: unknown, ...args: unknown[]) => {
    const theme = args[0] as 'light' | 'dark'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  })
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const theme = localStorage.getItem('unihub-theme')
  if (theme === 'system') {
    syncTheme()
  }
})
