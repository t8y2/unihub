/**
 * 简单的刷量检测
 */

import { StatsData } from './gist'

/**
 * 检测异常评分模式
 * @param pluginId 插件 ID
 * @param stats 统计数据
 * @returns 是否可疑
 */
export function detectSuspiciousRating(pluginId: string, stats: StatsData): boolean {
  const pluginStats = stats[pluginId]
  if (!pluginStats || pluginStats.ratings.length < 10) {
    return false // 数据太少，不检测
  }

  const ratings = pluginStats.ratings
  const recentRatings = ratings.slice(-20) // 最近 20 个评分

  // 检测 1: 短时间内大量相同评分
  const now = Date.now()
  const last10Minutes = recentRatings.filter(
    (r) => now - new Date(r.timestamp).getTime() < 10 * 60 * 1000
  )

  if (last10Minutes.length > 10) {
    // 10 分钟内超过 10 个评分，可疑
    const sameRatingCount = last10Minutes.filter((r) => r.rating === last10Minutes[0].rating).length

    if (sameRatingCount > 8) {
      // 80% 都是相同评分，可疑
      console.warn(`⚠️ 检测到可疑评分模式: ${pluginId}`)
      return true
    }
  }

  // 检测 2: 用户 ID 模式异常（如 user_1, user_2, user_3...）
  const userIds = recentRatings.map((r) => r.userId)
  const sequentialPattern = /user_\d+$/
  const sequentialCount = userIds.filter((id) => sequentialPattern.test(id)).length

  if (sequentialCount > 15) {
    // 超过 75% 是连续数字 ID，可疑
    console.warn(`⚠️ 检测到可疑用户 ID 模式: ${pluginId}`)
    return true
  }

  return false
}

/**
 * 检测异常下载模式
 * @param pluginId 插件 ID
 * @param stats 统计数据
 * @returns 是否可疑
 */
export function detectSuspiciousDownload(pluginId: string, stats: StatsData): boolean {
  const pluginStats = stats[pluginId]
  if (!pluginStats) {
    return false
  }

  // 检测：下载量突然暴增
  // 这里只是示例，实际需要记录历史数据
  // 可以在 Gist 中添加 downloadHistory 字段

  return false
}
