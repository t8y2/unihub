/**
 * 统一的日志工具 - 使用 pino
 */
import pino from 'pino'

// 创建主日志实例
export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
            singleLine: false
          }
        }
      : undefined
})

// 创建带模块名的子日志实例
export function createLogger(module: string): pino.Logger {
  return logger.child({ module })
}
