# 快速开始

本指南将带你创建一个简单的 UniHub 插件。

## 前置要求

- Node.js 18+
- pnpm（推荐）或 npm
- 基本的 HTML/CSS/JavaScript 知识

## 创建插件项目

### 方式一：使用官方 CLI（推荐）

使用 [@unihubjs/plugin-cli](https://www.npmjs.com/package/@unihubjs/plugin-cli) 快速创建：

```bash
# 创建插件项目
npx @unihubjs/plugin-cli create my-plugin

# 进入项目目录
cd my-plugin

# 启动开发服务器（支持热重载）
npx @unihubjs/plugin-cli dev
```

CLI 支持多种模板：

- `vanilla` - 原生 HTML/CSS/JS
- `vue` - Vue 3 + TypeScript
- `react` - React + TypeScript

### 方式二：克隆模板

```bash
git clone https://github.com/t8y2/unihub-plugin-template my-plugin
cd my-plugin
pnpm install
```

### 方式三：手动创建

创建以下目录结构：

```
my-plugin/
├── package.json     # 插件配置
├── index.html       # 插件入口
├── style.css        # 样式文件
└── script.js        # 脚本文件
```

## 编写 package.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "这是我的第一个 UniHub 插件",
  "main": "index.html",
  "unihub": {
    "id": "com.example.my-plugin",
    "name": "我的插件",
    "icon": "https://api.iconify.design/mdi/puzzle.svg",
    "category": "tool",
    "keywords": ["example", "demo"],
    "permissions": ["clipboard"]
  },
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  }
}
```

## 编写插件界面

### index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的插件</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <h1>我的插件</h1>
      <textarea id="input" placeholder="输入文本..."></textarea>
      <button id="copyBtn">复制到剪贴板</button>
      <p id="status"></p>
    </div>
    <script src="script.js"></script>
  </body>
</html>
```

### style.css

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background: var(--bg-color, #ffffff);
  color: var(--text-color, #333333);
}

/* 深色主题 */
body.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

button {
  margin-top: 12px;
  padding: 10px 20px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #0056b3;
}

#status {
  margin-top: 12px;
  color: #666;
}
```

### script.js

```javascript
// 等待 Plugin API 加载
document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('input')
  const copyBtn = document.getElementById('copyBtn')
  const status = document.getElementById('status')

  // 复制到剪贴板
  copyBtn.addEventListener('click', async () => {
    const text = input.value
    if (!text) {
      status.textContent = '请输入文本'
      return
    }

    try {
      // 使用 Plugin API 写入剪贴板
      await window.pluginAPI.clipboard.writeText(text)
      status.textContent = '已复制到剪贴板！'
    } catch (error) {
      status.textContent = '复制失败: ' + error.message
    }
  })

  // 监听主题变化
  window.addEventListener('message', (event) => {
    if (event.data.type === 'theme-changed') {
      document.body.classList.toggle('dark', event.data.theme === 'dark')
    }
  })
})
```

## 本地测试

### 方式一：使用 CLI 开发服务器（推荐）

```bash
npx @unihubjs/plugin-cli dev
```

开发服务器支持热重载，修改代码后自动刷新。

### 方式二：开发模式加载

1. 在 UniHub 中打开 **设置 → 开发者**
2. 启用 **开发者模式**
3. 点击 **加载本地插件**
4. 选择插件目录

## 打包插件

### 使用 CLI 打包（推荐）

```bash
# 构建
npx @unihubjs/plugin-cli build

# 打包为 plugin.zip
npx @unihubjs/plugin-cli pack

# 验证插件配置
npx @unihubjs/plugin-cli validate
```

生成的 `plugin.zip` 可以直接拖拽到 UniHub 安装。

### 手动打包

```bash
zip -r my-plugin.zip package.json index.html style.css script.js
```

## 下一步

- [插件结构](/plugin/structure) - 了解更复杂的插件结构
- [权限系统](/plugin/permissions) - 了解插件权限
- [发布插件](/plugin/publishing) - 将插件发布到商店
