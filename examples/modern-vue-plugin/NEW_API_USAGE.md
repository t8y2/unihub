# 新 API 使用指南

## 🚀 快速开始

### 1. 数据库操作

```typescript
// 保存数据（新 API：直接抛异常，不返回 boolean）
await window.unihub.db.set('settings', { theme: 'dark' })

// 读取数据（新 API：直接返回数据或 null）
const settings = await window.unihub.db.get('settings')
console.log(settings.theme) // 'dark'

// 删除数据
await window.unihub.db.delete('settings')

// 获取所有键
const keys = await window.unihub.db.keys()

// 清空所有数据
await window.unihub.db.clear()
```

### 2. Sidecar 调用

```typescript
// 直接调用 sidecar（新 API：返回 { stdout, stderr, exitCode }）
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({
    action: 'reverse',
    data: 'Hello World'
  }),
  timeout: 5000
})

// 解析结果
const response = JSON.parse(result.stdout)
console.log(response.result) // 'dlroW olleH'

// 检查错误
if (result.exitCode !== 0) {
  console.error('Sidecar 失败:', result.stderr)
}
```

### 3. 使用辅助函数（推荐）

```typescript
import { callSidecar } from './utils/sidecar-helper'

// 更简单的调用方式
const response = await callSidecar({
  action: 'reverse',
  data: 'Hello World'
})

if (response.success) {
  console.log(response.result)
} else {
  console.error(response.error)
}
```

### 4. 剪贴板操作

```typescript
// 写入文本（新 API：不返回值，失败抛异常）
await window.unihub.clipboard.writeText('Hello')

// 读取文本（新 API：直接返回字符串）
const text = await window.unihub.clipboard.readText()
```

### 5. 通知

```typescript
// 显示通知（新 API：不返回值，失败抛异常）
await window.unihub.notification.show({
  title: '任务完成',
  body: '文件已处理完成'
})
```

### 6. 获取插件目录

```typescript
// 新 API：直接返回字符串
const pluginDir = await window.node.getPluginDir()
console.log(pluginDir) // '/Users/.../plugins/com.example.plugin'
```

## 🎯 错误处理

新 API 使用标准的 try-catch 错误处理：

```typescript
try {
  const data = await window.unihub.db.get('key')
  console.log(data)
} catch (error) {
  console.error('读取失败:', error.message)
}
```

## 📝 完整示例

```typescript
async function processText(input: string) {
  try {
    // 1. 保存输入到数据库
    await window.unihub.db.set('last-input', input)

    // 2. 调用 sidecar 处理
    const result = await window.node.spawn('./sidecar/main', [], {
      input: JSON.stringify({
        action: 'reverse',
        data: input
      })
    })

    // 3. 解析结果
    const response = JSON.parse(result.stdout)

    // 4. 保存结果
    await window.unihub.db.set('last-output', response.result)

    // 5. 显示通知
    await window.unihub.notification.show({
      title: '处理完成',
      body: `结果: ${response.result}`
    })

    return response.result
  } catch (error) {
    console.error('处理失败:', error)
    throw error
  }
}
```

## 🔄 从旧 API 迁移

### 数据库

```typescript
// 旧 API
const result = await window.unihub.db.put('key', value)
if (result) { ... }

// 新 API
await window.unihub.db.set('key', value)
// 成功：无返回值
// 失败：抛出异常
```

### Sidecar

```typescript
// 旧 API
const result = await window.node.spawn('./sidecar/main', [], { input: '...' })
if (result.success) {
  console.log(result.stdout)
}

// 新 API
const result = await window.node.spawn('./sidecar/main', [], { input: '...' })
console.log(result.stdout) // 直接访问
// 失败会抛出异常
```

## ✅ 优势

1. **更简洁**：不需要检查 `success` 字段
2. **类型安全**：TypeScript 类型推导更准确
3. **标准化**：使用标准的 Promise 和异常处理
4. **符合直觉**：类似 fetch API 的设计
