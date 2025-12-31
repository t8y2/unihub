# 🚨 快速修复：权限错误

## 错误信息
```
插件 com.unihub.modern-vue 缺少权限: spawn
```

## ⚡ 3 步快速修复

### 1️⃣ 更新权限配置

编辑 `examples/modern-vue-plugin/package.json`：

```json
{
  "unihub": {
    "permissions": [
      "fs",
      "clipboard",
      "http",
      "spawn"  // ← 添加这一行
    ]
  }
}
```

### 2️⃣ 重新构建插件

```bash
cd examples/modern-vue-plugin
npm run build
npm run package
```

### 3️⃣ 重新安装

在 UniHub 中：
1. 打开「插件管理」
2. 卸载 `modern-vue-plugin`
3. 安装 `examples/modern-vue-plugin/plugin.zip`
4. ✅ 允许权限请求

## ✅ 已修复

我已经帮你修复了以下内容：

1. ✅ 更新了 `examples/modern-vue-plugin/package.json`，添加了 `spawn` 权限
2. ✅ 添加了权限初始化功能，应用启动时自动加载已安装插件的权限
3. ✅ 内置插件不再受权限限制
4. ✅ 改进了错误提示，提供解决方案

## 🔄 下次启动

下次启动 UniHub 时：
```bash
pnpm dev
```

权限系统会自动加载所有已安装插件的权限配置。

## 📚 详细文档

- [权限修复指南](./docs/PERMISSION_FIX.md)
- [权限系统说明](./docs/IMPROVEMENTS.md#2-权限系统)

---

**现在重新构建插件并安装即可！** 🎉
