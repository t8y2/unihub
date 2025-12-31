# 插件系统对比：uTools vs Rubick vs UniHub

## 📋 配置文件对比

### uTools
```json
// plugin.json
{
  "pluginName": "我的插件",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者",
  "homepage": "https://...",
  "logo": "logo.png",
  "features": [
    {
      "code": "hello",
      "explain": "Hello World",
      "cmds": ["hello", "你好"]
    }
  ]
}
```

**特点**：
- ❌ 专用配置文件 `plugin.json`
- ❌ 需要学习特定格式
- ✅ 功能丰富（关键词、命令等）

### Rubick
```json
// package.json
{
  "name": "rubick-plugin-demo",
  "pluginName": "示例插件",
  "version": "1.0.0",
  "description": "插件描述",
  "entry": "index.html",
  "logo": "logo.png",
  "features": [
    {
      "code": "demo",
      "explain": "示例功能",
      "cmds": ["demo"]
    }
  ]
}
```

**特点**：
- ✅ 使用标准 `package.json`
- ✅ 开发者熟悉
- ⚠️ 混合了 npm 和插件配置

### UniHub（现在）
```json
// package.json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "Your Name <your@email.com>",
  "keywords": ["tool", "utility"],
  "license": "MIT",
  "unihub": {
    "id": "com.yourname.myplugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": []
  }
}
```

**特点**：
- ✅ 使用标准 `package.json`
- ✅ 通过 `unihub` 字段扩展
- ✅ 清晰分离 npm 和插件配置
- ✅ 符合 npm 规范

## 📦 打包方式对比

### uTools

**开发者**：上传源码到官方平台
**官方**：审核后打包成 `.upx` 文件
**用户**：从官方商店下载安装

```
开发者 → 上传源码 → 官方审核 → 官方打包 → 用户下载
```

**优点**：
- ✅ 统一打包，质量可控
- ✅ 安全审核
- ✅ 用户体验一致

**缺点**：
- ❌ 依赖官方平台
- ❌ 审核周期长
- ❌ 不够开放

### Rubick

**开发者**：发布源码到 npm 或 GitHub
**用户**：下载源码后本地 `npm install`

```
开发者 → 发布源码 → 用户下载 → npm install → 使用
```

**优点**：
- ✅ 完全开放
- ✅ 去中心化
- ✅ 快速发布

**缺点**：
- ❌ 用户需要 `npm install`（慢、易出错）
- ❌ 依赖网络环境
- ❌ 可能有依赖冲突

### UniHub（现在）

**开发者**：本地 `npm run build && npm run package` 生成 `.zip`
**用户**：下载 `.zip` 直接安装

```
开发者 → 本地打包 → 发布 .zip → 用户下载 → 直接安装
```

**优点**：
- ✅ 开发者完全可控
- ✅ 用户无需 `npm install`
- ✅ 秒级安装
- ✅ 离线可用
- ✅ 去中心化

**缺点**：
- ⚠️ 需要开发者自己打包
- ⚠️ 文件稍大（但可接受）

## 🏗️ 插件结构对比

### uTools
```
plugin/
├── plugin.json       # 配置
├── index.html        # 入口
├── preload.js        # Preload 脚本
└── logo.png          # 图标
```

**特点**：
- 简单直接
- 官方打包时会处理依赖

### Rubick
```
plugin/
├── package.json      # 配置
├── index.html        # 入口
├── node_modules/     # 依赖（用户安装）
└── logo.png          # 图标
```

**特点**：
- 标准 npm 项目
- 用户需要安装依赖

### UniHub（现在）
```
plugin.zip
├── package.json      # 配置
├── dist/
│   └── index.html   # 自包含的单文件（所有依赖已打包）
├── backend/          # 后端（可选）
│   └── main.py
└── README.md         # 说明（可选）
```

**特点**：
- ✅ 所有依赖已打包到 `dist/index.html`
- ✅ 用户无需安装依赖
- ✅ 支持可选后端

## 🔌 API 对比

### uTools

```javascript
// 数据库
utools.db.put({ _id: 'key', data: 'value' })
utools.db.get('key')

// 剪贴板
utools.copyText('text')
utools.readClipboard()

// 通知
utools.showNotification('message')
```

**特点**：
- API 丰富
- 文档完善
- 社区活跃

### Rubick

```javascript
// 数据库
window.rubick.db.put({ id: 'key', data: 'value' })
window.rubick.db.get('key')

// 剪贴板
window.rubick.clipboard.writeText('text')
window.rubick.clipboard.readText()
```

**特点**：
- 类似 uTools
- 开源可查看
- API 相对简单

### UniHub（现在）

```javascript
// 数据库（自动使用当前插件 ID）
await window.unihub.db.put('key', 'value')
await window.unihub.db.get('key')

// 剪贴板
await window.unihub.clipboard.writeText('text')
await window.unihub.clipboard.readText()

// 文件系统
await window.unihub.fs.selectFile()
await window.unihub.fs.readFile(path)

// HTTP（避免 CORS）
await window.unihub.http.get('https://api.example.com')

// 系统
await window.unihub.system.getInfo()
```

**特点**：
- ✅ 现代化（async/await）
- ✅ API 更丰富（文件系统、HTTP）
- ✅ 自动处理插件 ID
- ✅ 类型安全（TypeScript）

## 📊 综合对比表

| 特性 | uTools | Rubick | UniHub |
|------|--------|--------|--------|
| **配置文件** | plugin.json | package.json | package.json + unihub |
| **打包方式** | 官方打包 | 源码发布 | 开发者打包 |
| **安装速度** | 快 | 慢（需 npm install） | 快 |
| **依赖处理** | 官方处理 | 用户安装 | 开发者打包 |
| **离线可用** | ✅ | ❌ | ✅ |
| **去中心化** | ❌ | ✅ | ✅ |
| **开发门槛** | 中 | 低 | 低 |
| **用户体验** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **开放程度** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **API 丰富度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **后端支持** | ❌ | ❌ | ✅（可选） |
| **文件系统** | 有限 | ❌ | ✅ |
| **HTTP 请求** | ❌ | ❌ | ✅ |

## 🎯 UniHub 的优势

### 1. 最佳实践结合
- ✅ 配置文件：学 Rubick（package.json）
- ✅ 打包方式：学 uTools（预打包）
- ✅ 分发方式：GitHub Release（去中心化）

### 2. 开发者友好
```bash
# 创建插件
node tools/create-plugin.js my-plugin

# 开发
npm run dev

# 打包
npm run package

# 完成！
```

### 3. 用户体验好
- 下载 `.zip` → 安装 → 立即使用
- 无需等待 `npm install`
- 无需担心依赖冲突

### 4. 功能更强大
- ✅ 文件系统 API
- ✅ HTTP 请求 API
- ✅ 可选后端支持
- ✅ 现代化 async/await

### 5. 完全开放
- ✅ 开源
- ✅ 去中心化
- ✅ 开发者自主打包
- ✅ 可托管在任何地方

## 🚀 迁移指南

### 从 Rubick 迁移

1. **重命名配置**：
```json
// 旧的 Rubick
{
  "pluginName": "示例",
  "entry": "index.html"
}

// 新的 UniHub
{
  "name": "示例",
  "unihub": {
    "id": "com.example.demo",
    "entry": "dist/index.html"
  }
}
```

2. **更新 API 调用**：
```javascript
// 旧的
window.rubick.db.put(...)

// 新的
await window.unihub.db.put(...)
```

3. **添加构建步骤**：
```bash
npm run build    # 打包依赖
npm run package  # 生成 .zip
```

### 从 uTools 迁移

1. **转换配置文件**：
```json
// plugin.json → package.json
{
  "name": "插件名",
  "unihub": {
    "id": "com.example.plugin",
    "entry": "dist/index.html"
  }
}
```

2. **更新 API**：
```javascript
// 旧的
utools.db.put({ _id: 'key', data: 'value' })

// 新的
await window.unihub.db.put('key', 'value')
```

3. **自己打包**：
不再依赖官方平台，自己打包发布。

## 💡 总结

**UniHub = Rubick 的开放性 + uTools 的用户体验 + 更强大的 API**

- ✅ 使用标准 `package.json`（学 Rubick）
- ✅ 开发者本地打包（学 uTools 的理念）
- ✅ 去中心化分发（GitHub Release）
- ✅ 更丰富的 API（文件系统、HTTP、后端支持）
- ✅ 现代化开发体验（TypeScript、async/await）

**不再需要 manifest.json！** 🎉
