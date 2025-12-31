# UniHub API 重新设计方案

## 问题分析

### 当前 API 的问题

1. **返回值不一致**：`{ success, data }` vs 直接返回数据
2. **错误处理混乱**：有的抛异常，有的返回 error 字段
3. **层级复杂**：`window.api.plugin.backendCall` vs `window.unihub.backend.call` vs `window.node.spawn`
4. **JSON 序列化问题**：参数传递时对象被转换成 `"[object Object]"`

## 新设计原则

### 1. 统一返回格式

- ✅ **成功**：直接返回数据（不包装）
- ❌ **失败**：抛出异常（使用 try-catch 捕获）

```typescript
// ✅ 好的设计
const data = await window.unihub.db.get('key') // 直接返回数据或 null

// ❌ 旧的设计
const result = await window.unihub.db.get('key')
if (result.success) {
  const data = result.data
}
```

### 2. 简化命名空间

只保留两个顶级命名空间：

- `window.unihub` - 高级 API（自动处理插件 ID）
- `window.node` - 底层 Node.js API（需要手动处理路径）

### 3. Backend/Sidecar 统一

不再区分 backend 和 sidecar，统一使用 `window.node.spawn()`

## 新 API 设计

### window.unihub（高级 API）

```typescript
interface UniHub {
  // 数据库（自动使用当前插件 ID）
  db: {
    get(key: string): Promise<any>
    set(key: string, value: any): Promise<void>
    delete(key: string): Promise<void>
    keys(): Promise<string[]>
    clear(): Promise<void>
  }

  // 剪贴板
  clipboard: {
    readText(): Promise<string>
    writeText(text: string): Promise<void>
    readImage(): Promise<string | null> // Data URL
    writeImage(dataUrl: string): Promise<void>
  }

  // 文件系统（全局访问）
  fs: {
    readFile(path: string): Promise<string>
    writeFile(path: string, content: string): Promise<void>
    readDir(path: string): Promise<string[]>
    exists(path: string): Promise<boolean>
    stat(path: string): Promise<FileStats>
    mkdir(path: string): Promise<void>
    selectFile(): Promise<string | null>
    selectDirectory(): Promise<string | null>
  }

  // HTTP 请求
  http: {
    get(url: string, options?: RequestOptions): Promise<any>
    post(url: string, data: any, options?: RequestOptions): Promise<any>
    put(url: string, data: any, options?: RequestOptions): Promise<any>
    delete(url: string, options?: RequestOptions): Promise<any>
    request(options: RequestOptions): Promise<any>
  }

  // 系统
  system: {
    getInfo(): Promise<SystemInfo>
    openExternal(url: string): Promise<void>
    showInFolder(path: string): Promise<void>
  }

  // 通知
  notification: {
    show(options: NotificationOptions): Promise<void>
  }
}
```

### window.node（底层 API）

```typescript
interface NodeAPI {
  // 文件系统（限制在插件目录内）
  fs: {
    readFile(relativePath: string): Promise<string>
    writeFile(relativePath: string, content: string): Promise<void>
    readDir(relativePath: string): Promise<string[]>
    exists(relativePath: string): Promise<boolean>
    stat(relativePath: string): Promise<FileStats>
    mkdir(relativePath: string): Promise<void>
  }

  // 子进程（Sidecar）
  spawn(command: string, args?: string[], options?: SpawnOptions): Promise<SpawnResult>

  // 获取插件目录
  getPluginDir(): Promise<string>
}

interface SpawnOptions {
  timeout?: number // 超时时间（毫秒）
  input?: string // stdin 输入
  env?: Record<string, string> // 环境变量
}

interface SpawnResult {
  stdout: string
  stderr: string
  exitCode: number
}
```

## 使用示例

### 1. 数据库操作

```typescript
// 保存数据
await window.unihub.db.set('settings', { theme: 'dark' })

// 读取数据
const settings = await window.unihub.db.get('settings')
console.log(settings.theme) // 'dark'

// 删除数据
await window.unihub.db.delete('settings')
```

### 2. Sidecar 调用

```typescript
// 调用 sidecar 进程
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({
    action: 'reverse',
    data: 'Hello World'
  }),
  timeout: 5000
})

const response = JSON.parse(result.stdout)
console.log(response.result) // 'dlroW olleH'
```

### 3. HTTP 请求

```typescript
// GET 请求
const data = await window.unihub.http.get('https://api.example.com/data')

// POST 请求
const result = await window.unihub.http.post('https://api.example.com/submit', {
  name: 'Alice',
  age: 25
})
```

### 4. 错误处理

```typescript
try {
  const data = await window.unihub.db.get('key')
  console.log(data)
} catch (error) {
  console.error('读取失败:', error.message)
}
```

## 迁移指南

### 旧 API → 新 API

```typescript
// 数据库
// 旧: const result = await window.unihub.db.get('key'); if (result.success) ...
// 新: const data = await window.unihub.db.get('key')

// 旧: await window.unihub.db.put('key', value)
// 新: await window.unihub.db.set('key', value)

// Backend 调用
// 旧: await window.api.plugin.backendCall(pluginId, 'func', args)
// 新: const result = await window.node.spawn('./backend/main', [], { input: JSON.stringify({ function: 'func', args }) })

// 文件系统
// 旧: const result = await window.node.fs.readFile('file.txt'); if (result.success) ...
// 新: const content = await window.node.fs.readFile('file.txt')
```

## 实现优先级

1. ✅ **Phase 1**: 重构 `window.unihub.db` API
2. ✅ **Phase 2**: 重构 `window.node.spawn` API
3. ⏳ **Phase 3**: 重构其他 API
4. ⏳ **Phase 4**: 更新文档和示例

## 优势

1. **简单直观**：不需要检查 `success` 字段
2. **类型安全**：TypeScript 类型推导更准确
3. **错误处理统一**：使用标准的 try-catch
4. **代码更简洁**：减少样板代码
5. **符合 Web 标准**：类似 fetch API 的设计
