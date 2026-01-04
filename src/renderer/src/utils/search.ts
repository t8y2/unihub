/**
 * 高性能搜索工具
 * 实现增量索引和模糊搜索算法优化
 */

import { pinyin } from 'pinyin-pro'
import type { Plugin } from '@/types/plugin'

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
}

// 搜索结果
export interface SearchResult {
  id: string
  name: string
  description: string
  icon: string
  keywords: string[]
  category: string
  score: number
}

/**
 * 高性能搜索引擎
 * 使用增量索引和缓存优化搜索性能
 */
export class SearchEngine {
  private index: Map<string, SearchIndexItem> = new Map()
  private pinyinCache: Map<string, string> = new Map()
  private searchCache: Map<string, SearchResult[]> = new Map()
  private readonly maxCacheSize = 100

  /**
   * 构建或更新索引
   */
  buildIndex(plugins: Plugin[]): void {
    const startTime = performance.now()

    for (const plugin of plugins) {
      if (!plugin.enabled) continue

      const id = plugin.metadata.id
      const name = plugin.metadata.name
      const description = plugin.metadata.description
      const keywords = plugin.metadata.keywords || []
      const category = plugin.metadata.category

      // 检查是否已存在，避免重复计算
      if (this.index.has(id)) {
        const existing = this.index.get(id)!
        // 只有内容变化时才更新
        if (
          existing.name === name &&
          existing.description === description &&
          existing.keywords.length === keywords.length
        ) {
          continue
        }
      }

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
        categoryLower: category.toLowerCase()
      })
    }

    // 清理已删除的插件
    const pluginIds = new Set(plugins.filter((p) => p.enabled).map((p) => p.metadata.id))
    for (const id of this.index.keys()) {
      if (!pluginIds.has(id)) {
        this.index.delete(id)
      }
    }

    const endTime = performance.now()
    console.log(
      `[SearchEngine] 索引构建完成，耗时 ${(endTime - startTime).toFixed(2)}ms，共 ${this.index.size} 个插件`
    )
  }

  /**
   * 增量更新索引（单个插件）
   */
  updateIndex(plugin: Plugin): void {
    if (!plugin.enabled) {
      this.index.delete(plugin.metadata.id)
      return
    }

    const id = plugin.metadata.id
    const name = plugin.metadata.name
    const description = plugin.metadata.description
    const keywords = plugin.metadata.keywords || []
    const category = plugin.metadata.category

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
      categoryLower: category.toLowerCase()
    })

    // 清除相关缓存
    this.searchCache.clear()
  }

  /**
   * 删除索引项
   */
  removeIndex(pluginId: string): void {
    this.index.delete(pluginId)
    this.searchCache.clear()
  }

  /**
   * 搜索插件
   */
  search(query: string, plugins: Plugin[]): SearchResult[] {
    const searchTerm = query.trim()

    // 空查询返回所有启用的插件
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
          score: 0
        }))
    }

    // 检查缓存
    if (this.searchCache.has(searchTerm)) {
      return this.searchCache.get(searchTerm)!
    }

    const startTime = performance.now()
    const lowerQuery = searchTerm.toLowerCase()
    const results: SearchResult[] = []

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

      // 关键词匹配
      for (const keyword of item.keywordsLower) {
        if (keyword === lowerQuery) {
          score += 200 // 完全匹配
          break
        } else if (keyword.includes(lowerQuery)) {
          score += 80
          break
        }
      }

      // 分类匹配
      if (item.categoryLower.includes(lowerQuery)) {
        score += 30
      }

      // 只返回有匹配的结果
      if (score > 0) {
        const plugin = plugins.find((p) => p.metadata.id === item.id)
        if (plugin) {
          results.push({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: plugin.metadata.icon,
            keywords: item.keywords,
            category: item.category,
            score
          })
        }
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score)

    // 缓存结果
    if (this.searchCache.size >= this.maxCacheSize) {
      // LRU 策略：删除最早的缓存
      const firstKey = this.searchCache.keys().next().value
      if (firstKey) this.searchCache.delete(firstKey)
    }
    this.searchCache.set(searchTerm, results)

    const endTime = performance.now()
    console.log(
      `[SearchEngine] 搜索完成，耗时 ${(endTime - startTime).toFixed(2)}ms，找到 ${results.length} 个结果`
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
    cacheSize: number
    pinyinCacheSize: number
  } {
    return {
      indexSize: this.index.size,
      cacheSize: this.searchCache.size,
      pinyinCacheSize: this.pinyinCache.size
    }
  }
}

// 导出单例
export const searchEngine = new SearchEngine()
