# 插件开发概述

UniHub 提供了强大的插件系统，允许开发者扩展应用功能。本指南将帮助你了解如何开发 UniHub 插件。

## 插件类型

UniHub 支持两种类型的插件：

### 1. Web 插件

使用 HTML/CSS/JavaScript 开发的插件，运行在独立的 WebContentsView 中。

**特点**:

- 使用熟悉的 Web 技术栈
- 可以使用任何前端框架（Vue、React、Svelte 等）
- 通过 Plugin API 与主应用通信
- 支持 Node.js API（需要权限）

### 2. 内置插件

直接集成在 UniHub 主应用中的 Vue 组件。

**特点**:

- 更好的性能
- 更紧密的集成
- 仅限官方开发

## 插件能力

插件可以：

- ✅ 创建自定义 UI 界面
- ✅ 读写剪贴板
- ✅ 本地数据存储
- ✅ 访问文件系统（需要权限）
- ✅ 发起网络请求（需要权限）
- ✅ 执行系统命令（需要权限）
- ✅ 响应主题变化
- ✅ 与主应用通信

## 开发流程

```
1. 创建项目结构
       ↓
2. 编写 package.json
       ↓
3. 开发插件功能
       ↓
4. 本地测试
       ↓
5. 打包发布
```

## 快速开始

使用官方 CLI 工具 [@unihubjs/plugin-cli](https://www.npmjs.com/package/@unihubjs/plugin-cli) 快速创建插件：

```bash
# 创建插件项目（支持多种模板）
npx @unihubjs/plugin-cli create my-plugin

# 进入项目目录
cd my-plugin

# 启动开发服务器
npx @unihubjs/plugin-cli dev

# 构建插件
npx @unihubjs/plugin-cli build

# 打包为 plugin.zip
npx @unihubjs/plugin-cli pack
```

生成的 `plugin.zip` 可以直接拖拽到 UniHub 安装。

### 支持的模板

- `vanilla` - 原生 HTML/CSS/JS
- `vue` - Vue 3 + TypeScript
- `react` - React + TypeScript

## 示例插件

查看 `examples` 目录中的示例插件：

- `simple-html-plugin` - 最简单的 HTML 插件
- `h5-formatter-plugin` - 使用 Vite 构建的插件

## 下一步

- [快速开始](/plugin/quick-start) - 创建你的第一个插件
- [插件结构](/plugin/structure) - 了解插件的文件结构
- [插件配置](/plugin/config) - package.json 配置详解
