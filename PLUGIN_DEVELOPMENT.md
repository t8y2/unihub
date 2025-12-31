# UniHub 插件开发指南

## 🚀 快速开始

### 1. 创建插件

```bash
node tools/create-plugin.js my-plugin
cd my-plugin
npm install
npm run dev
```

### 2. 开发插件

编辑 `src/App.vue`，使用 `window.unihub` API：

```vue
<script setup>
import { ref } from 'vue'

const input = ref('')
const result = ref('')

// 使用数据库 API
const saveData = async () => {
  await window.unihub.db.put('mykey', input.value)
  result.value = '已保存'
}

const loadData = async () => {
  const value = await window.unihub.db.get('mykey')
  result.value = value || '无数据'
}

// 使用剪贴板 API
const copyToClipboard = async () => {
  await window.unihub.clipboard.writeText(input.value)
  result.value = '已复制到剪贴板'
}
</script>
```

### 3. 打包发布

```bash
npm run build    # 构建
npm run package  # 打包成 plugin.zip
```

## 📦 配置文件 (package.json)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "Your Name <your@email.com>",
  "keywords": ["tool", "utility"],
  "unihub": {
    "id": "com.yourname.myplugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": []
  }
}
```

### 字段说明

**标准字段（package.json）**
- `name`: 插件名称（必需）
- `version`: 版本号，遵循 semver（必需）
- `description`: 描述（必需）
- `author`: 作者信息（必需）
- `keywords`: 关键词数组
- `license`: 开源协议（推荐 MIT）
- `homepage`: 主页 URL
- `repository`: 代码仓库

**UniHub 扩展字段（unihub）**
- `id`: 唯一标识符（必需，格式：com.author.name）
- `icon`: 图标（emoji 或 SVG path）
- `category`: 分类（tool/productivity/entertainment/developer）
- `entry`: 前端入口文件（必需）
- `permissions`: 权限列表

### 可选后端

如果需要后端能力（Python/Go/Node.js）：

```json
{
  "unihub": {
    "backend": {
      "entry": "backend/main.py",
      "type": "python"
    },
    "permissions": ["backend"]
  }
}
```

**后端类型**：
- `python` - Python 脚本
- `node` - Node.js 脚本
- `go` - Go 程序（需编译）
- `binary` - 编译后的二进制文件

**建议**：80% 的插件只需前端 + UniHub API，无需自定义后端。

## 🔧 打包流程

### 1. 开发阶段

```bash
npm run dev        # 开发调试
```

### 2. 构建阶段

```bash
npm run build      # 构建生产版本
```

构建后的 `dist/` 目录：

```
dist/
└── index.html       # 自包含的单文件（所有 JS/CSS 已内联）
```

**关键要求**：
- `index.html` 必须是自包含的
- 所有依赖已打包（无外部依赖）
- 可以直接在浏览器中打开运行

### 3. 打包阶段

```bash
npm run package    # 打包成 plugin.zip
```

生成的 `plugin.zip` 结构：

```
plugin.zip
├── package.json     # 配置文件
├── dist/            # 构建产物
│   └── index.html
├── backend/         # 后端文件（可选）
└── README.md        # 说明文档（可选）
```

### Vite 配置

确保构建产物是单文件：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile() // 打包成单个 HTML 文件
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000, // 内联所有资源
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
```

## 🔌 API 参考

### 数据库 API

```javascript
// 存储数据
await window.unihub.db.put('key', 'value')
await window.unihub.db.put('settings', { theme: 'dark' })

// 读取数据
const value = await window.unihub.db.get('key')
const settings = await window.unihub.db.get('settings')

// 删除数据
await window.unihub.db.remove('key')

// 获取所有键
const keys = await window.unihub.db.allKeys()

// 清空所有数据
await window.unihub.db.clear()
```

### 剪贴板 API

```javascript
// 读写文本
const text = await window.unihub.clipboard.readText()
await window.unihub.clipboard.writeText('Hello')

// 读写图片
const imageDataUrl = await window.unihub.clipboard.readImage()
await window.unihub.clipboard.writeImage(imageDataUrl)
```

### 文件系统 API

```javascript
// 读写文件
const content = await window.unihub.fs.readFile('/path/to/file.txt')
await window.unihub.fs.writeFile('/path/to/file.txt', 'content')

// 读取目录
const files = await window.unihub.fs.readDir('/path/to/dir')

// 检查文件
const exists = await window.unihub.fs.exists('/path/to/file')

// 选择文件/目录
const filePath = await window.unihub.fs.selectFile()
const dirPath = await window.unihub.fs.selectDirectory()
```

### HTTP API

```javascript
// GET 请求
const data = await window.unihub.http.get('https://api.example.com/data')

// POST 请求
const result = await window.unihub.http.post('https://api.example.com/submit', {
  name: 'Alice'
})

// 自定义请求
const response = await window.unihub.http.request({
  url: 'https://api.example.com/data',
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: { key: 'value' }
})
```

### 系统 API

```javascript
// 获取系统信息
const info = await window.unihub.system.getInfo()
// { platform: 'darwin', arch: 'arm64', version: '1.0.0', ... }

// 在浏览器中打开链接
await window.unihub.system.openExternal('https://github.com')

// 在文件管理器中显示文件
await window.unihub.system.showInFolder('/path/to/file')
```

### 通知 API

```javascript
await window.unihub.notification.show({
  title: '任务完成',
  body: '文件已处理完成',
  icon: 'https://example.com/icon.png' // 可选
})
```

### 后端调用 API

如果插件有自定义后端：

```javascript
const result = await window.unihub.backend.call('functionName', {
  arg1: 'value1',
  arg2: 'value2'
})
```

## 📝 完整示例

### TODO 插件

```html
<!DOCTYPE html>
<html>
<head>
  <title>TODO</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .todo { padding: 10px; border-bottom: 1px solid #eee; }
    button { padding: 8px 16px; margin: 5px; }
  </style>
</head>
<body>
  <h1>📝 TODO List</h1>
  <input id="input" type="text" placeholder="添加任务..." />
  <button onclick="addTodo()">添加</button>
  <div id="list"></div>

  <script>
    async function loadTodos() {
      const todos = await window.unihub.db.get('todos') || []
      document.getElementById('list').innerHTML = todos.map(todo => `
        <div class="todo">
          <input type="checkbox" ${todo.done ? 'checked' : ''} 
                 onchange="toggleTodo(${todo.id})">
          <span style="${todo.done ? 'text-decoration: line-through' : ''}">
            ${todo.text}
          </span>
          <button onclick="deleteTodo(${todo.id})">删除</button>
        </div>
      `).join('')
    }
    
    async function addTodo() {
      const input = document.getElementById('input')
      const text = input.value.trim()
      if (!text) return
      
      const todos = await window.unihub.db.get('todos') || []
      todos.push({ id: Date.now(), text, done: false })
      await window.unihub.db.put('todos', todos)
      input.value = ''
      loadTodos()
    }
    
    async function toggleTodo(id) {
      const todos = await window.unihub.db.get('todos') || []
      const todo = todos.find(t => t.id === id)
      if (todo) {
        todo.done = !todo.done
        await window.unihub.db.put('todos', todos)
        loadTodos()
      }
    }
    
    async function deleteTodo(id) {
      let todos = await window.unihub.db.get('todos') || []
      todos = todos.filter(t => t.id !== id)
      await window.unihub.db.put('todos', todos)
      loadTodos()
    }
    
    loadTodos()
  </script>
</body>
</html>
```

## 🏗️ 项目结构

```
my-plugin/
├── package.json          # 配置文件
├── index.html            # 开发入口
├── vite.config.ts        # Vite 配置
├── src/
│   ├── main.ts          # 主入口
│   ├── App.vue          # 主组件
│   └── style.css        # 样式
├── dist/                # 构建产物
│   └── index.html       # 打包后的单文件
├── scripts/
│   └── package.js       # 打包脚本
└── README.md
```

## 🔧 Vite 配置

确保构建产物是自包含的单个 HTML 文件：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile() // 打包成单个 HTML
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
```

## 📤 发布流程

### 1. 本地测试

```bash
npm run build
npm run package
# 在 UniHub 中安装 plugin.zip 测试
```

### 2. 发布到 GitHub

```bash
# 创建 Release
git tag v1.0.0
git push origin v1.0.0

# 在 GitHub Release 页面上传 plugin.zip
```

### 3. 提交到插件市场

提交 PR 到 `unihub-plugins` 仓库，添加插件信息到 `plugins.json`：

```json
{
  "id": "com.yourname.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "Your Name",
  "icon": "🚀",
  "category": "tool",
  "keywords": ["tool", "utility"],
  "downloadUrl": "https://github.com/yourname/plugin/releases/download/v1.0.0/plugin.zip",
  "homepage": "https://github.com/yourname/plugin",
  "screenshots": []
}
```

### 插件市场架构

采用 GitHub 仓库作为插件市场后端（零成本方案）：

```
unihub-plugins/
├── plugins.json          # 插件列表
├── plugins/              # 插件详情
│   ├── com.example.plugin1.json
│   └── com.example.plugin2.json
└── README.md
```

**优势**：
- ✅ 零成本（使用 GitHub）
- ✅ 去中心化（开发者自己托管文件）
- ✅ 透明（所有提交都是 PR）
- ✅ 版本控制（Git 历史）
- ✅ CDN 加速（GitHub + jsDelivr）

## 💡 最佳实践

1. **错误处理**：所有 API 调用使用 try-catch
2. **数据验证**：从 db 读取的数据可能为 null
3. **性能优化**：避免频繁调用 db.put()
4. **安全性**：不要存储敏感信息

```javascript
// ✅ 好的实践
try {
  const settings = await window.unihub.db.get('settings') || { theme: 'light' }
  console.log(settings.theme)
} catch (error) {
  console.error('读取失败:', error)
}

// ❌ 不好的实践
const settings = await window.unihub.db.get('settings')
console.log(settings.theme) // 如果为 null 会报错
```

## 🆚 与其他平台对比

| 功能 | Rubick | uTools | UniHub |
|------|--------|--------|--------|
| 配置文件 | package.json | plugin.json | package.json ✅ |
| 打包方式 | 源码 | .upx | .zip ✅ |
| 数据存储 | window.rubick.db | utools.db | window.unihub.db ✅ |
| 文件系统 | ❌ | ✅ | window.unihub.fs ✅ |
| HTTP 请求 | ❌ | ❌ | window.unihub.http ✅ |
| 后端支持 | ❌ | ❌ | 可选 ✅ |

## 🔗 相关链接

- [示例插件](examples/modern-vue-plugin)
- [API 完整文档](PLUGIN_API_REFERENCE.md)

---

**提示**：查看 `examples/modern-vue-plugin` 获取完整的工作示例。
