/**
 * 插件统计服务
 * 处理下载量、评分等动态数据
 */

interface PluginStats {
  downloads: number
  averageRating: number
  ratingCount: number
  lastUpdated: string
}

interface RatingSubmission {
  pluginId: string
  rating: number
  userId: string
}

class PluginStatsService {
  private apiBaseUrl: string
  private cache: Map<string, { data: PluginStats; timestamp: number }>
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
  private debug = import.meta.env.DEV // 只在开发环境打印日志

  constructor() {
    // 配置你的 API 地址
    this.apiBaseUrl = import.meta.env.VITE_STATS_API_URL || 'https://stats-api-nu.vercel.app/api'
    this.cache = new Map()

    if (this.debug) {
      console.log('🔧 [Stats] 初始化统计服务')
      console.log('🔧 [Stats] API URL:', this.apiBaseUrl)
    }
  }

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log(...args)
    }
  }

  private warn(...args: unknown[]): void {
    if (this.debug) {
      console.warn(...args)
    }
  }

  /**
   * 获取插件统计（带缓存）
   */
  async getStats(pluginId: string): Promise<PluginStats | null> {
    // 检查缓存
    const cached = this.cache.get(pluginId)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/stats?pluginId=${pluginId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const stats = await response.json()

      // 更新缓存
      this.cache.set(pluginId, {
        data: stats,
        timestamp: Date.now()
      })

      return stats
    } catch (error) {
      console.error('获取插件统计失败:', error)
      // 返回默认值
      return {
        downloads: 0,
        averageRating: 0,
        ratingCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * 批量获取多个插件的统计
   */
  async getBatchStats(pluginIds: string[]): Promise<Map<string, PluginStats>> {
    const results = new Map<string, PluginStats>()

    // 并发请求
    const promises = pluginIds.map(async (id) => {
      const stats = await this.getStats(id)
      if (stats) {
        results.set(id, stats)
      }
    })

    await Promise.all(promises)
    return results
  }

  /**
   * 记录下载（异步，不阻塞用户）
   */
  async trackDownload(pluginId: string): Promise<void> {
    this.log('🔵 [Stats] 开始记录下载:', pluginId)

    try {
      // 获取用户ID（匿名或登录用户）
      const userId = this.getUserId()

      // 异步发送，不等待响应
      const url = `${this.apiBaseUrl}/download`
      this.log('🔵 [Stats] 发送请求到:', url)

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, userId })
      })
        .then((response) => {
          this.log('🟢 [Stats] 下载记录响应:', response.status)
          return response.json()
        })
        .then((data) => {
          this.log('🟢 [Stats] 下载记录成功:', data)
        })
        .catch((err) => {
          this.warn('🔴 [Stats] 记录下载失败:', err)
        })

      // 立即更新本地缓存
      const cached = this.cache.get(pluginId)
      if (cached) {
        cached.data.downloads++
        this.cache.set(pluginId, cached)
        this.log('🟢 [Stats] 本地缓存已更新')
      }
    } catch (error) {
      this.warn('🔴 [Stats] 记录下载失败:', error)
    }
  }

  /**
   * 提交评分
   */
  async submitRating(submission: RatingSubmission): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      // 清除缓存，强制重新获取
      this.cache.delete(submission.pluginId)

      return true
    } catch (error) {
      console.error('提交评分失败:', error)
      return false
    }
  }

  /**
   * 获取用户评分
   */
  async getUserRating(pluginId: string): Promise<number | null> {
    try {
      const userId = this.getUserId()
      const response = await fetch(
        `${this.apiBaseUrl}/user-rating?pluginId=${pluginId}&userId=${userId}`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.rating || null
    } catch (error) {
      console.error('获取用户评分失败:', error)
      return null
    }
  }

  /**
   * 获取或生成用户ID（用于匿名统计）
   */
  private getUserId(): string {
    let userId = localStorage.getItem('unihub_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('unihub_user_id', userId)
    }
    return userId
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 离线模式：从 plugins.json 获取静态统计
   */
  async getStaticStats(pluginId: string): Promise<Partial<PluginStats>> {
    try {
      const response = await fetch('/marketplace/plugins.json')
      const data = await response.json()
      const plugin = data.plugins.find((p: { id: string }) => p.id === pluginId)

      if (plugin) {
        return {
          downloads: plugin.downloads || 0,
          averageRating: plugin.rating || 0,
          ratingCount: plugin.ratingCount || 0
        }
      }
    } catch (error) {
      console.error('获取静态统计失败:', error)
    }

    return {
      downloads: 0,
      averageRating: 0,
      ratingCount: 0
    }
  }
}

export const pluginStatsService = new PluginStatsService()
