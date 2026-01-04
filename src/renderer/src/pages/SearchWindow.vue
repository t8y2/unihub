<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlobalSearch from '../components/GlobalSearch.vue'

const showSearch = ref(true)

const handleOpenPlugin = async (pluginId: string): Promise<void> => {
  await window.api.search.openPlugin(pluginId)
}

const handleClose = async (): Promise<void> => {
  await window.api.search.close()
}

onMounted(() => {
  // 监听聚焦事件
  window.electron.ipcRenderer.on('focus-search-input', () => {
    showSearch.value = false
    setTimeout(() => {
      showSearch.value = true
    }, 10)
  })
})
</script>

<template>
  <div class="w-full h-screen overflow-hidden">
    <GlobalSearch
      :visible="showSearch"
      :standalone="true"
      @open-plugin="handleOpenPlugin"
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
