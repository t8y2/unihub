# API 参考

本节提供 UniHub 插件 API 的完整参考文档。

## API 概览

UniHub 为插件提供两类 API：

### Plugin API

通过 `window.pluginAPI` 访问，提供与 UniHub 主应用交互的能力：

- **clipboard** - 剪贴板操作
- **storage** - 本地数据存储
- **dialog** - 系统对话框
- **notification** - 系统通知

### Node API

通过 `window.nodeAPI` 访问，提供 Node.js 能力（需要相应权限）：

- **fs** - 文件系统操作
- **path** - 路径处理
- **http** - HTTP 请求
- **spawn** - 执行系统命令

## 权限要求

| API                      | 所需权限    |
| ------------------------ | ----------- |
| `pluginAPI.clipboard`    | `clipboard` |
| `pluginAPI.storage`      | `storage`   |
| `pluginAPI.dialog`       | 无          |
| `pluginAPI.notification` | 无          |
| `nodeAPI.fs`             | `fs`        |
| `nodeAPI.path`           | 无          |
| `nodeAPI.http`           | `http`      |
| `nodeAPI.spawn`          | `spawn`     |

## TypeScript 类型

如果使用 TypeScript，可以安装类型定义：

```bash
pnpm add -D @unihub/plugin-types
```

```typescript
/// <reference types="@unihub/plugin-types" />

// 现在可以获得类型提示
const text = await window.pluginAPI.clipboard.readText()
```

## 错误处理

所有 API 都返回 Promise，应使用 try-catch 处理错误：

```javascript
try {
  const result = await window.pluginAPI.clipboard.readText()
  console.log(result)
} catch (error) {
  console.error('操作失败:', error.message)
}
```

## 下一步

- [Plugin API 详解](/api/plugin-api)
- [Node API 详解](/api/node-api)
- [事件参考](/api/events)
