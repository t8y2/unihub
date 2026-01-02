/**
 * 简单的内存限流器
 * 防止恶意刷量
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// 清理过期记录（每小时执行一次）
setInterval(
  () => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  },
  60 * 60 * 1000
)

/**
 * 检查是否超过限流
 * @param key 限流键（通常是 IP 或 userId）
 * @param limit 限制次数
 * @param windowMs 时间窗口（毫秒）
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // 新记录或已过期
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= limit) {
    // 超过限制
    return false
  }

  // 增加计数
  record.count++
  return true
}

/**
 * 获取客户端 IP
 */
export function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>
  connection?: { remoteAddress?: string }
}): string {
  const forwardedFor = req.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]

  return (
    forwardedIp ||
    (req.headers['x-real-ip'] as string) ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}
