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
  English | <a href="./README.md">简体中文</a>
</p>

A modern Electron-based toolkit application with a powerful plugin system.

## 📸 Preview

<p align="center">
  <img src="docs/screenshots/demo.gif" alt="UniHub Demo" width="100%">
</p>

## Features

- 🔌 Powerful Plugin System - Support dynamic loading and management of plugins
- 🎨 Modern UI - Built with Vue 3 + Tailwind CSS
- 🚀 High Performance - Powered by Vite
- 📦 Plugin Marketplace - Built-in marketplace for one-click installation
- 🔒 Permission Management - Fine-grained plugin permission control
- 🔄 Auto Update - Support automatic updates based on GitHub Releases

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

## Plugin Development Guide

### 1. Plugin Structure

A minimal plugin requires only two files:

```
my-plugin/
├── package.json        # Plugin configuration
└── dist/
    └── index.html      # Plugin entry
```

### 2. package.json Configuration

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My Plugin",
  "author": "Your Name",
  "unihub": {
    "id": "com.yourname.myplugin",
    "name": "My Plugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard"]
  }
}
```

#### Required Fields

| Field      | Description                        | Example                                        |
| ---------- | ---------------------------------- | ---------------------------------------------- |
| `id`       | Unique plugin ID (reverse domain)  | `"com.yourname.myplugin"`                      |
| `name`     | Plugin display name                | `"My Plugin"`                                  |
| `icon`     | Icon (Emoji, URL or relative path) | `"🚀"` or `"https://..."` or `"dist/icon.png"` |
| `category` | Category                           | `"tool"`                                       |
| `entry`    | Entry file path                    | `"dist/index.html"`                            |

#### Optional Fields

| Field         | Description      | Example                    |
| ------------- | ---------------- | -------------------------- |
| `permissions` | Permission list  | `["clipboard", "fs"]`      |
| `keywords`    | Search keywords  | `["tool", "utility"]`      |
| `homepage`    | Project homepage | `"https://github.com/..."` |
| `repository`  | Code repository  | `"https://github.com/..."` |

#### Categories

- `tool` - Tools
- `formatter` - Formatters
- `encoder` - Encoders/Decoders
- `productivity` - Productivity
- `developer` - Developer Tools
- `entertainment` - Entertainment
- `custom` - Custom

#### Permissions

- `clipboard` - Clipboard read/write
- `fs` - File system access
- `http` - HTTP requests
- `spawn` - Backend processes
- `db` - Database storage
- `notification` - System notifications
- `system` - System information

### 3. Create Plugin

#### Method 1: Pure HTML (Simplest)

Create `dist/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My Plugin</title>
    <style>
      body {
        font-family: system-ui;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <h1>Hello UniHub!</h1>
    <button onclick="copyText()">Copy Text</button>

    <script>
      function copyText() {
        // Use UniHub API
        if (window.unihub?.clipboard) {
          window.unihub.clipboard.writeText('Hello World!')
        }
      }
    </script>
  </body>
</html>
```

#### Method 2: Using Vue + Vite (Recommended)

Refer to the `examples/modern-vue-plugin` example.

### 4. UniHub API

Plugins can access system features through `window.unihub`:

```javascript
// Clipboard
window.unihub.clipboard.writeText('text')
window.unihub.clipboard.readText()

// File System (requires fs permission)
window.unihub.fs.readFile(path)
window.unihub.fs.writeFile(path, content)

// HTTP Requests (requires http permission)
window.unihub.http.get(url)
window.unihub.http.post(url, data)

// Database (requires db permission)
window.unihub.db.get(key)
window.unihub.db.set(key, value)

// Notifications (requires notification permission)
window.unihub.notification.show(title, body)
```

### 5. Package Plugin

```bash
# Create plugin.zip
zip -r plugin.zip package.json dist/
```

Or use packaging scripts (refer to examples in `examples/`).

### 6. Publish Plugin

#### Method 1: Submit to Plugin Marketplace

1. Upload `plugin.zip` to GitHub Release or CDN
2. Fork this project and edit `marketplace/plugins.json`
3. Add plugin information:

```json
{
  "id": "com.yourname.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "icon": "🚀",
  "category": "tool",
  "keywords": ["tool"],
  "permissions": ["clipboard"],
  "install": {
    "zip": "https://github.com/yourname/plugin/releases/download/v1.0.0/plugin.zip"
  },
  "homepage": "https://github.com/yourname/plugin",
  "repository": "https://github.com/yourname/plugin"
}
```

4. Submit PR

#### Method 2: Local Installation

Users can directly drag and drop `plugin.zip` to UniHub's plugin management page for installation.

## Example Plugins

- `examples/simple-html-plugin` - Calculator implemented in pure HTML
- `examples/modern-vue-plugin` - Toolkit implemented with Vue 3 + TypeScript
- `examples/h5-formatter-plugin` - HTML/CSS/JS formatter

Check the `official-plugins/` directory for more official plugins.

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
