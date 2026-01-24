# UniHub 插件开发完整入门

---

## 0. 一句话理解插件

插件就是一个“被 UniHub 加载的网页”。你写 HTML/CSS/JS（或 Vue/React），UniHub 把它打开在一个独立的视图里，并且给你一套 API（剪贴板、存储、文件、网络等）。

---

## 1. 插件类型（先选一种）

### 1) Web 插件（推荐）

- 用普通前端技术开发
- 可用 Vue/React/Svelte
- 通过 `window.unihub` / `window.node` 调 UniHub 能力

### 2) 内置插件（仅官方）

- 直接写在主应用源码里
- 一般外部开发者不需要

> 本文主要讲“Web 插件”。

---

## 2. 开发前准备

- Node.js 18+（必须）
- pnpm（推荐，但 npm 也行）
- 已安装 UniHub（用于本地测试）

---

## 3. 最快方式：用官方 CLI 创建

```bash
# 创建插件项目（会让你选模板）
npx @unihubjs/plugin-cli create my-plugin

# 进入项目
cd my-plugin

# 开发模式（热重载）
npx @unihubjs/plugin-cli dev
```

模板可选：

- `vanilla`（最简单）
- `vue`（Vue 3 + TS）
- `react`（React + TS）

---

## 4. 插件最小结构（必须有）

```
my-plugin/
├── package.json   # 插件配置（最重要）
└── index.html     # 插件入口
```

如果你用 Vite，项目会更复杂，但最后打包时必须输出可运行的 `index.html` 和资源文件。

---

## 5. package.json 必填字段（非常重要）

插件会从 `package.json` 读取配置。最关键是 `unihub` 字段：

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "这是我的插件",
  "main": "index.html",
  "unihub": {
    "id": "com.example.my-plugin",
    "name": "我的插件",
    "icon": "https://api.iconify.design/mdi/puzzle.svg",
    "category": "tool",
    "keywords": ["demo", "example"],
    "permissions": ["clipboard", "storage"]
  }
}
```

- `id`：插件唯一 ID（建议用反域名）
- `name`：侧边栏显示的名字
- `permissions`：权限声明，没写就不能用对应能力

---

## 6. 写一个最小可用插件

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
    <h1>你好，UniHub</h1>
    <button id="copy">复制到剪贴板</button>
    <script src="script.js"></script>
  </body>
</html>
```

### script.js

```javascript
document.getElementById('copy').addEventListener('click', async () => {
  await window.unihub.clipboard.writeText('Hello UniHub')
  alert('已复制！')
})
```

> 注意：必须在 `package.json` 里声明 `clipboard` 权限，否则会报错。

---

## 7. 常用 API（通俗版）

UniHub 会注入 `window.unihub`（简化 API）和 `window.node`（Node 能力，需权限）。

### 7.1 本地存储（最常用）

```javascript
// 保存数据
await window.unihub.db.set('settings', { theme: 'dark' })

// 读取数据
const settings = await window.unihub.db.get('settings')

// 删除
await window.unihub.db.delete('settings')

// 清空全部
await window.unihub.db.clear()
```

### 7.2 剪贴板

```javascript
await window.unihub.clipboard.writeText('Hello')
const text = await window.unihub.clipboard.readText()
```

### 7.3 文件系统（需 `fs` 权限）

```javascript
const text = await window.unihub.fs.readFile('/path/to/file')
await window.unihub.fs.writeFile('/path/to/file', 'content')
```

### 7.4 Node 能力（需 `spawn` 权限）

```javascript
const result = await window.node.spawn('ls', ['-la'])
console.log(result.stdout)
```

---

## 8. 插件数据是怎么存的？

- 插件数据存到本地 LMDB 数据库里
- 每个插件按 `pluginId` 分隔，互相隔离
- 你只需要调 `window.unihub.db`，不用关心底层路径

---

## 9. 权限怎么申请？

在 `package.json` 里写：

```json
"permissions": ["clipboard", "storage", "fs", "http", "spawn"]
```

常见权限：

- `clipboard`：剪贴板
- `storage`：本地存储
- `fs`：文件读写
- `http`：网络请求
- `spawn`：执行系统命令（风险高）

---

## 10. 本地测试插件

### 方法 1：CLI 开发服务器

```bash
npx @unihubjs/plugin-cli dev
```

### 方法 2：UniHub 加载本地插件

1. 打开 UniHub
2. 设置 → 开发者
3. 开启开发者模式
4. 点击“加载本地插件”选择插件目录

---

## 11. 打包插件（发布用）

### CLI 打包（推荐）

```bash
npx @unihubjs/plugin-cli build
npx @unihubjs/plugin-cli pack
```

### 手动打包

```bash
zip -r my-plugin.zip package.json index.html style.css script.js
```

> ZIP 根目录必须直接包含 `package.json` 和 `index.html`。

---

## 12. 发布插件到市场（可选）

1. 在 `marketplace/plugins.json` 添加你的插件信息
2. 提交 PR
3. 审核通过后即可在插件商店看到

---

## 13. 常见问题（FAQ）

### Q1：插件打开是空白？

- 检查 `index.html` 路径是否正确
- 如果是 Vite 构建，确认 `base: './'`

### Q2：API 报错没有权限？

- 检查 `package.json` 的 `unihub.permissions`
- 重新安装插件让权限生效

### Q3：插件存储的数据在哪？

- 在 `userData/unihub-lmdb` 中
- 但你不需要直接操作它

---

## 14. 开发流程总结（超简版）

1. 用 CLI 创建项目
2. 填好 `package.json`
3. 编写 UI 和逻辑
4. 调用 `window.unihub` API
5. 本地加载测试
6. 打包成 `plugin.zip`
7. （可选）提交到市场

---

## 15. 你可以从这里继续

- `docs/plugin/quick-start.md`
- `docs/plugin/structure.md`
- `docs/plugin/config.md`
- `docs/plugin/permissions.md`
- `docs/api/plugin-api.md`

如果你想，我也可以基于你的具体插件需求，直接帮你搭一个模板。
