/**
 * 获取用户对插件的评分
 * GET /api/user-rating?pluginId=xxx&userId=xxx
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
    const { pluginId, userId } = req.query

    if (!pluginId || typeof pluginId !== 'string') {
      return res.status(400).json({ error: 'Missing pluginId' })
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing userId' })
    }

    const stats = await getStats()
    const pluginStats = stats[pluginId]

    if (!pluginStats) {
      return res.status(200).json({ rating: null })
    }

    const userRating = pluginStats.ratings.find((r) => r.userId === userId)

    return res.status(200).json({
      rating: userRating ? userRating.rating : null,
      timestamp: userRating ? userRating.timestamp : null
    })
  } catch (error) {
    console.error('Error fetching user rating:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
