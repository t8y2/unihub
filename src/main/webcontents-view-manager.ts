import { BrowserWindow, WebContentsView } from 'electron'
import { join } from 'path'

/**
 * WebContentsView 管理器
 * 用于在主窗口中嵌入插件视图
 * 使用 LRU 缓存策略管理视图生命周期
 */
export class WebContentsViewManager {
  private views = new Map<string, WebContentsView>()
  private mainWindow: BrowserWindow | null = null
  private lruQueue: string[] = [] // LRU 队列，最近使用的在前面
  private maxCachedViews = 5 // 最多缓存 5 个视图

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
    // 如果已存在，更新 LRU 并返回
    if (this.views.has(pluginId)) {
      this.updateLRU(pluginId)
      return this.views.get(pluginId)!
    }

    // 检查是否超过缓存限制
    if (this.views.size >= this.maxCachedViews) {
      this.evictLRU()
    }

    // 创建新的 WebContentsView（性能优化）
    const view = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false, // 禁用 sandbox 以支持 preload
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        // 性能优化选项
        backgroundThrottling: false, // 禁用后台节流，保持插件响应
        offscreen: false, // 禁用离屏渲染
        enableWebSQL: false, // 禁用 WebSQL
        spellcheck: false // 禁用拼写检查
      }
    })

    // 在 URL 中添加插件 ID 参数
    const urlWithPluginId = url.includes('?')
      ? `${url}&__plugin_id=${pluginId}`
      : `${url}?__plugin_id=${pluginId}`

    // 加载插件 URL（异步，不阻塞）
    view.webContents.loadURL(urlWithPluginId).catch((err) => {
      // 忽略常见的非致命错误：
      // ERR_ABORTED (-3): 导航被取消
      // ERR_FAILED (-2): 通用失败，但页面可能已加载
      const ignoredErrors = ['ERR_ABORTED', 'ERR_FAILED']
      if (ignoredErrors.includes(err.code)) {
        return
      }
      console.error(`加载插件 ${pluginId} 失败:`, err)
    })

    // 只在 dom-ready 时注入一次（更早且足够）
    view.webContents.once('dom-ready', () => {
      const script = `
        (function() {
          const params = new URLSearchParams(window.location.search);
          const pluginId = params.get('__plugin_id') || '${pluginId}';
          
          Object.defineProperty(window, '__UNIHUB_PLUGIN_ID__', {
            value: pluginId,
            writable: false,
            configurable: false
          });
        })();
      `

      view.webContents.executeJavaScript(script).catch((err) => {
        console.error('注入插件 ID 失败:', err)
      })
    })

    // 开发模式下打开 DevTools（已禁用）
    // if (process.env.NODE_ENV === 'development') {
    //   view.webContents.openDevTools({ mode: 'detach' })
    // }

    // 监听控制台消息（仅开发模式）
    if (process.env.NODE_ENV === 'development') {
      view.webContents.on('console-message', (_event, _level, message) => {
        console.log(`[Plugin ${pluginId}]:`, message)
      })
    }

    // 监听加载错误（只记录主框架的严重错误）
    view.webContents.on(
      'did-fail-load',
      (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        // 忽略非主框架的加载错误
        // 忽略 ERR_ABORTED (-3) 和 ERR_FAILED (-2)，这些通常是非致命的
        if (!isMainFrame || errorCode === -3 || errorCode === -2) {
          return
        }
        console.error(`[Plugin ${pluginId}] 加载失败:`, errorCode, errorDescription, validatedURL)
      }
    )

    // 拦截插件视图中的 Cmd+W / Ctrl+W 快捷键
    view.webContents.on('before-input-event', (event, input) => {
      // 检查是否是 Cmd+W (Mac) 或 Ctrl+W (Windows/Linux)
      if (input.type === 'keyDown' && input.key === 'w' && (input.meta || input.control)) {
        event.preventDefault()
        console.log(`🚫 阻止插件 ${pluginId} 中的 Cmd+W 关闭窗口`)
        // 通知主窗口的渲染进程处理关闭标签
        this.mainWindow?.webContents.send('handle-close-tab')
      }
    })

    this.views.set(pluginId, view)
    this.updateLRU(pluginId)
    return view
  }

  /**
   * 更新 LRU 队列
   */
  private updateLRU(pluginId: string): void {
    // 移除旧位置
    const index = this.lruQueue.indexOf(pluginId)
    if (index > -1) {
      this.lruQueue.splice(index, 1)
    }
    // 添加到队首（最近使用）
    this.lruQueue.unshift(pluginId)
  }

  /**
   * 驱逐最久未使用的视图
   */
  private evictLRU(): void {
    if (this.lruQueue.length === 0) return

    // 获取最久未使用的插件 ID（队尾）
    const oldestPluginId = this.lruQueue[this.lruQueue.length - 1]
    console.log(`🗑️ LRU 驱逐: ${oldestPluginId}`)
    this.removePluginView(oldestPluginId)
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

    // 更新 LRU
    this.updateLRU(pluginId)

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
  }

  /**
   * 隐藏插件视图
   */
  hidePluginView(pluginId: string): void {
    if (!this.mainWindow) return

    const view = this.views.get(pluginId)
    if (!view) return

    this.mainWindow.contentView.removeChildView(view)
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
    
    // 从 LRU 队列中移除
    const index = this.lruQueue.indexOf(pluginId)
    if (index > -1) {
      this.lruQueue.splice(index, 1)
    }
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
