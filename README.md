# UniHub

<p align="center">
  <img src="https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <a href="https://github.com/t8y2/unihub/stargazers">
    <img src="https://img.shields.io/github/stars/t8y2/unihub?style=flat-square&color=yellow" alt="Stars">
  </a>
  <a href="https://github.com/t8y2/unihub/network/members">
    <img src="https://img.shields.io/github/forks/t8y2/unihub?style=flat-square&color=orange" alt="Forks">
  </a>
  <a href="https://github.com/t8y2/unihub/issues">
    <img src="https://img.shields.io/github/issues/t8y2/unihub?style=flat-square&color=red" alt="Issues">
  </a>
</p>

<p align="center">
  <a href="./README.en.md">English</a> | 简体中文
</p>

一个基于 Electron 的现代化工具集应用，支持强大的插件系统。

## 📸 预览

<p align="center">
  <img src="docs/screenshots/demo.gif" alt="UniHub Demo" width="100%">
</p>

## 特性

- 🔌 强大的插件系统 - 支持动态加载和管理插件
- 🎨 现代化 UI - 基于 Vue 3 + Tailwind CSS
- 🚀 高性能 - 使用 Vite 构建
- 📦 插件市场 - 内置插件市场，一键安装
- 🔒 权限管理 - 细粒度的插件权限控制
- 🔄 自动更新 - 支持应用自动更新，基于 GitHub Releases

## 💬 交流群

欢迎加入 UniHub 交流群，与其他开发者一起讨论和分享！

<table>
  <tr>
    <td align="center">
      <img src="docs/screenshots/wechat-group-qrcode.png" width="200" alt="微信群">
      <p><strong>微信交流群</strong></p>
    </td>
    <td align="center">
      <img src="docs/screenshots/qq-group-qrcode.png" width="200" alt="QQ群">
      <p><strong>QQ 交流群</strong></p>
    </td>
  </tr>
</table>

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建应用
pnpm build              # 所有平台
pnpm build:mac          # macOS
pnpm build:win          # Windows
pnpm build:linux        # Linux
```

## 🛠️ 插件开发 CLI

官方 CLI 工具让插件开发更简单：

```bash
# 安装
npm install -g @unihubjs/plugin-cli

# 创建插件
uhp create my-plugin

# 开发
cd my-plugin && npm install && npm run dev

# 打包
npm run package
```

查看完整文档：[tools/plugin-cli](tools/plugin-cli/README.md)

## 插件开发指南

### 使用 CLI 工具（推荐）

```bash
# 安装 CLI
npm install -g @unihubjs/plugin-cli

# 创建插件
uhp create my-plugin

# 开发
cd my-plugin
npm install
npm run dev

# 打包
npm run package
```

查看完整文档：[Plugin CLI](tools/plugin-cli/README.md)

### 手动创建插件

最简单的插件只需要两个文件：

```
my-plugin/
├── package.json
└── dist/
    └── index.html
```

**package.json 配置：**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "unihub": {
    "id": "com.yourname.myplugin",
    "name": "我的插件",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard"]
  }
}
```

**UniHub API：**

```javascript
// 剪贴板
await window.unihub.clipboard.writeText('text')

// 文件系统（需要 fs 权限）
await window.unihub.fs.readFile(path)

// HTTP 请求（需要 http 权限）
await window.unihub.http.get(url)

// 数据库（需要 db 权限）
await window.unihub.db.set(key, value)
```

### 发布插件

**本地安装：** 拖拽 `plugin.zip` 到 UniHub 插件管理页面

**发布到市场：** 编辑 `marketplace/plugins.json` 并提交 PR

### 示例插件

- `examples/simple-html-plugin` - 纯 HTML
- `examples/modern-vue-plugin` - Vue 3 + TypeScript
- `examples/h5-formatter-plugin` - 格式化工具
- `official-plugins/` - 更多官方插件

## 快捷键

| 功能       | macOS         | Windows/Linux     |
| ---------- | ------------- | ----------------- |
| 全局搜索   | <kbd>⌘K</kbd> | <kbd>Ctrl+K</kbd> |
| 新建标签   | <kbd>⌘N</kbd> | <kbd>Ctrl+N</kbd> |
| 关闭标签   | <kbd>⌘W</kbd> | <kbd>Ctrl+W</kbd> |
| 切换侧边栏 | <kbd>⌘B</kbd> | <kbd>Ctrl+B</kbd> |

## 技术栈

- Electron
- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- reka-ui

## 许可证

MIT
