import './style.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initPlugins } from './plugins'
import { pluginInstaller } from './plugins/marketplace/installer'

const app = createApp(App)

// 初始化插件系统
initPlugins()

// 加载已安装的插件
pluginInstaller.loadInstalledPlugins().catch((error) => {
  console.error('加载插件失败:', error)
})

app.mount('#app')
