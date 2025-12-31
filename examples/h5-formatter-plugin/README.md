# H5 格式化工具插件

H5 页面格式化与压缩工具 - 支持 HTML/CSS/JavaScript 的美化和压缩

## ✨ 功能特性

- 🎨 **代码格式化** - 使用 Prettier 美化 HTML 代码
- 📦 **代码压缩** - 移除空格和换行，减小文件体积
- 🎯 **语法高亮** - 使用 highlight.js 提供代码高亮
- 📋 **一键复制** - 快速复制格式化结果
- ⚙️ **自定义缩进** - 支持 2-8 空格缩进
- 🔄 **自动换行** - 可选的代码自动换行

## 🚀 快速开始

### 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 打包成插件
npm run package
```

打包完成后会生成 `plugin.zip` 文件，可以直接安装到 UniHub。

## 📦 安装到 UniHub

### 方法 1：从本地安装

1. 构建并打包插件：`npm run build && npm run package`
2. 打开 UniHub
3. 进入「插件管理」→「手动安装」
4. 拖拽 `plugin.zip` 文件或输入文件路径

### 方法 2：从应用市场安装

1. 打开 UniHub
2. 进入「插件管理」→「插件商店」
3. 搜索「H5 格式化工具」
4. 点击「安装」

## 🎯 使用方法

1. 在左侧输入框粘贴或输入 HTML 代码
2. 点击「格式化」按钮美化代码
3. 或点击「压缩」按钮压缩代码
4. 在右侧查看结果并复制

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Prettier** - 代码格式化
- **highlight.js** - 语法高亮

## 📄 许可证

MIT License
