# 权限系统

UniHub 使用权限系统来保护用户安全。插件需要在 `package.json` 的 `unihub.permissions` 中声明所需权限，用户安装时可以看到这些权限。

## 可用权限

| 权限        | 说明         | 风险等级 |
| ----------- | ------------ | -------- |
| `clipboard` | 读写剪贴板   | 低       |
| `storage`   | 本地数据存储 | 低       |
| `fs`        | 文件系统访问 | 中       |
| `http`      | 网络请求     | 中       |
| `spawn`     | 执行系统命令 | 高       |

## 权限详解

### clipboard

允许插件读取和写入系统剪贴板。

**用途**:

- 复制生成的内容
- 读取用户复制的文本进行处理

**API**:

```javascript
// 写入文本
await window.pluginAPI.clipboard.writeText('Hello')

// 读取文本
const text = await window.pluginAPI.clipboard.readText()
```

### storage

允许插件在本地存储数据，数据按插件隔离。

**用途**:

- 保存用户设置
- 缓存数据
- 保存历史记录

**API**:

```javascript
// 存储数据
await window.pluginAPI.storage.set('key', { foo: 'bar' })

// 读取数据
const data = await window.pluginAPI.storage.get('key')

// 删除数据
await window.pluginAPI.storage.remove('key')

// 清空所有数据
await window.pluginAPI.storage.clear()
```

### fs

允许插件访问文件系统。

**用途**:

- 读取用户选择的文件
- 保存文件到本地
- 导入/导出数据

**API**:

```javascript
// 读取文件
const content = await window.nodeAPI.fs.readFile('/path/to/file', 'utf-8')

// 写入文件
await window.nodeAPI.fs.writeFile('/path/to/file', 'content')

// 打开文件选择对话框
const filePath = await window.pluginAPI.dialog.showOpenDialog({
  filters: [{ name: 'Text', extensions: ['txt'] }]
})
```

::: warning 注意
文件系统访问受到沙箱限制，只能访问用户明确选择的文件或特定目录。
:::

### http

允许插件发起网络请求。

**用途**:

- 调用外部 API
- 下载资源
- 上传数据

**API**:

```javascript
// 使用 fetch（受 CORS 限制）
const response = await fetch('https://api.example.com/data')

// 使用 Node.js API（无 CORS 限制）
const data = await window.nodeAPI.http.get('https://api.example.com/data')
```

### spawn

允许插件执行系统命令。

**用途**:

- 调用本地工具
- 执行脚本
- 系统集成

**API**:

```javascript
// 执行命令
const result = await window.nodeAPI.spawn('ls', ['-la'])
console.log(result.stdout)
```

::: danger 警告
`spawn` 权限风险较高，只有在必要时才申请此权限。用户应谨慎安装需要此权限的插件。
:::

## 声明权限

在 `package.json` 的 `unihub` 字段中声明所需权限：

```json
{
  "unihub": {
    "permissions": ["clipboard", "storage"]
  }
}
```

````

## 最小权限原则

遵循最小权限原则：

1. **只申请必需的权限**: 不要申请用不到的权限
2. **说明权限用途**: 在插件描述中说明为什么需要这些权限
3. **优雅降级**: 如果某个权限被拒绝，插件应该能够继续运行（功能受限）

## 权限检查

在使用需要权限的 API 前，可以检查权限是否已授予：

```javascript
// 检查权限
const hasPermission = await window.pluginAPI.hasPermission('clipboard')

if (hasPermission) {
  // 使用剪贴板 API
} else {
  // 提示用户或使用替代方案
}
````

## 用户视角

用户在安装插件时会看到权限列表：

```
插件 "XXX" 需要以下权限：
✓ 剪贴板 - 读写剪贴板内容
✓ 存储 - 在本地保存数据
```

用户可以选择是否安装需要特定权限的插件。
