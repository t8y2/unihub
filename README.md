# UniHub

一个现代化的 Electron 应用，支持强大的插件系统。

## ✨ 特性

- 🔌 **插件系统** - 支持 Vue/React/原生 JS 开发插件
- 🛡️ **权限管理** - 细粒度的插件权限控制
- 🔒 **插件隔离** - 进程、数据、文件系统完全隔离
- 🏪 **插件市场** - 零成本的插件分发系统（GitHub + jsDelivr）
- 🔍 **全局搜索** - ⌘K/Ctrl+K 快速搜索插件
- ⚡ **热重载** - 开发模式支持插件热重载
- 🎨 **现代 UI** - 基于 Vue 3 + Tailwind CSS

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

### 构建

```bash
# 构建所有平台
pnpm build

# 构建特定平台
pnpm build:mac
pnpm build:win
pnpm build:linux
```

## 📦 插件开发

### 创建插件

```bash
node tools/create-plugin.js
```

### 插件结构

```
my-plugin/
├── package.json          # 插件配置
├── index.html           # 入口文件
├── src/
│   ├── main.ts         # 主逻辑
│   └── App.vue         # Vue 组件
└── sidecar/            # 后端程序（可选）
    └── main.go
```

### 插件配置

在 `package.json` 中配置插件信息：

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "unihub": {
    "id": "com.example.myplugin",
    "name": "我的插件",
    "description": "插件描述",
    "category": "tool",
    "icon": "🚀",
    "permissions": ["fs", "clipboard", "http"]
  }
}
```

### 可用权限

- `fs` - 文件系统访问
- `clipboard` - 剪贴板访问
- `http` - 网络请求
- `notification` - 系统通知
- `spawn` - 执行外部程序
- `system` - 系统信息

### 插件 API

```typescript
// 文件系统
await window.api.fs.readFile(path)
await window.api.fs.writeFile(path, content)

// 剪贴板
await window.api.clipboard.writeText(text)
const text = await window.api.clipboard.readText()

// HTTP 请求
const response = await window.api.http.request({ url, method, body })

// 通知
await window.api.notification.show({ title, body })

// 执行程序
await window.api.spawn.execute(command, args)
```

## 🏪 插件市场

### 配置市场

1. 推送 `marketplace/` 目录到 GitHub
2. 编辑 `src/renderer/src/components/PluginMarketplace.vue`
3. 更新 `MARKETPLACE_URL` 为你的 CDN 地址：

```typescript
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub@main/marketplace/plugins.json'
```

### 提交插件

查看 [marketplace/CONTRIBUTING.md](./marketplace/CONTRIBUTING.md)

## 📚 文档

- [架构设计](./docs/ARCHITECTURE.md) - 系统架构说明
- [插件开发](./docs/PLUGIN_DEVELOPMENT.md) - 插件开发指南
- [插件 API](./docs/PLUGIN_API.md) - API 文档
- [插件隔离](./docs/ISOLATION_DEMO.md) - 隔离机制说明
- [市场指南](./docs/MARKETPLACE_GUIDE.md) - 插件市场使用指南
- [市场部署](./docs/MARKETPLACE_DEPLOYMENT.md) - 市场部署指南
- [快速开始](./MARKETPLACE_QUICKSTART.md) - 5 分钟搭建市场

## 🔧 开发工具

### 全局快捷键

- `⌘⇧Space` / `Ctrl+Shift+Space` - 显示/隐藏主窗口
- `⌘K` / `Ctrl+K` - 全局搜索
- `⌘T` / `Ctrl+T` - 新建标签
- `⌘W` / `Ctrl+W` - 关闭标签
- `⌘B` / `Ctrl+B` - 切换侧边栏

### 开发模式

在插件管理页面点击「开发模式」按钮，可以：

- 查看已安装插件
- 重载插件
- 查看插件日志
- 测试插件功能

## 🛡️ 安全性

- ✅ 插件进程隔离（WebContentsView + contextIsolation）
- ✅ 权限系统（运行时验证）
- ✅ 路径遍历攻击防护
- ✅ 数据隔离（每个插件独立存储）
- ✅ 插件 ID 验证

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**让我们一起打造更好的插件生态！** 🎉
