/**
 * 统一搜索引擎
 * 支持插件和本地应用的搜索
 */

import { pinyin } from 'pinyin-pro'
import type { Plugin } from '@/types/plugin'

// 本地应用类型
export interface LocalApp {
  id: string
  name: string
  displayName?: string // 显示名称（从 Info.plist 读取）
  path: string
  icon?: string
  type: 'app'
}

// 统一搜索结果
export interface UnifiedSearchResult {
  id: string
  name: string
  description: string
  icon: string
  keywords: string[]
  category: string
  score: number
  type: 'plugin' | 'app'
  path?: string // 应用路径
}

// 搜索索引项
interface SearchIndexItem {
  id: string
  name: string
  nameLower: string
  namePinyin: string
  namePinyinInitials: string
  description: string
  descriptionLower: string
  keywords: string[]
  keywordsLower: string[]
  category: string
  categoryLower: string
  type: 'plugin' | 'app'
  icon: string
  path?: string
}

/**
 * 统一搜索引擎
 */
export class UnifiedSearchEngine {
  private index: Map<string, SearchIndexItem> = new Map()
  private pinyinCache: Map<string, string> = new Map()
  private searchCache: Map<string, UnifiedSearchResult[]> = new Map()
  private readonly maxCacheSize = 100

  /**
   * 构建插件索引
   */
  buildPluginIndex(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      if (!plugin.enabled) continue

      const id = plugin.metadata.id
      const name = plugin.metadata.name
      const description = plugin.metadata.description
      const keywords = plugin.metadata.keywords || []
      const category = plugin.metadata.category
      const icon = plugin.metadata.icon

      this.index.set(id, {
        id,
        name,
        nameLower: name.toLowerCase(),
        namePinyin: this.getPinyin(name),
        namePinyinInitials: this.getPinyinInitials(name),
        description,
        descriptionLower: description.toLowerCase(),
        keywords,
        keywordsLower: keywords.map((k) => k.toLowerCase()),
        category,
        categoryLower: category.toLowerCase(),
        type: 'plugin',
        icon
      })
    }

    // 清理已删除的插件
    const pluginIds = new Set(plugins.filter((p) => p.enabled).map((p) => p.metadata.id))
    for (const [id, item] of this.index.entries()) {
      if (item.type === 'plugin' && !pluginIds.has(id)) {
        this.index.delete(id)
      }
    }
  }

  /**
   * 构建应用索引
   */
  buildAppIndex(apps: LocalApp[]): void {
    // 先清除旧的应用索引
    for (const [id, item] of this.index.entries()) {
      if (item.type === 'app') {
        this.index.delete(id)
      }
    }

    // 添加新的应用索引
    for (const app of apps) {
      // 使用 displayName 作为主要名称（如果有）
      const primaryName = app.displayName || app.name

      // 关键词：包含英文名和中文名
      const keywords: string[] = []
      if (app.displayName && app.displayName !== app.name) {
        keywords.push(app.name) // 英文名作为关键词
      }

      this.index.set(app.id, {
        id: app.id,
        name: primaryName, // 优先使用 displayName
        nameLower: primaryName.toLowerCase(),
        namePinyin: this.getPinyin(primaryName),
        namePinyinInitials: this.getPinyinInitials(primaryName),
        description: app.path,
        descriptionLower: app.path.toLowerCase(),
        keywords: keywords,
        keywordsLower: keywords.map((k) => k.toLowerCase()),
        category: 'app',
        categoryLower: 'app',
        type: 'app',
        icon: app.icon || '', // 空字符串，前端会显示备用图标
        path: app.path
      })
    }

    // 清除搜索缓存
    this.searchCache.clear()
  }

  /**
   * 搜索（插件 + 应用）
   */
  search(query: string, plugins: Plugin[]): UnifiedSearchResult[] {
    const searchTerm = query.trim()

    // 空查询返回所有启用的插件（不返回应用）
    if (!searchTerm) {
      return plugins
        .filter((p) => p.enabled)
        .map((p) => ({
          id: p.metadata.id,
          name: p.metadata.name,
          description: p.metadata.description,
          icon: p.metadata.icon,
          keywords: p.metadata.keywords || [],
          category: p.metadata.category,
          score: 0,
          type: 'plugin' as const
        }))
    }

    // 检查缓存
    if (this.searchCache.has(searchTerm)) {
      return this.searchCache.get(searchTerm)!
    }

    const startTime = performance.now()
    const lowerQuery = searchTerm.toLowerCase()
    const results: UnifiedSearchResult[] = []

    // 遍历索引进行匹配
    for (const item of this.index.values()) {
      let score = 0

      // 名称匹配（权重最高）
      if (item.nameLower === lowerQuery) {
        score += 1000 // 完全匹配
      } else if (item.nameLower.startsWith(lowerQuery)) {
        score += 500 // 前缀匹配
      } else if (item.nameLower.includes(lowerQuery)) {
        score += 100 // 包含匹配
      }

      // 拼音匹配
      if (item.namePinyin.includes(lowerQuery)) {
        score += 80
      }
      if (item.namePinyinInitials.includes(lowerQuery)) {
        score += 60
      }

      // 描述匹配
      if (item.descriptionLower.includes(lowerQuery)) {
        score += 50
      }

      // 关键词匹配（插件和应用都支持）
      for (const keyword of item.keywordsLower) {
        if (keyword === lowerQuery) {
          score += 300 // 完全匹配（提高权重）
          break
        } else if (keyword.includes(lowerQuery)) {
          score += 150 // 包含匹配（提高权重）
          break
        }
      }

      // 分类匹配
      if (item.categoryLower.includes(lowerQuery)) {
        score += 30
      }

      // 应用类型稍微降低权重，让插件优先
      if (item.type === 'app') {
        score *= 0.9
      }

      // 只返回有匹配的结果
      if (score > 0) {
        results.push({
          id: item.id,
          name: item.name,
          description: item.description,
          icon: item.icon,
          keywords: item.keywords,
          category: item.category,
          score,
          type: item.type,
          path: item.path
        })
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score)

    // 缓存结果
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value
      if (firstKey) this.searchCache.delete(firstKey)
    }
    this.searchCache.set(searchTerm, results)

    const endTime = performance.now()
    console.log(
      `[UnifiedSearch] 搜索完成，耗时 ${(endTime - startTime).toFixed(2)}ms，找到 ${results.length} 个结果`
    )

    return results
  }

  /**
   * 清除搜索缓存
   */
  clearCache(): void {
    this.searchCache.clear()
  }

  /**
   * 获取拼音（带缓存）
   */
  private getPinyin(text: string): string {
    const cacheKey = `py:${text}`
    if (this.pinyinCache.has(cacheKey)) {
      return this.pinyinCache.get(cacheKey)!
    }

    const py = pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase()
    this.pinyinCache.set(cacheKey, py)
    return py
  }

  /**
   * 获取拼音首字母（带缓存）
   */
  private getPinyinInitials(text: string): string {
    const cacheKey = `pyi:${text}`
    if (this.pinyinCache.has(cacheKey)) {
      return this.pinyinCache.get(cacheKey)!
    }

    const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' })
      .join('')
      .toLowerCase()
    this.pinyinCache.set(cacheKey, initials)
    return initials
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    indexSize: number
    pluginCount: number
    appCount: number
    cacheSize: number
  } {
    let pluginCount = 0
    let appCount = 0

    for (const item of this.index.values()) {
      if (item.type === 'plugin') pluginCount++
      else if (item.type === 'app') appCount++
    }

    return {
      indexSize: this.index.size,
      pluginCount,
      appCount,
      cacheSize: this.searchCache.size
    }
  }
}

// 导出单例
export const unifiedSearchEngine = new UnifiedSearchEngine()
