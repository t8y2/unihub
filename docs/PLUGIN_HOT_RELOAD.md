# 插件热重载 (Hot Reload)

## 🔥 什么是热重载

热重载允许你在开发插件时，修改代码后无需重新打包安装，插件会自动刷新显示最新内容。

## 🚀 快速开始

### 1. 配置开发模式

在 `package.json` 中添加开发配置：

```json
{
  "unihub": {
    "id": "com.example.myplugin",
    "entry": "dist/index.html",
    "dev": {
      "enabled": true,
      "url": "http://localhost:5173"
    }
  }
}
```

### 2. 启动开发服务器

```bash
npm run dev
```

Vite 会在 `http://localhost:5173` 启动开发服务器。

### 3. 在 UniHub 中加载

在 UniHub 的插件管理页面，点击"开发模式"，输入插件 ID：

```
com.example.myplugin
```

UniHub 会直接加载 `http://localhost:5173`，而不是打包后的文件。

### 4. 开始开发

现在你可以修改代码，保存后插件会自动刷新！✨

## 🔧 工作原理

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   你的代码   │ ──保存──> │ Vite 服务器  │ ──HMR──> │   UniHub    │
│  src/App.vue │         │ localhost   │         │   插件窗口   │
└─────────────┘         └─────────────┘         └─────────────┘
```

1. 你修改代码并保存
2. Vite 检测到文件变化
3. Vite 通过 WebSocket 推送更新
4. 插件 iframe 接收更新并刷新

## 📝 配置选项

### 完整配置

```json
{
  "unihub": {
    "dev": {
      "enabled": true,           // 启用开发模式
      "url": "http://localhost:5173",  // 开发服务器地址
      "autoReload": true,        // 自动重载（默认 true）
      "hmr": true,               // 启用 HMR（默认 true）
      "overlay": true            // 显示错误覆盖层（默认 true）
    }
  }
}
```

### 环境变量

你也可以通过环境变量配置：

```bash
# .env.development
VITE_UNIHUB_DEV=true
VITE_UNIHUB_DEV_URL=http://localhost:5173
```

## 🎯 开发工作流

### 方式 1: 命令行

```bash
# 终端 1: 启动 UniHub
npm run dev

# 终端 2: 启动插件开发服务器
cd my-plugin
npm run dev
```

### 方式 2: 一键启动

创建 `dev.sh` 脚本：

```bash
#!/bin/bash

# 启动 UniHub（后台）
npm run dev &

# 等待 UniHub 启动
sleep 3

# 启动插件开发服务器
cd my-plugin
npm run dev
```

使用：
```bash
chmod +x dev.sh
./dev.sh
```

## 🐛 调试技巧

### 1. 查看插件日志

在 UniHub 开发者工具中：

```javascript
// 查看插件日志
window.unihub.dev.logs('com.example.myplugin')
```

### 2. 重载插件

如果插件卡住了：

```javascript
// 手动重载
window.unihub.dev.reload('com.example.myplugin')
```

### 3. 查看插件状态

```javascript
// 查看插件状态
window.unihub.dev.inspect('com.example.myplugin')
// 返回:
{
  loaded: true,
  devMode: true,
  devUrl: 'http://localhost:5173',
  lastReload: '2024-01-01T12:00:00Z',
  errors: []
}
```

## ⚠️ 注意事项

### 1. 端口冲突

如果 5173 端口被占用，修改 `vite.config.ts`：

```typescript
export default defineConfig({
  server: {
    port: 5174  // 使用其他端口
  }
})
```

### 2. CORS 问题

开发模式下可能遇到 CORS 问题，在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

### 3. 后端调用

开发模式下，后端调用仍然使用打包后的后端文件。如果修改了后端代码，需要：

```bash
# 重新打包后端
npm run build:backend

# 或者重启 UniHub
```

## 🎨 UI 提示

开发模式下，插件窗口会显示一个小标签：

```
┌─────────────────────────────┐
│ 🔥 DEV MODE                 │
│                             │
│  你的插件内容                │
│                             │
└─────────────────────────────┘
```

## 📊 性能对比

| 操作 | 传统方式 | 热重载 |
|------|---------|--------|
| 修改代码 | 1s | 1s |
| 构建 | 5s | - |
| 打包 | 2s | - |
| 安装 | 3s | - |
| 刷新 | 1s | 0.5s |
| **总计** | **12s** | **1.5s** |

热重载可以节省 **87%** 的时间！⚡

## 🚀 高级用法

### 1. 多插件同时开发

```json
// plugin1/package.json
{
  "unihub": {
    "dev": { "url": "http://localhost:5173" }
  }
}

// plugin2/package.json
{
  "unihub": {
    "dev": { "url": "http://localhost:5174" }
  }
}
```

### 2. 远程开发

你甚至可以在另一台机器上开发：

```json
{
  "unihub": {
    "dev": {
      "url": "http://192.168.1.100:5173"
    }
  }
}
```

### 3. 条件热重载

只在特定条件下启用热重载：

```json
{
  "unihub": {
    "dev": {
      "enabled": process.env.NODE_ENV === 'development'
    }
  }
}
```

## 💡 最佳实践

1. **开发时始终使用热重载**：大幅提升效率
2. **发布前测试打包版本**：确保打包后也能正常工作
3. **使用 Git 分支**：开发分支用热重载，主分支用打包版本
4. **配置 .gitignore**：不要提交开发配置

```gitignore
# .gitignore
.env.development
dev.sh
```

## 🔗 相关链接

- [Vite HMR API](https://vitejs.dev/guide/api-hmr.html)
- [插件开发指南](../PLUGIN_DEVELOPMENT.md)
- [调试技巧](./DEBUGGING.md)

