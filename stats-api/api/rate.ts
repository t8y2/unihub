/**
 * 提交插件评分
 * POST /api/rate
 */

import { VercelRequest, VercelResponse } from '@vercel/node'
import { getStats, updateStats, initPluginStats } from '../lib/gist'
import { setCorsHeaders, handleOptions } from '../lib/cors'
import { checkRateLimit, getClientIp } from '../lib/rate-limit'
import { detectSuspiciousRating } from '../lib/fraud-detection'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return handleOptions(res)
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { pluginId, rating, userId } = req.body

    if (!pluginId || !rating || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // 限流检查：每个 IP 每小时最多评分 10 次
    const clientIp = getClientIp(req)
    if (!checkRateLimit(`rate:${clientIp}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: '评分过于频繁，请稍后再试'
      })
    }

    // 限流检查：每个用户对同一插件每小时最多评分 3 次（防止刷分）
    if (!checkRateLimit(`rate:${userId}:${pluginId}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: '您对该插件的评分过于频繁，请稍后再试'
      })
    }

    const stats = await getStats()
    initPluginStats(pluginId, stats)

    // 检查用户是否已评分
    const existingIndex = stats[pluginId].ratings.findIndex((r) => r.userId === userId)

    if (existingIndex >= 0) {
      // 更新现有评分
      stats[pluginId].ratings[existingIndex] = {
        userId,
        rating,
        timestamp: new Date().toISOString()
      }
    } else {
      // 添加新评分
      stats[pluginId].ratings.push({
        userId,
        rating,
        timestamp: new Date().toISOString()
      })
    }

    // 计算平均评分
    const totalRating = stats[pluginId].ratings.reduce((sum, r) => sum + r.rating, 0)
    stats[pluginId].averageRating =
      Math.round((totalRating / stats[pluginId].ratings.length) * 10) / 10
    stats[pluginId].lastUpdated = new Date().toISOString()

    // 异常检测
    if (detectSuspiciousRating(pluginId, stats)) {
      console.warn(`⚠️ 检测到可疑评分: ${pluginId}, userId: ${userId}`)
      // 可以选择：
      // 1. 拒绝请求
      // 2. 标记但仍然保存
      // 3. 发送通知
      // 这里选择标记但仍然保存
    }

    await updateStats(stats)

    return res.status(200).json({
      success: true,
      averageRating: stats[pluginId].averageRating,
      ratingCount: stats[pluginId].ratings.length
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
