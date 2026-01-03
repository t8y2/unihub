/**
 * CORS 配置
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

// 允许的域名白名单（可选）
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['*']

export function setCorsHeaders(res: VercelResponse, origin?: string): void {
  // 如果配置了白名单，检查来源
  if (ALLOWED_ORIGINS[0] !== '*' && origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else {
      res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0])
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export function handleCors(req: VercelRequest, res: VercelResponse): void {
  setCorsHeaders(res, req.headers.origin as string)
  res.status(200).end()
}

// 导出 CORS headers 配置（用于 Vercel config）
export const corsHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*'
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, POST, OPTIONS'
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Content-Type, X-API-Key'
  }
]
