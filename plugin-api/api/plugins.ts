/**
 * 获取插件列表 API
 * GET /api/plugins - 从 Gist 获取最新的插件列表
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPluginsList } from '../lib/gist'
import { setCorsHeaders } from '../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // 设置 CORS
  setCorsHeaders(res, req.headers.origin as string)

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // 从 Gist 获取插件列表
    const plugins = await getPluginsList()

    // 返回插件列表
    res.status(200).json(plugins)
  } catch (error) {
    console.error('Error fetching plugins:', error)
    res.status(500).json({
      error: 'Failed to fetch plugins',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
