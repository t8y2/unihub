# UniHub 插件 API 使用指南

## 🌟 直接使用全局 API

UniHub 插件可以直接使用全局 API，无需导入任何模块。

### 数据库 API

```typescript
// 保存数据
await window.unihub.db.set('settings', { theme: 'dark' })

// 读取数据
const settings = await window.unihub.db.get('settings')

// 删除数据
await window.unihub.db.delete('settings')

// 获取所有键
const keys = await window.unihub.db.keys()

// 清空所有数据
await window.unihub.db.clear()
```

### Sidecar 调用

```typescript
// 调用 sidecar 进程
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({
    action: 'base64_encode',
    data: 'Hello World'
  }),
  timeout: 5000
})

// 解析结果
const response = JSON.parse(result.stdout)
console.log(response.result) // "SGVsbG8gV29ybGQ="
```

### 剪贴板 API

```typescript
// 写入文本
await window.unihub.clipboard.writeText('Hello')

// 读取文本
const text = await window.unihub.clipboard.readText()

// 读取图片
const imageDataUrl = await window.unihub.clipboard.readImage()

// 写入图片
await window.unihub.clipboard.writeImage(imageDataUrl)
```

### 通知 API

```typescript
// 显示通知
await window.unihub.notification.show({
  title: '任务完成',
  body: '文件已处理完成'
})
```

### HTTP API

```typescript
// GET 请求
const data = await window.unihub.http.get('https://api.example.com/data')

// POST 请求
const result = await window.unihub.http.post('https://api.example.com/submit', {
  name: 'Alice'
})
```

### 文件系统 API

```typescript
// 选择文件
const filePath = await window.unihub.fs.selectFile()

// 选择目录
const dirPath = await window.unihub.fs.selectDirectory()

// 读取文件（全局路径）
const content = await window.unihub.fs.readFile(filePath)

// 写入文件（全局路径）
await window.unihub.fs.writeFile(filePath, 'content')
```

### 插件目录操作

```typescript
// 获取插件目录
const pluginDir = await window.node.getPluginDir()

// 读取插件目录内的文件（相对路径）
const result = await window.node.fs.readFile('./config.json')
if (result.success) {
  console.log(result.data)
}
```

## 🎯 错误处理

所有 API 都使用标准的 Promise，失败时会抛出异常：

```typescript
try {
  const data = await window.unihub.db.get('key')
  console.log(data)
} catch (error) {
  console.error('读取失败:', error.message)
}
```

## 📝 类型提示

项目中的 `src/unihub.d.ts` 文件提供了完整的类型定义，TypeScript 会自动识别，无需手动导入。

## 🔗 与其他平台对比

| 平台   | API 调用方式                |
| ------ | --------------------------- |
| uTools | `utools.db.put()`           |
| Rubick | `window.rubick.db.put()`    |
| UniHub | `window.unihub.db.set()` ✅ |

UniHub 的 API 设计更现代化：

- ✅ 使用 `set/get/delete` 而不是 `put/get/remove`
- ✅ 统一的错误处理（抛出异常）
- ✅ 完整的 TypeScript 类型支持
- ✅ 支持 async/await
