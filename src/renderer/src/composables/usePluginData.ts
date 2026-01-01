/**
 * 插件数据管理 Composable
 * 统一管理收藏和最近访问
 */

import { ref, Ref } from 'vue'
import { LIMITS } from '@/constants'

interface PluginDataItem {
  pluginId: string
  [key: string]: unknown
}

export function usePluginData(): {
  recentPlugins: Ref<string[]>
  favoritePlugins: Ref<string[]>
  loadAll: () => Promise<void>
  addRecent: (pluginId: string) => Promise<void>
  toggleFavorite: (pluginId: string) => Promise<void>
  isFavorite: (pluginId: string) => boolean
} {
  const recentPlugins = ref<string[]>([])
  const favoritePlugins = ref<string[]>([])

  // 加载插件列表数据
  const loadPluginList = async (
    type: 'recents' | 'favorites',
    limit?: number
  ): Promise<string[]> => {
    const data =
      type === 'recents'
        ? await window.api.db.getRecents(limit || LIMITS.RECENT_PLUGINS)
        : await window.api.db.getFavorites()
    return data.map((item: PluginDataItem) => item.pluginId)
  }

  // 加载所有数据
  const loadAll = async (): Promise<void> => {
    try {
      ;[recentPlugins.value, favoritePlugins.value] = await Promise.all([
        loadPluginList('recents'),
        loadPluginList('favorites')
      ])
    } catch (error) {
      console.error('加载插件数据失败:', error)
    }
  }

  // 添加到最近访问
  const addRecent = async (pluginId: string): Promise<void> => {
    try {
      await window.api.db.addRecent(pluginId)
      recentPlugins.value = await loadPluginList('recents')
    } catch (error) {
      console.error('添加最近访问失败:', error)
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (pluginId: string): Promise<void> => {
    try {
      const isFav = await window.api.db.isFavorite(pluginId)
      await (isFav ? window.api.db.removeFavorite(pluginId) : window.api.db.addFavorite(pluginId))
      favoritePlugins.value = await loadPluginList('favorites')
    } catch (error) {
      console.error('切换收藏失败:', error)
    }
  }

  // 检查是否收藏
  const isFavorite = (pluginId: string): boolean => {
    return favoritePlugins.value.includes(pluginId)
  }

  return {
    recentPlugins,
    favoritePlugins,
    loadAll,
    addRecent,
    toggleFavorite,
    isFavorite
  }
}
