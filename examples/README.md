# UniHub 插件示例

## 📦 modern-vue-plugin

现代化的 Vue 3 插件示例，展示了完整的开发流程。

### 特性

- ✅ Vite + Vue 3 + TypeScript
- ✅ 单文件打包（vite-plugin-singlefile）
- ✅ 使用 UniHub API（数据库、剪贴板、系统）
- ✅ 完整的打包脚本

### 快速开始

```bash
cd modern-vue-plugin
npm install
npm run dev
```

### 构建打包

```bash
npm run build    # 构建到 dist/
npm run package  # 打包成 plugin.zip
```

### 安装测试

在 UniHub 中安装 `plugin.zip` 进行测试。

## 🚀 创建新插件

使用脚手架工具快速创建：

```bash
node ../tools/create-plugin.js my-plugin
cd my-plugin
npm install
npm run dev
```

## 📚 文档

- [插件开发指南](../PLUGIN_DEVELOPMENT.md)
- [API 参考](../PLUGIN_API_REFERENCE.md)
