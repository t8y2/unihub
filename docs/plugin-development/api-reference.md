# UniHub 插件 API 参考

## 🎯 概述

UniHub 为插件提供了丰富的 API，让插件可以与系统进行交互。所有 API 都通过 `window.unihub` 对象暴露。

## 📋 API 分类

### 🗂️ 剪贴板 API

- `window.unihub.clipboard.readText()` - 读取剪贴板文本
- `window.unihub.clipboard.writeText(text)` - 写入文本到剪贴板

### 💾 数据存储 API

- `window.unihub.storage.get(key)` - 获取存储的数据
- `window.unihub.storage.set(key, value)` - 存储数据
- `window.unihub.storage.remove(key)` - 删除数据

### 🔔 通知 API

- `window.unihub.notification.show(options)` - 显示系统通知

### 📁 文件系统 API

- `window.unihub.fs.readFile(path)` - 读取文件
- `window.unihub.fs.writeFile(path, content)` - 写入文件

### 🌐 HTTP API

- `window.unihub.http.request(options)` - 发送 HTTP 请求

### ℹ️ 系统信息 API

- `window.unihub.system.getInfo()` - 获取系统信息

## 📖 详细说明

### 剪贴板 API

#### 读取剪贴板

```javascript
const text = await window.unihub.clipboard.readText()
console.log('剪贴板内容:', text)
```

#### 写入剪贴板

```javascript
await window.unihub.clipboard.writeText('Hello UniHub!')
```

### 数据存储 API

#### 存储数据

```javascript
await window.unihub.storage.set('user-settings', {
  theme: 'dark',
  language: 'zh-CN'
})
```

#### 读取数据

```javascript
const settings = await window.unihub.storage.get('user-settings')
console.log('用户设置:', settings)
```

### 通知 API

```javascript
window.unihub.notification.show({
  title: '操作完成',
  body: '文件已成功保存',
  icon: 'success'
})
```

## 🛡️ 权限系统

使用 API 前需要在 `package.json` 中声明相应权限：

```json
{
  "unihub": {
    "permissions": ["clipboard", "storage", "notification", "fs", "http", "system"]
  }
}
```

## 🔍 错误处理

所有 API 调用都应该进行错误处理：

```javascript
try {
  const text = await window.unihub.clipboard.readText()
  // 处理成功情况
} catch (error) {
  console.error('读取剪贴板失败:', error)
  // 处理错误情况
}
```

---

**更多详细的 API 文档正在完善中...** 📝
