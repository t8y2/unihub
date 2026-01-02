# 日志系统使用指南

## 📝 概述

UniHub 现在配备了完整的日志系统，支持渲染进程和主进程的日志记录。

## 🎯 功能特性

### 渲染进程日志

- ✅ 多级别日志（DEBUG, INFO, WARN, ERROR）
- ✅ 时间戳支持
- ✅ 模块前缀
- ✅ 格式化输出
- ✅ 性能监控
- ✅ 分组日志

### 主进程日志

- ✅ 所有渲染进程功能
- ✅ 自动写入文件
- ✅ 按日期分割
- ✅ 错误堆栈跟踪
- ✅ 持久化存储

## 🚀 快速开始

### 渲染进程

```typescript
import { log } from '@/utils/logger'

// 基本使用
log.debug('调试信息', { data: 'value' })
log.info('普通信息')
log.warn('警告信息')
log.error('错误信息', error)
```

### 主进程

```typescript
import { mainLogger } from './utils/logger'

mainLogger.info('应用启动')
mainLogger.error('发生错误', error)
```

## 📚 详细用法

### 1. 日志级别

```typescript
import { logger, LogLevel } from '@/utils/logger'

// 设置日志级别
logger.setLevel(LogLevel.DEBUG) // 显示所有日志
logger.setLevel(LogLevel.INFO) // 只显示 INFO 及以上
logger.setLevel(LogLevel.WARN) // 只显示 WARN 和 ERROR
logger.setLevel(LogLevel.ERROR) // 只显示 ERROR
logger.setLevel(LogLevel.NONE) // 不显示任何日志
```

### 2. 模块日志

```typescript
import { createLogger } from '@/utils/logger'

// 创建带前缀的模块日志
const pluginLogger = createLogger('PluginManager')
pluginLogger.info('插件已加载')
// 输出: [2026-01-01T12:00:00.000Z] [PluginManager] [INFO] 插件已加载

const dbLogger = createLogger('Database')
dbLogger.debug('查询执行', { sql: 'SELECT * FROM users' })
```

### 3. 性能监控

```typescript
import { log } from '@/utils/logger'

// 测量操作耗时
log.time('loadPlugins')
await loadAllPlugins()
log.timeEnd('loadPlugins')
// 输出: loadPlugins: 123.45ms
```

### 4. 分组日志

```typescript
import { log } from '@/utils/logger'

log.group('插件初始化')
log.info('加载插件 A')
log.info('加载插件 B')
log.info('加载插件 C')
log.groupEnd()
```

### 5. 错误日志

```typescript
import { log } from '@/utils/logger'

try {
  await riskyOperation()
} catch (error) {
  // 自动记录错误堆栈
  log.error('操作失败', error)
}
```

## 🎨 最佳实践

### 1. 使用合适的日志级别

```typescript
// ✅ 好的做法
log.debug('详细的调试信息', { userId: 123, action: 'login' })
log.info('用户登录成功', { userId: 123 })
log.warn('API 响应慢', { duration: 5000 })
log.error('数据库连接失败', error)

// ❌ 不好的做法
log.info('x = 1') // 过于详细，应该用 debug
log.error('出错了') // 信息不足
console.log('test') // 不要直接使用 console
```

### 2. 提供上下文信息

```typescript
// ✅ 好的做法
log.info('插件安装成功', {
  pluginId: 'json-formatter',
  version: '1.0.0',
  source: 'marketplace',
  duration: 1234
})

// ❌ 不好的做法
log.info('安装成功')
```

### 3. 结构化数据

```typescript
// ✅ 好的做法
log.debug('用户操作', {
  action: 'click',
  target: 'button',
  timestamp: Date.now(),
  metadata: {
    page: 'home',
    section: 'tools'
  }
})

// ❌ 不好的做法
log.debug(`用户点击了按钮，页面是home，时间是${Date.now()}`)
```

### 4. 错误处理

```typescript
// ✅ 好的做法
try {
  await operation()
} catch (error) {
  log.error('操作失败', error)
  // 继续处理错误
  toast.error('操作失败，请重试')
}

// ❌ 不好的做法
try {
  await operation()
} catch (error) {
  console.log(error) // 不要直接使用 console
  // 吞掉错误
}
```

### 5. 性能监控

```typescript
// ✅ 好的做法
log.time('complexOperation')
try {
  const result = await complexOperation()
  log.info('操作完成', { resultCount: result.length })
} finally {
  log.timeEnd('complexOperation')
}

// ❌ 不好的做法
const start = Date.now()
await complexOperation()
console.log('耗时:', Date.now() - start)
```

## 📊 日志级别指南

### DEBUG

**用途：** 详细的调试信息，仅在开发时使用

**示例：**

```typescript
log.debug('函数调用', { params: { id: 123, name: 'test' } })
log.debug('状态变化', { from: 'idle', to: 'loading' })
```

### INFO

**用途：** 重要的业务操作和状态变化

**示例：**

```typescript
log.info('用户登录', { userId: 123 })
log.info('插件安装成功', { pluginId: 'json-formatter' })
log.info('设置已保存', { key: 'theme', value: 'dark' })
```

### WARN

**用途：** 潜在问题和异常情况

**示例：**

```typescript
log.warn('API 响应慢', { duration: 5000, threshold: 3000 })
log.warn('缓存未命中', { key: 'user-123' })
log.warn('磁盘空间不足', { available: '100MB', required: '500MB' })
```

### ERROR

**用途：** 错误和异常

**示例：**

```typescript
log.error('数据库连接失败', error)
log.error('插件加载失败', { pluginId: 'xxx', error })
log.error('网络请求失败', { url: '/api/data', status: 500 })
```

## 🔍 调试技巧

### 1. 临时启用调试日志

```typescript
import { logger, LogLevel } from '@/utils/logger'

// 临时启用调试日志
const originalLevel = logger.level
logger.setLevel(LogLevel.DEBUG)

// 执行需要调试的代码
await debugOperation()

// 恢复原来的级别
logger.setLevel(originalLevel)
```

### 2. 条件日志

```typescript
import { log } from '@/utils/logger'

const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  log.debug('详细的调试信息', { data })
}
```

### 3. 性能分析

```typescript
import { log } from '@/utils/logger'

// 分析多个操作
log.group('性能分析')

log.time('operation1')
await operation1()
log.timeEnd('operation1')

log.time('operation2')
await operation2()
log.timeEnd('operation2')

log.groupEnd()
```

## 📁 日志文件

### 位置

主进程日志文件位于：

```
{userData}/logs/app-YYYY-MM-DD.log
```

### 示例

```
macOS: ~/Library/Application Support/UniHub/logs/app-2026-01-01.log
Windows: %APPDATA%/UniHub/logs/app-2026-01-01.log
Linux: ~/.config/UniHub/logs/app-2026-01-01.log
```

### 格式

```
[2026-01-01T12:00:00.000Z] [INFO] 应用启动
[2026-01-01T12:00:01.234Z] [DEBUG] 加载插件
[2026-01-01T12:00:02.567Z] [ERROR] 插件加载失败
Error: Plugin not found
Stack: Error: Plugin not found
    at loadPlugin (plugin-manager.ts:123:15)
    ...
```

## 🛠️ 配置

### 环境变量

```bash
# 开发环境 - 显示所有日志
NODE_ENV=development

# 生产环境 - 只显示重要日志
NODE_ENV=production
```

### 代码配置

```typescript
import { logger, LogLevel } from '@/utils/logger'

// 设置日志级别
logger.setLevel(process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO)

// 启用堆栈跟踪
logger.enableStackTrace(true)

// 设置前缀
logger.setPrefix('MyModule')
```

## 📈 监控和分析

### 1. 日志统计

```typescript
// 统计错误数量
let errorCount = 0

const originalError = log.error
log.error = (message: string, error?: unknown) => {
  errorCount++
  originalError(message, error)
}
```

### 2. 日志过滤

```typescript
// 只记录特定模块的日志
const moduleLogger = createLogger('TargetModule')
moduleLogger.info('只有这个模块的日志')
```

### 3. 日志导出

```typescript
// 导出日志到文件
const exportLogs = async () => {
  const logs = await window.api.getLogs()
  const blob = new Blob([logs], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `logs-${Date.now()}.txt`
  link.click()

  URL.revokeObjectURL(url)
}
```

## 🎓 常见问题

### Q: 日志会影响性能吗？

A: 日志系统经过优化，对性能影响很小。在生产环境中，建议设置为 INFO 级别，避免过多的 DEBUG 日志。

### Q: 日志文件会占用多少空间？

A: 日志文件按天分割，每天一个文件。建议定期清理旧日志文件。

### Q: 如何在生产环境中调试？

A: 可以临时启用 DEBUG 级别，或者查看日志文件。

### Q: 可以自定义日志格式吗？

A: 可以，通过修改 `formatMessage` 方法自定义格式。

---

**最后更新：** 2026-01-01
