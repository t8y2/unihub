# 权限问题修复指南

## 问题描述

如果你看到错误：`插件 com.unihub.modern-vue 缺少权限: spawn`

这是因为插件使用了 Sidecar 功能，但没有声明 `spawn` 权限。

## 🔧 解决方案

### 方案 1：重新安装插件（推荐）

1. **卸载旧版本**
   - 在 UniHub 中打开「插件管理」
   - 找到 `modern-vue-plugin`
   - 点击「卸载」

2. **重新构建插件**
   ```bash
   cd examples/modern-vue-plugin
   npm run build
   npm run package
   ```

3. **重新安装**
   - 在 UniHub 中打开「插件管理」
   - 点击「安装插件」
   - 选择 `examples/modern-vue-plugin/plugin.zip`
   - **允许权限请求**（包括 spawn 权限）

### 方案 2：使用脚本（快速）

```bash
# 运行重新安装脚本
./scripts/reinstall-plugin.sh

# 然后在 UniHub 中：
# 1. 卸载旧版本
# 2. 安装新版本
```

### 方案 3：手动修复（开发模式）

如果你在开发模式下运行插件：

1. **更新 package.json**
   ```json
   {
     "unihub": {
       "permissions": [
         "fs",
         "clipboard",
         "http",
         "spawn"  // ← 添加这个
       ]
     }
   }
   ```

2. **重启 UniHub**
   - 关闭 UniHub
   - 重新运行 `pnpm dev`

## 📝 权限说明

### 已修复的权限配置

```json
{
  "unihub": {
    "permissions": [
      "fs",         // 文件系统访问
      "clipboard",  // 剪贴板访问
      "http",       // HTTP 请求
      "spawn"       // 子进程执行（Sidecar）
    ]
  }
}
```

### 各权限的用途

| 权限 | 用途 | 示例插件需要 |
|------|------|-------------|
| `fs` | 读写文件 | ✅ |
| `clipboard` | 剪贴板操作 | ✅ |
| `http` | 网络请求 | ✅ |
| `spawn` | 执行 Sidecar | ✅ |
| `notification` | 系统通知 | ❌ |
| `system` | 系统信息 | ❌ |

## 🎯 验证修复

安装新版本后，测试 Sidecar 功能：

```typescript
// 在插件中测试
try {
  const result = await window.node.spawn('./sidecar/main-darwin', [], {
    input: JSON.stringify({
      action: 'reverse',
      data: 'Hello World'
    })
  })
  
  console.log('✅ Sidecar 调用成功:', result.stdout)
} catch (error) {
  console.error('❌ Sidecar 调用失败:', error)
}
```

## 💡 最佳实践

### 1. 声明所需权限

在开发插件时，确保在 `package.json` 中声明所有需要的权限：

```json
{
  "unihub": {
    "permissions": [
      // 只声明你需要的权限
      "clipboard",
      "http"
    ]
  }
}
```

### 2. 最小权限原则

不要声明不需要的权限：

```json
// ❌ 不好的做法
{
  "permissions": ["fs", "clipboard", "http", "spawn", "notification", "system"]
}

// ✅ 好的做法
{
  "permissions": ["clipboard"]  // 只声明需要的
}
```

### 3. 权限说明

在插件的 README 中说明为什么需要这些权限：

```markdown
## 权限说明

本插件需要以下权限：

- **clipboard**：读取和写入剪贴板内容
- **http**：从 API 获取数据
- **spawn**：调用 Go 编写的图像处理程序
```

## 🐛 常见问题

### Q: 为什么内置插件不需要权限？

A: 内置插件（如 Base64 Tool）是应用的一部分，已经过审核，不受权限限制。

### Q: 如何查看插件的权限？

A: 在「插件管理」页面可以看到每个插件请求的权限。

### Q: 可以在运行时动态请求权限吗？

A: 不可以。权限必须在 `package.json` 中声明，在安装时授予。

### Q: 如果插件没有声明权限会怎样？

A: 插件将无法使用任何需要权限的 API，调用时会抛出错误。

## 🔄 自动化修复

如果你有多个插件需要更新权限，可以使用这个脚本：

```bash
#!/bin/bash
# update-permissions.sh

# 更新所有插件的权限
for plugin in examples/*/package.json; do
  echo "更新 $plugin"
  # 使用 jq 或手动编辑
done
```

## 📚 相关文档

- [权限系统说明](./IMPROVEMENTS.md#2-权限系统)
- [插件开发指南](./PLUGIN_DEVELOPMENT.md)
- [API 参考](./PLUGIN_API.md)

---

**问题解决了吗？** 如果还有问题，请查看 [GitHub Issues](https://github.com/yourname/unihub/issues)
