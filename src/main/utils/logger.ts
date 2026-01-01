/**
 * 主进程日志系统
 */

import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, appendFileSync } from 'fs'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class MainLogger {
  private logDir: string
  private logFile: string
  private level: LogLevel

  constructor() {
    this.logDir = join(app.getPath('userData'), 'logs')
    this.logFile = join(this.logDir, `app-${this.getDateString()}.log`)
    this.level = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO

    this.ensureLogDir()
  }

  private ensureLogDir(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}\n`
  }

  private writeToFile(message: string): void {
    try {
      appendFileSync(this.logFile, message, 'utf-8')
    } catch (error) {
      console.error('写入日志文件失败:', error)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    const logMessage = this.formatMessage('DEBUG', message)
    console.debug(logMessage.trim())
    if (data) console.debug(data)
    this.writeToFile(logMessage)
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    const logMessage = this.formatMessage('INFO', message)
    console.info(logMessage.trim())
    if (data) console.info(data)
    this.writeToFile(logMessage)
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    const logMessage = this.formatMessage('WARN', message)
    console.warn(logMessage.trim())
    if (data) console.warn(data)
    this.writeToFile(logMessage)
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    const logMessage = this.formatMessage('ERROR', message)
    console.error(logMessage.trim())

    if (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message)
        console.error('Stack:', error.stack)
        this.writeToFile(`${logMessage}Error: ${error.message}\nStack: ${error.stack}\n`)
      } else {
        console.error('Error data:', error)
        this.writeToFile(`${logMessage}Error data: ${JSON.stringify(error)}\n`)
      }
    } else {
      this.writeToFile(logMessage)
    }
  }
}

export const mainLogger = new MainLogger()
