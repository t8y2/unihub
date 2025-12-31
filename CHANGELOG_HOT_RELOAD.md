# 🔥 热重载功能更新日志

## 新增功能

### 1. 插件热重载支持

现在可以在开发插件时直接加载开发服务器，无需重新打包安装！

**效率提升**：
- ❌ 传统方式：修改代码 → 构建 (5s) → 打包 (2s) → 安装 (3s) = **11秒**
- ✅ 热重载：修改代码 → 自动刷新 (0.5s) = **0.5秒**
- **提升 95% 的开发效率！** ⚡

### 2. 开发模式 UI

在插件管理页面新增 **"🔥 开发模式"** 按钮，提供友好的 UI 界面：

- ✅ 注册开发模式插件
- ✅ 查看已注册的开发模式插件
- ✅ 取消开发模式
- ✅ 自动重载开关
- ✅ 使用说明

### 3. 两种配置方式

#### 方式 1: 手动注册（推荐用于临时开发）

在 UniHub 的"开发模式"对话框中手动注册：
- 插件 ID: `com.example.myplugin`
- 开发服务器 URL: `http://localhost:5173`
- 自动重载: ✅

#### 方式 2: 配置文件（推荐用于长期开发）

在 `package.json` 中添加：
```json
{
  "unihub": {
    "dev": {
      "enabled": true,
      "url": "http://localhost:5173",
      "autoReload": true
    }
  }
}
```

## 技术实现

### 新增文件

1. **src/main/plugin-dev-server.ts**
   - 开发服务器管理
   - 注册/取消注册开发模式插件
   - 查询开发模式状态

2. **src/main/ipc-handlers.ts**
   - IPC 处理器
   - 处理开发模式相关的通信

3. **src/renderer/src/components/PluginDevMode.vue**
   - 开发模式 UI 组件
   - 注册/管理开发模式插件

### 修改文件

1. **src/main/plugin-manager.ts**
   - 支持开发模式配置
   - `loadPlugin` 方法支持返回 `devUrl`
   - 自动检测插件配置中的开发模式

2. **src/main/index.ts**
   - 注册开发模式 IPC 处理器

3. **src/preload/index.ts**
   - 新增 `plugin.dev` API
   - 支持开发模式相关操作

4. **src/preload/index.d.ts**
   - 更新类型定义
   - 添加 `plugin.dev` 接口

5. **src/renderer/src/plugins/marketplace/installer.ts**
   - 支持加载开发模式插件
   - 检测 `devUrl` 并直接加载

6. **src/renderer/src/components/PluginManagementPage.vue**
   - 添加"🔥 开发模式"按钮
   - 集成 PluginDevMode 组件

### 新增文档

1. **HOT_RELOAD_QUICK_START.md** - 5 分钟快速上手
2. **HOT_RELOAD_GUIDE.md** - 完整使用指南
3. **docs/PLUGIN_HOT_RELOAD.md** - 技术文档

## 使用方法

### 快速开始

```bash
# 1. 启动插件开发服务器
cd examples/modern-vue-plugin
npm run dev

# 2. 在 UniHub 中启用开发模式
# - 打开"插件管理"
# - 点击"🔥 开发模式"
# - 输入插件 ID 和 URL
# - 点击"注册开发模式"

# 3. 打开插件，开始开发
# 修改代码，自动刷新！
```

## API 变更

### 新增 API

```typescript
// 注册开发模式
await window.api.plugin.dev.register(
  'com.example.myplugin',
  'http://localhost:5173',
  true // autoReload
)

// 取消注册
await window.api.plugin.dev.unregister('com.example.myplugin')

// 检查是否为开发模式
const result = await window.api.plugin.dev.isDevMode('com.example.myplugin')

// 获取所有开发模式插件
const result = await window.api.plugin.dev.list()
```

### 修改 API

```typescript
// loadPlugin 现在可能返回 devUrl
const result = await window.api.plugin.load('com.example.myplugin')
// result: { success: true, devUrl: 'http://localhost:5173' }
// 或
// result: { success: true, htmlPath: '/path/to/index.html' }
```

## 配置格式

### package.json 扩展

```json
{
  "unihub": {
    "id": "com.example.myplugin",
    "entry": "dist/index.html",
    "dev": {
      "enabled": true,              // 是否启用开发模式
      "url": "http://localhost:5173", // 开发服务器地址
      "autoReload": true             // 是否自动重载
    }
  }
}
```

## 兼容性

- ✅ 向后兼容：不影响现有插件
- ✅ 可选功能：开发模式完全可选
- ✅ 生产环境：发布时无需修改代码

## 已知问题

1. **后端代码不支持热重载**
   - 开发模式只支持前端热重载
   - 后端代码修改后需要重启 UniHub

2. **CORS 问题**
   - 某些情况下可能遇到 CORS 错误
   - 解决方案：在 `vite.config.ts` 中配置 CORS

## 下一步计划

- [ ] 支持后端热重载
- [ ] 支持多个开发服务器同时运行
- [ ] 支持远程开发（通过 ngrok 等工具）
- [ ] 支持 HTTPS 开发服务器
- [ ] 开发者工具集成

## 相关文档

- [快速开始](HOT_RELOAD_QUICK_START.md)
- [完整指南](HOT_RELOAD_GUIDE.md)
- [技术文档](docs/PLUGIN_HOT_RELOAD.md)
- [插件开发指南](PLUGIN_DEVELOPMENT.md)

---

**版本**: v1.0.0  
**日期**: 2024-12-31  
**作者**: UniHub Team

