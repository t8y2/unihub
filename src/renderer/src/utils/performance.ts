/**
 * 性能监控工具
 * 用于追踪和优化应用性能
 */

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private enabled = import.meta.env.DEV

  /**
   * 开始计时
   */
  start(name: string): void {
    if (!this.enabled) return

    this.metrics.set(name, {
      name,
      startTime: performance.now()
    })
  }

  /**
   * 结束计时
   */
  end(name: string): number | null {
    if (!this.enabled) return null

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`[Performance] 未找到计时器: ${name}`)
      return null
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`)

    return metric.duration
  }

  /**
   * 测量函数执行时间
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn()

    this.start(name)
    try {
      const result = fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn()

    this.start(name)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 获取指定指标
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name)
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * 打印性能报告
   */
  report(): void {
    if (!this.enabled) return

    console.group('[Performance Report]')
    const metrics = this.getMetrics().filter((m) => m.duration !== undefined)
    metrics.sort((a, b) => (b.duration || 0) - (a.duration || 0))

    for (const metric of metrics) {
      console.log(`${metric.name}: ${metric.duration!.toFixed(2)}ms`)
    }
    console.groupEnd()
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 防抖函数（优化版）
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数（优化版）
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now()
          fn.apply(this, args)
          timeoutId = null
        },
        delay - (now - lastCall)
      )
    }
  }
}

/**
 * requestIdleCallback polyfill
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (callback: IdleRequestCallback, options?: IdleRequestOptions): number {
    const start = Date.now()
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      })
    }, options?.timeout || 1) as unknown as number
  }

/**
 * cancelIdleCallback polyfill
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number): void {
    clearTimeout(id)
  }
