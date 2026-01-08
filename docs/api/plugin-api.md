# Plugin API

`window.pluginAPI` 提供与 UniHub 主应用交互的能力。

## clipboard

剪贴板操作，需要 `clipboard` 权限。

### readText()

读取剪贴板中的文本。

```typescript
readText(): Promise<string>
```

**示例**:

```javascript
const text = await window.pluginAPI.clipboard.readText()
console.log('剪贴板内容:', text)
```

### writeText(text)

将文本写入剪贴板。

```typescript
writeText(text: string): Promise<void>
```

**参数**:

- `text` - 要写入的文本

**示例**:

```javascript
await window.pluginAPI.clipboard.writeText('Hello World')
```

### readHTML()

读取剪贴板中的 HTML 内容。

```typescript
readHTML(): Promise<string>
```

### writeHTML(html)

将 HTML 写入剪贴板。

```typescript
writeHTML(html: string): Promise<void>
```

### readImage()

读取剪贴板中的图片。

```typescript
readImage(): Promise<string> // 返回 base64 数据
```

### writeImage(dataUrl)

将图片写入剪贴板。

```typescript
writeImage(dataUrl: string): Promise<void>
```

**参数**:

- `dataUrl` - 图片的 Data URL（base64）

---

## storage

本地数据存储，需要 `storage` 权限。数据按插件隔离。

### get(key)

获取存储的数据。

```typescript
get<T>(key: string): Promise<T | null>
```

**参数**:

- `key` - 数据键名

**返回**: 存储的数据，不存在时返回 `null`

**示例**:

```javascript
const settings = await window.pluginAPI.storage.get('settings')
if (settings) {
  console.log('设置:', settings)
}
```

### set(key, value)

存储数据。

```typescript
set(key: string, value: any): Promise<void>
```

**参数**:

- `key` - 数据键名
- `value` - 要存储的数据（会自动序列化）

**示例**:

```javascript
await window.pluginAPI.storage.set('settings', {
  theme: 'dark',
  fontSize: 14
})
```

### remove(key)

删除指定键的数据。

```typescript
remove(key: string): Promise<void>
```

### clear()

清空插件的所有存储数据。

```typescript
clear(): Promise<void>
```

### getAll()

获取插件的所有存储数据。

```typescript
getAll(): Promise<Record<string, any>>
```

---

## dialog

系统对话框，无需特殊权限。

### showOpenDialog(options)

显示文件打开对话框。

```typescript
interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  properties?: Array<
    'openFile' | 'openDirectory' | 'multiSelections' |
    'showHiddenFiles' | 'createDirectory'
  >
}

interface OpenDialogResult {
  canceled: boolean
  filePaths: string[]
}

showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogResult>
```

**示例**:

```javascript
const result = await window.pluginAPI.dialog.showOpenDialog({
  title: '选择图片',
  filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
  properties: ['openFile', 'multiSelections']
})

if (!result.canceled) {
  console.log('选择的文件:', result.filePaths)
}
```

### showSaveDialog(options)

显示文件保存对话框。

```typescript
interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
}

interface SaveDialogResult {
  canceled: boolean
  filePath?: string
}

showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogResult>
```

### showMessageBox(options)

显示消息对话框。

```typescript
interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  title?: string
  message: string
  detail?: string
  buttons?: string[]
  defaultId?: number
  cancelId?: number
}

interface MessageBoxResult {
  response: number // 点击的按钮索引
}

showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult>
```

**示例**:

```javascript
const result = await window.pluginAPI.dialog.showMessageBox({
  type: 'question',
  title: '确认删除',
  message: '确定要删除这个文件吗？',
  detail: '此操作不可撤销',
  buttons: ['取消', '删除'],
  defaultId: 0,
  cancelId: 0
})

if (result.response === 1) {
  // 用户点击了"删除"
}
```

---

## notification

系统通知，无需特殊权限。

### show(options)

显示系统通知。

```typescript
interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  silent?: boolean
}

show(options: NotificationOptions): void
```

**示例**:

```javascript
window.pluginAPI.notification.show({
  title: '操作成功',
  body: '文件已保存到本地'
})
```

---

## 其他方法

### hasPermission(permission)

检查是否拥有指定权限。

```typescript
hasPermission(permission: string): Promise<boolean>
```

**示例**:

```javascript
const hasClipboard = await window.pluginAPI.hasPermission('clipboard')
if (hasClipboard) {
  // 可以使用剪贴板 API
}
```

### getStoragePath()

获取插件的存储目录路径。

```typescript
getStoragePath(): Promise<string>
```

### getPluginId()

获取当前插件的 ID。

```typescript
getPluginId(): string
```

也可以通过 `window.__UNIHUB_PLUGIN_ID__` 获取。
