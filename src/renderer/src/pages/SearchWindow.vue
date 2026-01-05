<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import GlobalSearch from '../components/GlobalSearch.vue'

const showSearch = ref(true)
const searchKey = ref(0) // 用于强制重新渲染

const handleOpenPlugin = async (pluginId: string): Promise<void> => {
  await window.api.search.openPlugin(pluginId)
}

const handleOpenApp = async (appPath: string): Promise<void> => {
  try {
    await window.api.apps.open(appPath)
    await window.api.search.close()
  } catch (error) {
    console.error('[SearchWindow] 打开应用失败:', error)
  }
}

const handleClose = async (): Promise<void> => {
  await window.api.search.close()
}

onMounted(() => {
  // 监听聚焦事件
  window.electron.ipcRenderer.on('focus-search-input', () => {
    console.log('[SearchWindow] 收到聚焦事件')
    // 强制重新渲染组件以触发自动聚焦
    searchKey.value++
  })

  // 初始聚焦
  nextTick(() => {
    console.log('[SearchWindow] 初始聚焦')
  })
})
</script>

<template>
  <div class="w-full h-screen overflow-hidden">
    <GlobalSearch
      :key="searchKey"
      :visible="showSearch"
      :standalone="true"
      @open-plugin="handleOpenPlugin"
      @open-app="handleOpenApp"
      @close="handleClose"
    />
  </div>
</template>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
