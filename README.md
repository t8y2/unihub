# UniHub

一个现代化的 Electron 插件平台，支持热重载、Sidecar 模式和完善的权限系统。

## ✨ 核心特性

- 🔍 **全局搜索**：快速搜索和启动插件（⌘K / Ctrl+K）
- 🔒 **权限系统**：细粒度权限控制，保护用户数据安全
- ⚡ **热重载**：开发模式支持实时预览
- 🚀 **Sidecar 支持**：集成 Go/Rust/C++ 原生程序
- 🎨 **现代化 UI**：基于 Vue 3 + Tailwind CSS
- ⌨️ **全局快捷键**：⌘⇧Space 快速唤起（类似 Spotlight）
- 📦 **标准化配置**：使用 package.json，符合 npm 生态

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建（编译代码）
pnpm build

# 打包应用
pnpm build:unpack    # 打包但不生成安装包（用于测试）
pnpm build:mac       # 打包 macOS 应用
pnpm build:win       # 打包 Windows 应用
pnpm build:linux     # 打包 Linux 应用

# 代码检查
pnpm lint            # ESLint 检查
pnpm typecheck       # TypeScript 类型检查
pnpm format          # Prettier 格式化
```

## 插件开发

### 快速开始

查看 [快速开始指南](./docs/QUICK_START.md) 了解如何在 5 分钟内创建你的第一个插件。

### 1. 创建插件

```bash
npm create vite@latest my-plugin -- --template vue-ts
cd my-plugin
npm install
```

### 2. 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // 🔥 关键：使用相对路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### 3. 配置 package.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "unihub": {
    "id": "com.example.my-plugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["fs", "clipboard", "http"],
    "keywords": ["工具", "效率", "clipboard"],
    "dev": {
      "enabled": false,
      "url": "http://localhost:5173",
      "autoReload": true
    }
  }
}
```

**权限说明**：
- `fs` - 文件系统访问
- `clipboard` - 剪贴板访问
- `http` - HTTP 请求
- `notification` - 系统通知
- `spawn` - 子进程执行（Sidecar）
- `system` - 系统信息

### 4. 使用 API

```typescript
// 打开插件（在独立窗口中）
await window.api.plugin.open('com.example.my-plugin')

// 关闭插件窗口
await window.api.plugin.close('com.example.my-plugin')

// 在插件窗口中使用 API
// 文件系统
const result = await window.node.fs.readFile('./data.json')
await window.node.fs.writeFile('./output.txt', 'Hello')

// 数据库
await window.unihub.db.put('key', { value: 123 })
const data = await window.unihub.db.get('key')

// 剪贴板
await window.unihub.clipboard.writeText('Hello')
const text = await window.unihub.clipboard.readText()

// HTTP
const data = await window.unihub.http.get('https://api.example.com')

// Sidecar（可选）
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({ action: 'process' })
})
```

## 架构设计

### 三等公民制度

1. **第一公民：JavaScript/TypeScript（80%）**
   - 进程内，< 1ms
   - 零依赖，内置支持
   - 推荐用于 UI、文件处理、HTTP 请求

2. **第二公民：Go/Rust/C++（15%）**
   - Sidecar 模式，50-200ms
   - 编译成 .exe
   - 推荐用于图像处理、视频转码

3. **第三公民：Python/Shell（5%）**
   - 不推荐，环境依赖
   - 需打包成 .exe

### 为什么用多文件模式？

1. **安全性**：避免 `unsafe-inline`，防止 XSS
2. **性能**：避免 Base64 膨胀 33%
3. **稳定性**：工具链默认支持

## 文档

- [快速开始指南](./docs/QUICK_START.md) - 5 分钟上手
- [改进说明](./docs/IMPROVEMENTS.md) - 新功能和改进
- [插件 API 参考](./docs/PLUGIN_API.md) - 完整 API 文档
- [插件开发指南](./docs/PLUGIN_DEVELOPMENT.md) - 详细开发教程
- [热重载指南](./docs/HOT_RELOAD.md) - 开发模式配置
- [架构设计](./docs/ARCHITECTURE.md) - 系统架构说明

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘K` / `Ctrl+K` | 打开全局搜索 |
| `⌘P` / `Ctrl+P` | 打开全局搜索 |
| `⌘T` / `Ctrl+T` | 新建标签页 |
| `⌘W` / `Ctrl+W` | 关闭当前标签 |
| `⌘B` / `Ctrl+B` | 切换侧边栏 |
| `⌘⇧Space` / `Ctrl+Shift+Space` | 显示/隐藏主窗口 |

## 与竞品对比

| 功能 | uTools | Rubick | UniHub |
|------|--------|--------|--------|
| 全局搜索 | ✅ | ✅ | ✅ |
| 权限系统 | ✅ | ❌ | ✅ |
| 热重载 | ✅ | ❌ | ✅ |
| Sidecar | ❌ | ❌ | ✅ |
| 开源 | ❌ | ✅ | ✅ |
| 标准配置 | ❌ | ❌ | ✅ |

## 文档

- [插件 API 参考](./docs/PLUGIN_API.md)
- [插件开发指南](./docs/PLUGIN_DEVELOPMENT.md)
- [热重载指南](./docs/HOT_RELOAD.md)
- [架构设计](./docs/ARCHITECTURE.md)

## 示例

参考 `examples/modern-vue-plugin/` 目录。

```bash
cd examples/modern-vue-plugin
npm install
npm run dev      # 开发模式
npm run build    # 构建
npm run package  # 打包成 .zip
```

## License

MIT
