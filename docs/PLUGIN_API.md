# UniHub 插件 API 参考

## 🌐 全局对象

插件可以通过 `window.unihub` 访问所有 API。

```javascript
// 检查 API 是否可用
if (window.unihub) {
  console.log('UniHub API 已就绪')
}
```

## 📦 数据库 API (db)

持久化存储插件数据，基于键值对。

### db.put(key, value)

存储数据

```javascript
// 存储字符串
await window.unihub.db.put('username', 'Alice')

// 存储对象
await window.unihub.db.put('settings', {
  theme: 'dark',
  language: 'zh-CN'
})

// 存储数组
await window.unihub.db.put('history', ['item1', 'item2'])
```

### db.get(key)

获取数据

```javascript
const username = await window.unihub.db.get('username')
// 返回: 'Alice'

const settings = await window.unihub.db.get('settings')
// 返回: { theme: 'dark', language: 'zh-CN' }

// 不存在的键返回 null
const notFound = await window.unihub.db.get('nonexistent')
// 返回: null
```

### db.remove(key)

删除数据

```javascript
await window.unihub.db.remove('username')
```

### db.allKeys()

获取所有键

```javascript
const keys = await window.unihub.db.allKeys()
// 返回: ['username', 'settings', 'history']
```

### db.clear()

清空所有数据

```javascript
await window.unihub.db.clear()
```

## 📋 剪贴板 API (clipboard)

### clipboard.readText()

读取剪贴板文本

```javascript
const text = await window.unihub.clipboard.readText()
console.log('剪贴板内容:', text)
```

### clipboard.writeText(text)

写入剪贴板文本

```javascript
await window.unihub.clipboard.writeText('Hello UniHub!')
```

### clipboard.readImage()

读取剪贴板图片（返回 Data URL）

```javascript
const imageDataUrl = await window.unihub.clipboard.readImage()
if (imageDataUrl) {
  document.querySelector('img').src = imageDataUrl
}
```

### clipboard.writeImage(dataUrl)

写入剪贴板图片

```javascript
await window.unihub.clipboard.writeImage('data:image/png;base64,...')
```

## 📁 文件系统 API (fs)

### fs.readFile(path)

读取文件内容

```javascript
const content = await window.unihub.fs.readFile('/path/to/file.txt')
console.log(content)
```

### fs.writeFile(path, content)

写入文件内容

```javascript
await window.unihub.fs.writeFile('/path/to/file.txt', 'Hello World')
```

### fs.readDir(path)

读取目录内容

```javascript
const files = await window.unihub.fs.readDir('/path/to/directory')
// 返回: ['file1.txt', 'file2.txt', 'subdir']
```

### fs.exists(path)

检查文件/目录是否存在

```javascript
const exists = await window.unihub.fs.exists('/path/to/file.txt')
if (exists) {
  console.log('文件存在')
}
```

### fs.stat(path)

获取文件/目录信息

```javascript
const info = await window.unihub.fs.stat('/path/to/file.txt')
console.log(info)
// {
//   isFile: true,
//   isDirectory: false,
//   size: 1024,
//   mtime: '2024-01-01T00:00:00.000Z'
// }
```

### fs.mkdir(path)

创建目录（递归）

```javascript
await window.unihub.fs.mkdir('/path/to/new/directory')
```

### fs.selectFile()

打开文件选择对话框

```javascript
const filePath = await window.unihub.fs.selectFile()
if (filePath) {
  console.log('选择的文件:', filePath)
}
```

### fs.selectDirectory()

打开目录选择对话框

```javascript
const dirPath = await window.unihub.fs.selectDirectory()
if (dirPath) {
  console.log('选择的目录:', dirPath)
}
```

## 🌍 HTTP API (http)

发起 HTTP 请求（避免 CORS 限制）

### http.get(url, options)

GET 请求

```javascript
const response = await window.unihub.http.get('https://api.example.com/data')
console.log(response.body)
```

### http.post(url, data, options)

POST 请求

```javascript
const response = await window.unihub.http.post('https://api.example.com/submit', {
  name: 'Alice',
  age: 25
})
console.log(response.body)
```

### http.request(options)

通用请求

```javascript
const response = await window.unihub.http.request({
  url: 'https://api.example.com/data',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: { key: 'value' }
})

console.log(response)
// {
//   status: 200,
//   statusText: 'OK',
//   headers: { ... },
//   body: '...'
// }
```

## 💻 系统 API (system)

### system.getInfo()

获取系统信息

```javascript
const info = await window.unihub.system.getInfo()
console.log(info)
// {
//   platform: 'darwin',
//   arch: 'arm64',
//   version: '1.0.0',
//   appPath: '/Applications/UniHub.app',
//   userDataPath: '/Users/xxx/Library/Application Support/UniHub',
//   tempPath: '/var/folders/...'
// }
```

### system.openExternal(url)

在默认浏览器中打开 URL

```javascript
await window.unihub.system.openExternal('https://github.com')
```

### system.showInFolder(path)

在文件管理器中显示文件

```javascript
await window.unihub.system.showInFolder('/path/to/file.txt')
```

## 🔔 通知 API (notification)

### notification.show(options)

显示系统通知

```javascript
await window.unihub.notification.show({
  title: '任务完成',
  body: '文件已成功处理',
  icon: 'https://example.com/icon.png' // 可选
})
```

## 🔧 后端调用 API (backend)

如果插件有自定义后端，可以通过此 API 调用。

### backend.call(functionName, args)

调用后端函数

```javascript
const result = await window.unihub.backend.call('processImage', {
  path: '/path/to/image.jpg',
  quality: 80
})

console.log(result)
```

## 📝 完整示例

### 简单的 TODO 插件

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TODO 插件</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 20px;
      }
      .todo-item {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      button {
        padding: 8px 16px;
        margin: 5px;
      }
    </style>
  </head>
  <body>
    <h1>📝 TODO List</h1>

    <input id="input" type="text" placeholder="添加任务..." />
    <button onclick="addTodo()">添加</button>

    <div id="list"></div>

    <script>
      const PLUGIN_ID = 'com.example.todo'

      // 加载任务列表
      async function loadTodos() {
        const todos = (await window.unihub.db.get('todos')) || []
        renderTodos(todos)
      }

      // 添加任务
      async function addTodo() {
        const input = document.getElementById('input')
        const text = input.value.trim()

        if (!text) return

        const todos = (await window.unihub.db.get('todos')) || []
        todos.push({ id: Date.now(), text, done: false })

        await window.unihub.db.put('todos', todos)
        input.value = ''
        loadTodos()
      }

      // 切换完成状态
      async function toggleTodo(id) {
        const todos = (await window.unihub.db.get('todos')) || []
        const todo = todos.find((t) => t.id === id)
        if (todo) {
          todo.done = !todo.done
          await window.unihub.db.put('todos', todos)
          loadTodos()
        }
      }

      // 删除任务
      async function deleteTodo(id) {
        let todos = (await window.unihub.db.get('todos')) || []
        todos = todos.filter((t) => t.id !== id)
        await window.unihub.db.put('todos', todos)
        loadTodos()
      }

      // 渲染列表
      function renderTodos(todos) {
        const list = document.getElementById('list')
        list.innerHTML = todos
          .map(
            (todo) => `
        <div class="todo-item">
          <input 
            type="checkbox" 
            ${todo.done ? 'checked' : ''} 
            onchange="toggleTodo(${todo.id})"
          />
          <span style="${todo.done ? 'text-decoration: line-through' : ''}">
            ${todo.text}
          </span>
          <button onclick="deleteTodo(${todo.id})">删除</button>
        </div>
      `
          )
          .join('')
      }

      // 初始化
      loadTodos()
    </script>
  </body>
</html>
```

## 🔄 兼容性说明

### 与 Rubick 的对比

| Rubick                      | UniHub                      | 说明     |
| --------------------------- | --------------------------- | -------- |
| `window.rubick.db.put()`    | `window.unihub.db.put()`    | 存储数据 |
| `window.rubick.db.get()`    | `window.unihub.db.get()`    | 获取数据 |
| `window.rubick.db.remove()` | `window.unihub.db.remove()` | 删除数据 |

### 与 uTools 的对比

| uTools                      | UniHub                                | 说明     |
| --------------------------- | ------------------------------------- | -------- |
| `utools.db.put()`           | `window.unihub.db.put()`              | 存储数据 |
| `utools.db.get()`           | `window.unihub.db.get()`              | 获取数据 |
| `utools.copyText()`         | `window.unihub.clipboard.writeText()` | 复制文本 |
| `utools.showNotification()` | `window.unihub.notification.show()`   | 显示通知 |

## 🎯 最佳实践

1. **错误处理**：所有 API 调用都应该使用 try-catch
2. **数据验证**：从 db 读取的数据可能为 null，需要提供默认值
3. **性能优化**：避免频繁调用 db.put()，可以批量更新
4. **安全性**：不要存储敏感信息（密码、token）在 db 中

```javascript
// ✅ 好的实践
try {
  const data = (await window.unihub.db.get('settings')) || { theme: 'light' }
  console.log(data.theme)
} catch (error) {
  console.error('读取设置失败:', error)
}

// ❌ 不好的实践
const data = await window.unihub.db.get('settings')
console.log(data.theme) // 如果 data 为 null 会报错
```
