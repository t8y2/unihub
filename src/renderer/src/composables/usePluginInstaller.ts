/**
 * 插件安装 Composable
 * 统一管理插件安装逻辑
 */

import { ref, Ref } from 'vue'
import { pluginInstaller } from '@/plugins/marketplace/installer'
import { toast } from 'vue-sonner'

export function usePluginInstaller(): {
  installing: Ref<boolean>
  installFromUrl: (url: string) => Promise<boolean>
  installFromFile: (file: File) => Promise<boolean>
  uninstall: (pluginId: string) => Promise<boolean>
  reload: () => Promise<void>
} {
  const installing = ref(false)

  // 从 URL 安装
  const installFromUrl = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      toast.error('请输入插件 URL')
      return false
    }

    try {
      installing.value = true
      await pluginInstaller.installFromUrl(url)
      toast.success('插件安装成功！')
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '安装失败')
      return false
    } finally {
      installing.value = false
    }
  }

  // 从文件安装
  const installFromFile = async (file: File): Promise<boolean> => {
    if (!file.name.endsWith('.zip')) {
      toast.error('只支持 .zip 格式的插件文件')
      return false
    }

    try {
      installing.value = true
      await pluginInstaller.installFromFile(file)
      toast.success('插件安装成功！')
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '安装失败')
      return false
    } finally {
      installing.value = false
    }
  }

  // 卸载插件
  const uninstall = async (pluginId: string): Promise<boolean> => {
    try {
      await pluginInstaller.uninstall(pluginId)
      toast.success('插件已卸载')
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '卸载失败')
      return false
    }
  }

  // 重新加载插件
  const reload = async (): Promise<void> => {
    try {
      await pluginInstaller.loadInstalledPlugins()
    } catch (error) {
      console.error('重新加载插件失败:', error)
    }
  }

  return {
    installing,
    installFromUrl,
    installFromFile,
    uninstall,
    reload
  }
}
