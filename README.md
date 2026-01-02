# UniHub

一个现代化的 Electron 应用，支持强大的插件系统。

## ✨ 特性

- 🔌 **插件系统** - 支持 Vue/React/原生 JS 开发插件
- 🛡️ **权限管理** - 细粒度的插件权限控制
- 🔒 **插件隔离** - 进程、数据、文件系统完全隔离
- 🏪 **插件市场** - 零成本的插件分发系统（GitHub + jsDelivr）
- 🔍 **全局搜索** - <kbd>⌘K</kbd> 快速搜索插件
- ⚡ **热重载** - 开发模式支持插件热重载
- 🎨 **现代 UI** - Vue 3 + Tailwind CSS + shadcn-vue

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
pnpm build              # 构建所有平台
pnpm build:mac          # macOS
pnpm build:win          # Windows
pnpm build:linux        # Linux
```

## 📦 插件开发

### 三个示例，由简到繁

| 示例                                                  | 难度        | 技术栈         | 适合场景 |
| ----------------------------------------------------- | ----------- | -------------- | -------- |
| [simple-html-plugin](./examples/simple-html-plugin)   | ⭐ 入门     | 纯 HTML/CSS/JS | 快速原型 |
| [h5-formatter-plugin](./examples/h5-formatter-plugin) | ⭐⭐ 进阶   | Vue 3 + Vite   | 现代工具 |
| [modern-vue-plugin](./examples/modern-vue-plugin)     | ⭐⭐⭐ 高级 | Vue 3 + Python | 复杂应用 |

👉 **[查看完整插件开发指南](./examples/README.md)**

### 快速创建插件

```bash
# 从模板创建（即将推出）
node tools/create-plugin.js my-plugin
```

### 基本配置

在 `package.json` 中配置插件：

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
    "entry": "dist/index.html",
    "permissions": ["clipboard"]
  }
}
```

👉 **[查看完整配置说明](./docs/plugin-development/package-json-guide.md)**

## 🏪 插件市场

### 使用插件商店

1. 打开 UniHub
2. 进入「插件管理」→「插件商店」
3. 浏览并安装插件

### 发布你的插件

1. 开发并测试插件
2. 提交 PR 到 `marketplace/plugins.json`
3. 等待审核

👉 **[查看发布指南](./docs/marketplace/publishing-guide.md)**

## 🔧 快捷键

| 功能       | macOS         | Windows/Linux     |
| ---------- | ------------- | ----------------- |
| 全局搜索   | <kbd>⌘K</kbd> | <kbd>Ctrl+K</kbd> |
| 新建标签   | <kbd>⌘T</kbd> | <kbd>Ctrl+T</kbd> |
| 关闭标签   | <kbd>⌘W</kbd> | <kbd>Ctrl+W</kbd> |
| 切换侧边栏 | <kbd>⌘B</kbd> | <kbd>Ctrl+B</kbd> |

## 📚 文档

- 🔌 **[插件示例](./examples/README.md)** - 三个不同难度的完整示例
- ⚙️ **[插件配置指南](./docs/plugin-development/package-json-guide.md)** - package.json 配置详解
- 🏪 **[发布插件](./marketplace/CONTRIBUTING.md)** - 如何发布插件到市场

## 🛡️ 安全性

- ✅ 插件进程隔离（WebContentsView）
- ✅ 权限系统（运行时验证）
- ✅ 路径遍历攻击防护
- ✅ 数据隔离（独立存储）
- ✅ 插件 ID 验证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**让我们一起打造更好的插件生态！** 🎉
