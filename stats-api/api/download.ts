/**
 * 记录插件下载
 * POST /api/download
 */

import { VercelRequest, VercelResponse } from '@vercel/node'
import { getStats, updateStats, initPluginStats } from '../lib/gist'
import { setCorsHeaders, handleOptions } from '../lib/cors'
import { checkRateLimit, getClientIp } from '../lib/rate-limit'

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
    const { pluginId } = req.body

    if (!pluginId) {
      return res.status(400).json({ error: 'Missing pluginId' })
    }

    // 限流检查：每个 IP 每分钟最多记录 20 次下载
    const clientIp = getClientIp(req)
    if (!checkRateLimit(`download:${clientIp}`, 20, 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: '请求过于频繁，请稍后再试'
      })
    }

    const stats = await getStats()
    initPluginStats(pluginId, stats)

    // 增加下载量
    stats[pluginId].downloads++
    stats[pluginId].lastUpdated = new Date().toISOString()

    await updateStats(stats)

    return res.status(200).json({
      success: true,
      downloads: stats[pluginId].downloads
    })
  } catch (error) {
    console.error('Error tracking download:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
