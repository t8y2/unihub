<h1 align="center">UniHub</h1>

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
    <td align="center">
      <img src="docs/screenshots/wx_personal.png" width="200" alt="个人微信">
      <p><strong>加我拉你进群</strong></p>
    </td>
  </tr>
</table>

## 特性

- 🔌 强大的插件系统 - 支持动态加载和管理插件
- 🎨 现代化 UI - 基于 Vue 3 + Tailwind CSS
- 🚀 高性能 - 使用 Vite 构建
- 📦 插件市场 - 内置插件市场，一键安装
- 🔒 权限管理 - 细粒度的插件权限控制
- 🔄 自动检测更新 - 支持应用自动更新，基于 GitHub Releases

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

## 插件开发

使用官方 CLI 工具快速开发插件：

```bash
# 安装 CLI
npm install -g @unihubjs/plugin-cli

# 创建插件（支持 simple/vue/react 模板）
uhp create my-plugin

# 开发
cd my-plugin && npm install
uhp dev

# 打包
uhp package
```

生成的 `plugin.zip` 可直接拖拽到 UniHub 安装，或提交 PR 到 `marketplace/plugins.json` 发布到插件市场。

查看完整文档：[Plugin CLI](tools/plugin-cli/README.md) | 示例插件：[examples/](examples/)

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
