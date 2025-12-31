# 插件权限系统

## 📋 权限列表

### 文件系统权限
- `fs:read` - 读取文件
- `fs:write` - 写入文件
- `fs:select` - 选择文件/目录

### 剪贴板权限
- `clipboard:read` - 读取剪贴板
- `clipboard:write` - 写入剪贴板

### 网络权限
- `http:request` - 发起 HTTP 请求

### 系统权限
- `system:info` - 获取系统信息
- `system:shell` - 执行系统命令
- `notification` - 显示通知

### 后端权限
- `backend` - 调用自定义后端

## 🔧 配置权限

在 `package.json` 中声明所需权限：

```json
{
  "unihub": {
    "permissions": [
      "fs:read",
      "clipboard:write",
      "http:request",
      "notification"
    ]
  }
}
```

## 🛡️ 权限检查

插件调用 API 时会自动检查权限：

```javascript
// 如果没有 clipboard:write 权限，会抛出错误
await window.unihub.clipboard.writeText('Hello')
// Error: Permission denied: clipboard:write
```

## 👤 用户授权

首次使用需要权限的 API 时，会弹窗请求用户授权：

```
┌─────────────────────────────────────┐
│  插件权限请求                        │
├─────────────────────────────────────┤
│  "我的插件" 请求以下权限：           │
│                                     │
│  📋 读取剪贴板                      │
│  📝 写入剪贴板                      │
│  🌐 发起网络请求                    │
│                                     │
│  [ 拒绝 ]  [ 允许一次 ]  [ 始终允许 ] │
└─────────────────────────────────────┘
```

## 🔒 权限管理

用户可以在插件管理页面查看和管理权限：

```
插件名称: 我的插件
已授权权限:
  ✅ 读取剪贴板
  ✅ 写入剪贴板
  ✅ 发起网络请求
  ❌ 读取文件系统 (未授权)

[ 撤销所有权限 ]
```

## 💡 最佳实践

1. **最小权限原则**：只申请必需的权限
2. **说明用途**：在文档中说明为什么需要这些权限
3. **优雅降级**：权限被拒绝时提供替代方案

```javascript
// 示例：优雅降级
try {
  await window.unihub.clipboard.writeText(result)
  showMessage('已复制到剪贴板')
} catch (error) {
  if (error.message.includes('Permission denied')) {
    // 提供手动复制的方式
    showCopyDialog(result)
  }
}
```

## 🚫 危险权限

某些权限需要特别注意：

- `system:shell` - 可以执行任意系统命令，非常危险
- `fs:write` - 可以修改文件系统
- `backend` - 可以执行自定义代码

这些权限会在授权时显示警告。

## 📊 权限统计

插件市场会显示权限使用情况：

```
权限使用统计:
  fs:read        - 45% 的插件使用
  clipboard:write - 67% 的插件使用
  http:request   - 34% 的插件使用
  backend        - 12% 的插件使用
```

## 🔍 权限审计

开发者可以查看插件的权限使用情况：

```javascript
// 开发者工具
window.unihub.dev.auditPermissions('com.example.plugin')
// 返回:
{
  declared: ['fs:read', 'clipboard:write'],
  granted: ['fs:read', 'clipboard:write'],
  used: ['clipboard:write'],
  unused: ['fs:read']  // 声明了但未使用
}
```

