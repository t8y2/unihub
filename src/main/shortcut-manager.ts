import { globalShortcut, BrowserWindow } from 'electron'
import { createLogger } from '../shared/logger'

const logger = createLogger('shortcut-manager')

/**
 * 快捷键管理器
 * 管理全局快捷键和插件快捷键
 */

interface ShortcutHandler {
  pluginId: string
  accelerator: string
  callback: () => void
}

export class ShortcutManager {
  private shortcuts = new Map<string, ShortcutHandler>()
  private mainWindow: BrowserWindow | null = null

  /**
   * 设置主窗口
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 注册全局快捷键（优化版本）
   */
  register(pluginId: string, accelerator: string, callback: () => void): boolean {
    try {
      // 检查快捷键是否已被占用
      if (this.shortcuts.has(accelerator)) {
        logger.warn({ accelerator }, '⚠快捷键已被占用')
        return false
      }

      // 创建优化的回调函数（减少闭包开销）
      const optimizedCallback = (): void => {
        // 使用 setImmediate 确保快捷键响应不阻塞
        setImmediate(() => {
          try {
            callback()
          } catch (error) {
            logger.error({ err: error, accelerator }, '快捷键回调执行失败')
          }
        })
      }

      // 注册全局快捷键
      const success = globalShortcut.register(accelerator, optimizedCallback)

      if (success) {
        this.shortcuts.set(accelerator, { pluginId, accelerator, callback: optimizedCallback })
        logger.info({ accelerator, pluginId }, '已注册快捷键')
        return true
      } else {
        logger.warn({ accelerator }, '⚠注册快捷键失败')
        return false
      }
    } catch (error) {
      logger.error({ err: error, accelerator }, '注册快捷键失败')
      return false
    }
  }

  /**
   * 取消注册快捷键
   */
  unregister(accelerator: string): boolean {
    try {
      const handler = this.shortcuts.get(accelerator)
      if (!handler) {
        logger.warn({ accelerator }, '⚠快捷键未注册')
        return false
      }

      globalShortcut.unregister(accelerator)
      this.shortcuts.delete(accelerator)
      logger.info({ accelerator }, '已取消注册快捷键')
      return true
    } catch (error) {
      logger.error({ err: error, accelerator }, '取消注册快捷键失败')
      return false
    }
  }

  /**
   * 取消注册插件的所有快捷键
   */
  unregisterPlugin(pluginId: string): void {
    const toRemove: string[] = []

    this.shortcuts.forEach((handler, accelerator) => {
      if (handler.pluginId === pluginId) {
        toRemove.push(accelerator)
      }
    })

    toRemove.forEach((accelerator) => {
      this.unregister(accelerator)
    })

    logger.info({ pluginId }, '已取消插件的所有快捷键')
  }

  /**
   * 获取插件的所有快捷键
   */
  getPluginShortcuts(pluginId: string): string[] {
    const shortcuts: string[] = []

    this.shortcuts.forEach((handler, accelerator) => {
      if (handler.pluginId === pluginId) {
        shortcuts.push(accelerator)
      }
    })

    return shortcuts
  }

  /**
   * 获取所有已注册的快捷键
   */
  getAllShortcuts(): Array<{ pluginId: string; accelerator: string }> {
    return Array.from(this.shortcuts.values()).map((handler) => ({
      pluginId: handler.pluginId,
      accelerator: handler.accelerator
    }))
  }

  /**
   * 检查快捷键是否已被占用
   */
  isRegistered(accelerator: string): boolean {
    return this.shortcuts.has(accelerator)
  }

  /**
   * 清理所有快捷键
   */
  cleanup(): void {
    globalShortcut.unregisterAll()
    this.shortcuts.clear()
    logger.info('已清理所有快捷键')
  }

  /**
   * 显示/隐藏主窗口
   */
  /**
   * 显示/隐藏主窗口
   */
  toggleMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      logger.warn('⚠主窗口已销毁，无法切换显示状态')
      return
    }

    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }
}

export const shortcutManager = new ShortcutManager()
