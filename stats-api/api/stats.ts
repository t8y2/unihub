/**
 * 获取插件统计
 * GET /api/stats?pluginId=xxx
 */

import { VercelRequest, VercelResponse } from '@vercel/node'
import { getStats } from '../lib/gist'
import { setCorsHeaders, handleOptions } from '../lib/cors'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return handleOptions(res)
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { pluginId } = req.query

    if (!pluginId || typeof pluginId !== 'string') {
      return res.status(400).json({ error: 'Missing pluginId' })
    }

    const stats = await getStats()
    const pluginStats = stats[pluginId]

    if (!pluginStats) {
      return res.status(200).json({
        downloads: 0,
        averageRating: 0,
        ratingCount: 0,
        lastUpdated: new Date().toISOString()
      })
    }

    return res.status(200).json({
      downloads: pluginStats.downloads,
      averageRating: pluginStats.averageRating,
      ratingCount: pluginStats.ratings.length,
      lastUpdated: pluginStats.lastUpdated
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
