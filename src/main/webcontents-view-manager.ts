import { BrowserWindow, WebContentsView } from 'electron'
import { join } from 'path'

/**
 * WebContentsView 管理器
 * 用于在主窗口中嵌入插件视图
 */
export class WebContentsViewManager {
  private views = new Map<string, WebContentsView>()
  private mainWindow: BrowserWindow | null = null

  /**
   * 设置主窗口
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 创建插件视图
   */
  createPluginView(pluginId: string, url: string): WebContentsView {
    // 如果已存在，先移除
    if (this.views.has(pluginId)) {
      this.removePluginView(pluginId)
    }

    // 创建新的 WebContentsView
    const view = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false, // 禁用 sandbox 以支持 preload
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true
      }
    })

    // 在 URL 中添加插件 ID 参数
    const urlWithPluginId = url.includes('?')
      ? `${url}&__plugin_id=${pluginId}`
      : `${url}?__plugin_id=${pluginId}`

    // 加载插件 URL
    view.webContents.loadURL(urlWithPluginId)

    // 在页面加载前注入插件 ID（多重保险）
    view.webContents.on('dom-ready', () => {
      const script = `
        (function() {
          // 从 URL 参数读取
          const params = new URLSearchParams(window.location.search);
          const pluginId = params.get('__plugin_id') || '${pluginId}';
          
          // 设置到 window 对象
          window.__UNIHUB_PLUGIN_ID__ = pluginId;
          console.log('✅ 插件 ID 已注入 (dom-ready):', pluginId);
          
          // 确保在所有脚本执行前设置
          Object.defineProperty(window, '__UNIHUB_PLUGIN_ID__', {
            value: pluginId,
            writable: false,
            configurable: false
          });
        })();
      `

      view.webContents.executeJavaScript(script).catch((err) => {
        console.error('注入插件 ID 失败 (dom-ready):', err)
      })
    })

    // 备用注入（did-finish-load）
    view.webContents.on('did-finish-load', () => {
      const script = `
        (function() {
          if (!window.__UNIHUB_PLUGIN_ID__) {
            const params = new URLSearchParams(window.location.search);
            const pluginId = params.get('__plugin_id') || '${pluginId}';
            window.__UNIHUB_PLUGIN_ID__ = pluginId;
            console.log('✅ 插件 ID 已注入 (did-finish-load):', pluginId);
          }
        })();
      `

      view.webContents.executeJavaScript(script).catch((err) => {
        console.error('注入插件 ID 失败 (did-finish-load):', err)
      })
    })

    // 开发模式下打开 DevTools（已禁用）
    // if (process.env.NODE_ENV === 'development') {
    //   view.webContents.openDevTools({ mode: 'detach' })
    // }

    // 监听控制台消息
    view.webContents.on('console-message', (_event, _level, message) => {
      console.log(`[Plugin ${pluginId}]:`, message)
    })

    // 监听加载错误
    view.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      console.error(`[Plugin ${pluginId}] 加载失败:`, errorCode, errorDescription)
    })

    this.views.set(pluginId, view)
    return view
  }

  /**
   * 显示插件视图
   */
  showPluginView(
    pluginId: string,
    bounds?: { x: number; y: number; width: number; height: number }
  ): void {
    if (!this.mainWindow) {
      console.error('主窗口未设置')
      return
    }

    const view = this.views.get(pluginId)
    if (!view) {
      console.error(`插件视图不存在: ${pluginId}`)
      return
    }

    // 添加到主窗口
    this.mainWindow.contentView.addChildView(view)

    // 设置位置和大小
    if (bounds) {
      view.setBounds(bounds)
    } else {
      // 默认填满内容区域（不覆盖侧边栏和标题栏）
      const windowBounds = this.mainWindow.getBounds()
      const sidebarWidth = 208 // 侧边栏宽度 (w-52 = 13rem = 208px)
      const titleBarHeight = 36 // 标题栏高度 (h-9 = 2.25rem = 36px)

      view.setBounds({
        x: sidebarWidth,
        y: titleBarHeight,
        width: windowBounds.width - sidebarWidth,
        height: windowBounds.height - titleBarHeight
      })
    }

    console.log(`✅ 显示插件视图: ${pluginId}`)
  }

  /**
   * 隐藏插件视图
   */
  hidePluginView(pluginId: string): void {
    if (!this.mainWindow) return

    const view = this.views.get(pluginId)
    if (!view) return

    this.mainWindow.contentView.removeChildView(view)
    console.log(`🔒 隐藏插件视图: ${pluginId}`)
  }

  /**
   * 移除插件视图
   */
  removePluginView(pluginId: string): void {
    const view = this.views.get(pluginId)
    if (!view) return

    // 先隐藏
    this.hidePluginView(pluginId)

    // 销毁 WebContents
    if (!view.webContents.isDestroyed()) {
      view.webContents.close()
    }

    this.views.delete(pluginId)
    console.log(`🗑️ 移除插件视图: ${pluginId}`)
  }

  /**
   * 更新插件视图位置
   */
  updatePluginViewBounds(
    pluginId: string,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    const view = this.views.get(pluginId)
    if (!view) return

    view.setBounds(bounds)
  }

  /**
   * 获取插件视图
   */
  getPluginView(pluginId: string): WebContentsView | undefined {
    return this.views.get(pluginId)
  }

  /**
   * 获取所有插件视图
   */
  getAllViews(): Map<string, WebContentsView> {
    return this.views
  }

  /**
   * 检查是否有活动的视图
   */
  hasActiveViews(): boolean {
    if (!this.mainWindow) return false

    // 检查是否有视图被添加到主窗口
    for (const view of this.views.values()) {
      // 简单检查：如果视图存在且未被销毁，认为是活动的
      if (!view.webContents.isDestroyed()) {
        return true
      }
    }
    return false
  }

  /**
   * 清理所有视图
   */
  cleanup(): void {
    for (const [pluginId] of this.views) {
      this.removePluginView(pluginId)
    }
  }
}

export const webContentsViewManager = new WebContentsViewManager()
