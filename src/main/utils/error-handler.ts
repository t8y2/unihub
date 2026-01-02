/**
 * 错误处理工具
 */

import { ERROR_CODES } from '../constants'
import { createLogger } from '../../shared/logger'

const logger = createLogger('error-handler')

/**
 * 检查是否为可忽略的错误
 */
export function isIgnorableError(errorCode: number): boolean {
  return errorCode === ERROR_CODES.ABORTED || errorCode === ERROR_CODES.FAILED
}

/**
 * 安全执行异步函数
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (errorMessage) {
      logger.error({ err: error }, errorMessage)
    }
    return fallback
  }
}

/**
 * 创建操作结果
 */
export function createResult<T = unknown>(
  success: boolean,
  message?: string,
  data?: T
): { success: boolean; message?: string; data?: T } {
  return { success, message, data }
}

/**
 * 创建成功结果
 */
export function successResult<T = unknown>(
  message?: string,
  data?: T
): { success: boolean; message?: string; data?: T } {
  return createResult(true, message, data)
}

/**
 * 创建失败结果
 */
export function errorResult(message: string): { success: boolean; message?: string } {
  return createResult(false, message)
}
