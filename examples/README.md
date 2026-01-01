# UniHub 插件开发示例

欢迎来到 UniHub 插件开发！这里提供了三个不同复杂度的插件示例，帮助你快速上手。

## 📚 示例概览

| 示例                                         | 难度        | 技术栈                    | 适合场景           |
| -------------------------------------------- | ----------- | ------------------------- | ------------------ |
| [simple-html-plugin](#-simple-html-plugin)   | ⭐ 入门     | 纯 HTML/CSS/JS            | 快速原型、简单工具 |
| [h5-formatter-plugin](#-h5-formatter-plugin) | ⭐⭐ 进阶   | Vue 3 + Vite + TypeScript | 代码格式化工具     |
| [modern-vue-plugin](#-modern-vue-plugin)     | ⭐⭐⭐ 高级 | Vue 3 + Python 后端       | 复杂业务逻辑       |

---

## 🎯 simple-html-plugin

**最简单的插件示例 - 无需构建工具**

### 特点

- ✅ 纯 HTML/CSS/JavaScript
- ✅ 单文件，易于理解
- ✅ 无需 Node.js 和构建工具
- ✅ 适合快速原型开发

### 快速开始

```bash
cd simple-html-plugin
zip -r plugin.zip package.json dist/
```

### 适用场景

- 学习插件开发基础
- 快速创建简单工具
- 不需要复杂依赖的场景

📖 [查看详细文档](./simple-html-plugin/README.md)

---

## 🎨 h5-formatter-plugin

**现代化的代码格式化工具**

### 特点

- ✅ Vue 3 + Composition API
- ✅ Vite 构建 + TypeScript
- ✅ 使用 Prettier 和 highlight.js
- ✅ 完整的开发工作流

### 快速开始

```bash
cd h5-formatter-plugin
npm install
npm run dev      # 开发模式
npm run build    # 构建
npm run package  # 打包
```

### 适用场景

- 需要使用现代前端框架
- 需要类型安全（TypeScript）
- 需要第三方库支持
- 需要热更新开发体验

📖 [查看详细文档](./h5-formatter-plugin/README.md)

---

## 🚀 modern-vue-plugin

**完整的前后端插件示例**

### 特点

- ✅ Vue 3 前端 + Python 后端
- ✅ 完整的 API 调用示例
- ✅ 数据库、剪贴板、系统 API
- ✅ 生产级代码结构

### 快速开始

```bash
cd modern-vue-plugin
npm install
npm run dev      # 开发模式
npm run build    # 构建
npm run package  # 打包
```

### 适用场景

- 需要后端处理逻辑
- 需要数据持久化
- 需要系统级 API 调用
- 复杂的业务逻辑

📖 [查看详细文档](./modern-vue-plugin/README.md)

---

## 🛠️ 开发工具

### 脚手架工具（即将推出）

```bash
# 快速创建新插件
node ../tools/create-plugin.js my-plugin
cd my-plugin
npm install
npm run dev
```

### 推荐的开发环境

- **编辑器**: VS Code
- **Node.js**: v18+
- **包管理器**: pnpm (推荐) / npm
- **浏览器**: Chrome DevTools

---

## 📖 学习路径

### 1️⃣ 初学者

1. 从 `simple-html-plugin` 开始
2. 了解 `package.json` 配置
3. 学习基本的插件 API

### 2️⃣ 进阶开发者

1. 学习 `h5-formatter-plugin`
2. 掌握 Vue 3 + Vite 开发流程
3. 了解构建和打包流程

### 3️⃣ 高级开发者

1. 研究 `modern-vue-plugin`
2. 学习前后端通信
3. 掌握完整的插件架构

---

## 📚 相关文档

- 📘 [插件开发指南](../docs/PACKAGE_JSON_TEMPLATE.md)
- 📗 [API 参考文档](../docs/QUICK_REFERENCE.md)
- 📙 [性能优化指南](../docs/PERFORMANCE_OPTIMIZATION.md)
- 📕 [日志使用指南](../docs/LOGGER_GUIDE.md)

---

## 💡 常见问题

### Q: 我应该选择哪个示例？

**A:**

- 如果你是初学者或需要快速原型 → `simple-html-plugin`
- 如果你熟悉 Vue 且需要现代开发体验 → `h5-formatter-plugin`
- 如果你需要后端支持或复杂功能 → `modern-vue-plugin`

### Q: 如何调试插件？

**A:**

1. 在 UniHub 中打开插件
2. 右键点击插件区域 → 检查元素
3. 使用 Chrome DevTools 调试

### Q: 插件可以使用哪些 API？

**A:**

- 剪贴板 API
- 数据库 API（SQLite）
- 系统 API（文件、通知等）
- 详见 [API 文档](../docs/QUICK_REFERENCE.md)

### Q: 如何发布插件？

**A:**

1. 构建并打包插件
2. 测试功能完整性
3. 提交到插件商店（即将推出）

---

## 🤝 贡献

欢迎提交新的插件示例！请确保：

- ✅ 代码清晰易懂
- ✅ 包含完整的 README
- ✅ 遵循项目规范
- ✅ 添加适当的注释

---

## 📝 许可证

MIT License - 自由使用和修改

---

**开始你的插件开发之旅吧！** 🎉
