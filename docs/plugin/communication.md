# 与主应用通信

插件运行在独立的 WebContentsView 中，通过 Plugin API 与 UniHub 主应用通信。

## Plugin API

UniHub 在插件加载时会注入 `window.pluginAPI` 对象，提供与主应用交互的能力。

### 剪贴板

```javascript
// 写入文本
await window.pluginAPI.clipboard.writeText('Hello World')

// 读取文本
const text = await window.pluginAPI.clipboard.readText()

// 写入 HTML
await window.pluginAPI.clipboard.writeHTML('<b>Hello</b>')

// 读取 HTML
const html = await window.pluginAPI.clipboard.readHTML()
```

### 本地存储

```javascript
// 存储数据（自动序列化）
await window.pluginAPI.storage.set('settings', {
  theme: 'dark',
  fontSize: 14
})

// 读取数据
const settings = await window.pluginAPI.storage.get('settings')

// 读取所有数据
const allData = await window.pluginAPI.storage.getAll()

// 删除数据
await window.pluginAPI.storage.remove('settings')

// 清空所有数据
await window.pluginAPI.storage.clear()
```

### 对话框

```javascript
// 打开文件选择对话框
const result = await window.pluginAPI.dialog.showOpenDialog({
  title: '选择文件',
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    { name: 'All Files', extensions: ['*'] }
  ],
  properties: ['openFile', 'multiSelections']
})

if (!result.canceled) {
  console.log('选择的文件:', result.filePaths)
}

// 保存文件对话框
const saveResult = await window.pluginAPI.dialog.showSaveDialog({
  title: '保存文件',
  defaultPath: 'untitled.txt',
  filters: [{ name: 'Text', extensions: ['txt'] }]
})

if (!saveResult.canceled) {
  console.log('保存路径:', saveResult.filePath)
}

// 消息对话框
const response = await window.pluginAPI.dialog.showMessageBox({
  type: 'question',
  title: '确认',
  message: '确定要删除吗？',
  buttons: ['取消', '删除'],
  defaultId: 0,
  cancelId: 0
})

if (response.response === 1) {
  // 用户点击了"删除"
}
```

### 通知

```javascript
// 显示通知
window.pluginAPI.notification.show({
  title: '操作成功',
  body: '文件已保存'
})
```

## Node API

如果插件声明了相应权限，可以使用 `window.nodeAPI` 访问 Node.js 能力。

### 文件系统

```javascript
// 读取文件
const content = await window.nodeAPI.fs.readFile('/path/to/file', 'utf-8')

// 写入文件
await window.nodeAPI.fs.writeFile('/path/to/file', 'content')

// 检查文件是否存在
const exists = await window.nodeAPI.fs.exists('/path/to/file')

// 读取目录
const files = await window.nodeAPI.fs.readdir('/path/to/dir')

// 创建目录
await window.nodeAPI.fs.mkdir('/path/to/dir', { recursive: true })

// 删除文件
await window.nodeAPI.fs.unlink('/path/to/file')
```

### 路径处理

```javascript
// 拼接路径
const fullPath = window.nodeAPI.path.join('/home', 'user', 'file.txt')

// 获取目录名
const dir = window.nodeAPI.path.dirname('/home/user/file.txt')

// 获取文件名
const filename = window.nodeAPI.path.basename('/home/user/file.txt')

// 获取扩展名
const ext = window.nodeAPI.path.extname('file.txt')
```

### 执行命令

```javascript
// 执行命令
const result = await window.nodeAPI.spawn('git', ['status'])
console.log('stdout:', result.stdout)
console.log('stderr:', result.stderr)
console.log('exit code:', result.code)
```

## 事件通信

### 监听主题变化

```javascript
// 方式一：通过 IPC
window.electron.ipcRenderer.on('theme-changed', (event, theme) => {
  console.log('主题变化:', theme) // 'light' 或 'dark'
  document.body.classList.toggle('dark', theme === 'dark')
})

// 方式二：通过 message 事件
window.addEventListener('message', (event) => {
  if (event.data.type === 'theme-changed') {
    const theme = event.data.theme
    // 更新 UI
  }
})
```

### 监听可见性变化

```javascript
// 当插件标签页被激活或隐藏时
window.electron.ipcRenderer.on('plugin-visibility-changed', (event, visible) => {
  if (visible) {
    // 插件变为可见，可以恢复动画等
  } else {
    // 插件被隐藏，可以暂停动画节省资源
  }
})
```

## 获取插件信息

```javascript
// 获取当前插件 ID
const pluginId = window.__UNIHUB_PLUGIN_ID__

// 获取插件存储路径
const storagePath = await window.pluginAPI.getStoragePath()
```

## 错误处理

所有 API 调用都应该使用 try-catch 处理错误：

```javascript
try {
  await window.pluginAPI.clipboard.writeText('Hello')
} catch (error) {
  console.error('写入剪贴板失败:', error.message)
  // 显示错误提示给用户
}
```
