import './style.css'

import { createApp } from 'vue'
import App from './App.vue'
import SearchWindow from './pages/SearchWindow.vue'
import { initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'

// 根据 hash 决定加载哪个组件
const hash = window.location.hash.slice(1) // 移除 #
const isSearchWindow = hash === '/search'

const app = createApp(isSearchWindow ? SearchWindow : App)

// 初始化插件系统
initPlugins()

// 加载已安装的插件
pluginInstaller.loadInstalledPlugins().catch((error) => {
  console.error('加载插件失败:', error)
})

app.mount('#app')
