# UniHub Electron 迁移指南

## 项目已创建

新的 Electron 项目已经创建在 `unihub-electron/` 目录下。

## 项目结构

```
unihub-electron/
├── src/
│   ├── main/          # Electron 主进程
│   ├── preload/       # Preload 脚本（注入 API）
│   └── renderer/      # Vue 渲染进程（前端）
├── resources/         # 应用图标等资源
├── build/            # 构建配置
└── package.json
```

## 下一步操作

### 1. 安装依赖

```bash
cd unihub-electron
pnpm install
```

### 2. 复制旧项目代码

需要复制以下内容：

**前端代码：**

- `../frontend/src/` → `src/renderer/src/`
- `../frontend/index.html` → `src/renderer/index.html`
- `../frontend/src/style.css` → `src/renderer/src/style.css`

**插件示例：**

- `../examples/` → `examples/`

### 3. 创建插件管理器

在 `src/main/` 下创建：

- `plugin-manager.ts` - 插件管理（安装、卸载、加载）
- 使用 BrowserView 加载插件（类似 uTools）

### 4. 更新 preload 脚本

在 `src/preload/index.ts` 中注入 API：

- `window.api.plugin.*` - 插件相关 API
- `window.api.fs.*` - 文件系统 API
- `window.api.app.*` - 应用相关 API

### 5. 启动开发服务器

```bash
pnpm dev
```

## Electron vs Tauri 的优势

### ✅ Electron 优势

1. **BrowserView 强大** - 可以创建独立的浏览器视图
2. **本地文件访问无限制** - 可以直接加载 `file://` 协议
3. **Node.js 集成** - 插件可以使用 Node.js API
4. **成熟的生态** - 大量插件和工具

### ⚠️ 注意事项

1. 体积较大（~100MB）
2. 内存占用较高
3. 需要处理好安全性（contextIsolation）

## 插件系统设计

### 插件格式

```
plugin.zip
├── manifest.json      # 插件元数据
├── frontend/
│   └── index.html    # 插件入口
└── backend/          # 可选：Rust 动态库
    └── lib*.dylib
```

### 插件加载流程

1. 用户输入插件 URL
2. 主进程下载并解压 ZIP
3. 读取 manifest.json
4. 使用 BrowserView 加载 frontend/index.html
5. 通过 preload 注入 `window.UniHub` API
6. 插件通过 API 调用后端功能

### API 设计

```typescript
window.UniHub = {
  Vue, // Vue 3
  invoke: (command, args) => {
    // 调用主进程功能
  }
}
```

## 开发建议

1. **先实现基础功能** - 插件安装、卸载、列表
2. **再实现 BrowserView** - 插件加载和显示
3. **最后实现后端调用** - FFI 加载动态库

## 参考资料

- [Electron 官方文档](https://www.electronjs.org/docs/latest/)
- [electron-vite 文档](https://electron-vite.org/)
- [BrowserView API](https://www.electronjs.org/docs/latest/api/browser-view)
