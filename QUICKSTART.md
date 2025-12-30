# 快速开始

## 1. 安装依赖

```bash
cd unihub-electron
pnpm install
```

## 2. 启动开发服务器

```bash
pnpm dev
```

## 3. 项目已包含

✅ Electron + Vue 3 + TypeScript
✅ electron-vite 配置
✅ Tailwind CSS（已添加到依赖）
✅ 插件系统依赖（ffi-napi, zip-lib）

## 4. 需要手动复制的文件

从旧项目复制以下内容到新项目：

### 前端组件
```bash
# 在项目根目录执行
cp -r frontend/src/components unihub-electron/src/renderer/src/
cp -r frontend/src/plugins unihub-electron/src/renderer/src/
cp -r frontend/src/types unihub-electron/src/renderer/src/
cp frontend/src/App.vue unihub-electron/src/renderer/src/
```

### 插件示例
```bash
cp -r examples unihub-electron/
```

## 5. 核心文件说明

### 主进程（src/main/）
- `index.ts` - 主进程入口，创建窗口
- `plugin-manager.ts` - 插件管理器（需要创建）

### Preload（src/preload/）
- `index.ts` - 注入 API 到渲染进程
- `index.d.ts` - TypeScript 类型定义

### 渲染进程（src/renderer/）
- `src/App.vue` - 主应用组件
- `src/main.ts` - Vue 应用入口
- `index.html` - HTML 入口

## 6. 与 Tauri 的主要区别

| 功能 | Tauri | Electron |
|------|-------|----------|
| 后端语言 | Rust | Node.js |
| 体积 | ~10MB | ~100MB |
| 插件加载 | 受限 | 灵活 |
| 本地文件 | 受限 | 无限制 |
| API 注入 | 困难 | 简单（preload） |

## 7. 下一步

1. 运行 `pnpm dev` 查看基础应用
2. 复制旧项目的前端代码
3. 实现插件管理器
4. 测试插件安装和加载

## 需要帮助？

查看 `MIGRATION.md` 了解详细的迁移步骤。
