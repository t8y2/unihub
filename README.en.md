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
  English | <a href="./README.md">简体中文</a>
</p>

A modern Electron-based toolkit application with a powerful plugin system.

## 📸 Preview

<p align="center">
  <img src="docs/screenshots/demo.gif" alt="UniHub Demo" width="100%">
</p>

## 💬 Community

Join UniHub community to discuss and share with other developers!

<table>
  <tr>
    <td align="center">
      <img src="docs/screenshots/wechat-group-qrcode.png" width="200" alt="WeChat Group">
      <p><strong>WeChat Group</strong></p>
    </td>
    <td align="center">
      <img src="docs/screenshots/qq-group-qrcode.png" width="200" alt="QQ Group">
      <p><strong>QQ Group</strong></p>
    </td>
  </tr>
</table>

## Features

- 🔌 Powerful Plugin System - Support dynamic loading and management of plugins
- 🎨 Modern UI - Built with Vue 3 + Tailwind CSS
- 🚀 High Performance - Powered by Vite
- 📦 Plugin Marketplace - Built-in marketplace for one-click installation
- 🔒 Permission Management - Fine-grained plugin permission control
- 🔄 Auto Update - Support automatic updates based on GitHub Releases

## Quick Start

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build application
pnpm build              # All platforms
pnpm build:mac          # macOS
pnpm build:win          # Windows
pnpm build:linux        # Linux
```

## Plugin Development

Use the official CLI tool to quickly develop plugins:

```bash
# Install CLI
npm install -g @unihubjs/plugin-cli

# Create plugin (supports simple/vue/react templates)
uhp create my-plugin

# Development
cd my-plugin && npm install
uhp dev

# Package
uhp package
```

The generated `plugin.zip` can be directly dragged to UniHub for installation, or submit a PR to `marketplace/plugins.json` to publish to the plugin marketplace.

Full documentation: [Plugin CLI](tools/plugin-cli/README.md) | Examples: [examples/](examples/)

## Keyboard Shortcuts

| Function       | macOS         | Windows/Linux     |
| -------------- | ------------- | ----------------- |
| Global Search  | <kbd>⌘K</kbd> | <kbd>Ctrl+K</kbd> |
| New Tab        | <kbd>⌘N</kbd> | <kbd>Ctrl+N</kbd> |
| Close Tab      | <kbd>⌘W</kbd> | <kbd>Ctrl+W</kbd> |
| Toggle Sidebar | <kbd>⌘B</kbd> | <kbd>Ctrl+B</kbd> |

## Tech Stack

- Electron
- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- reka-ui

## License

MIT
