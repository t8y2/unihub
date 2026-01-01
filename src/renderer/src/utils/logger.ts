/**
 * 日志系统
 * 统一管理应用日志，支持不同级别和格式化输出
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogConfig {
  level: LogLevel
  enableTimestamp: boolean
  enableStackTrace: boolean
  prefix?: string
}

class Logger {
  private config: LogConfig = {
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    enableTimestamp: true,
    enableStackTrace: false
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const parts: string[] = []

    if (this.config.enableTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`)
    }

    parts.push(`[${level}]`)
    parts.push(message)

    if (data !== undefined) {
      parts.push(JSON.stringify(data, null, 2))
    }

    return parts.join(' ')
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  setPrefix(prefix: string): void {
    this.config.prefix = prefix
  }

  enableStackTrace(enable: boolean): void {
    this.config.enableStackTrace = enable
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.debug(this.formatMessage('DEBUG', message, data))
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.info(this.formatMessage('INFO', message, data))
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    console.warn(this.formatMessage('WARN', message, data))
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    console.error(this.formatMessage('ERROR', message))

    if (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message)
        if (this.config.enableStackTrace && error.stack) {
          console.error('Stack:', error.stack)
        }
      } else {
        console.error('Error data:', error)
      }
    }
  }

  group(label: string): void {
    console.group(label)
  }

  groupEnd(): void {
    console.groupEnd()
  }

  time(label: string): void {
    console.time(label)
  }

  timeEnd(label: string): void {
    console.timeEnd(label)
  }
}

// 创建全局日志实例
export const logger = new Logger()

// 创建模块日志实例
export function createLogger(prefix: string): Logger {
  const moduleLogger = new Logger()
  moduleLogger.setPrefix(prefix)
  return moduleLogger
}

// 导出便捷方法
export const log = {
  debug: (message: string, data?: unknown) => logger.debug(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  error: (message: string, error?: unknown) => logger.error(message, error),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label)
}
