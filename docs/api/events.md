# 事件

UniHub 通过事件与插件通信。插件可以监听这些事件来响应应用状态变化。

## 主题变化

当用户切换主题时触发。

### 监听方式

```javascript
// 方式一：通过 IPC
window.electron.ipcRenderer.on('theme-changed', (event, theme) => {
  console.log('主题:', theme) // 'light' 或 'dark'
})

// 方式二：通过 window message
window.addEventListener('message', (event) => {
  if (event.data.type === 'theme-changed') {
    console.log('主题:', event.data.theme)
  }
})
```

### 事件数据

```typescript
type Theme = 'light' | 'dark'
```

### 示例

```javascript
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.body.classList.toggle('dark', theme === 'dark')
}

window.electron.ipcRenderer.on('theme-changed', (event, theme) => {
  applyTheme(theme)
})
```

---

## 可见性变化

当插件标签页被激活或切换到其他标签时触发。

### 监听方式

```javascript
window.electron.ipcRenderer.on('plugin-visibility-changed', (event, visible) => {
  console.log('可见性:', visible) // true 或 false
})
```

### 事件数据

```typescript
type Visible = boolean
```

### 使用场景

- 暂停/恢复动画
- 暂停/恢复定时器
- 节省资源

### 示例

```javascript
let animationId = null

function startAnimation() {
  function animate() {
    // 动画逻辑
    animationId = requestAnimationFrame(animate)
  }
  animate()
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

window.electron.ipcRenderer.on('plugin-visibility-changed', (event, visible) => {
  if (visible) {
    startAnimation()
  } else {
    stopAnimation()
  }
})
```

---

## 窗口大小变化

当 UniHub 窗口大小改变时触发。

### 监听方式

```javascript
window.addEventListener('resize', () => {
  console.log('窗口大小:', window.innerWidth, window.innerHeight)
})
```

### 使用场景

- 响应式布局调整
- 重新计算元素尺寸

---

## 快捷键事件

插件可以监听键盘事件。

### 监听方式

```javascript
document.addEventListener('keydown', (event) => {
  // Cmd/Ctrl + S
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault()
    saveDocument()
  }
})
```

::: warning 注意
某些快捷键（如 `Cmd+W`、`Cmd+N`）会被 UniHub 拦截，插件无法捕获。
:::

---

## 自定义事件

插件可以使用自定义事件进行内部通信。

### 发送事件

```javascript
// 发送到父窗口
window.parent.postMessage(
  {
    type: 'custom-event',
    data: { foo: 'bar' }
  },
  '*'
)

// 发送自定义 DOM 事件
const event = new CustomEvent('my-event', {
  detail: { foo: 'bar' }
})
document.dispatchEvent(event)
```

### 监听事件

```javascript
// 监听 message 事件
window.addEventListener('message', (event) => {
  if (event.data.type === 'custom-event') {
    console.log(event.data.data)
  }
})

// 监听自定义 DOM 事件
document.addEventListener('my-event', (event) => {
  console.log(event.detail)
})
```

---

## 生命周期事件

### DOMContentLoaded

DOM 加载完成。

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // 初始化插件
  initPlugin()
})
```

### load

页面完全加载（包括图片等资源）。

```javascript
window.addEventListener('load', () => {
  // 所有资源加载完成
})
```

### beforeunload

页面即将卸载。

```javascript
window.addEventListener('beforeunload', (event) => {
  // 保存数据或清理资源
  saveData()
})
```

---

## 最佳实践

### 1. 清理事件监听器

```javascript
// Vue 3
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.electron.ipcRenderer.on('theme-changed', handleTheme)
})

onUnmounted(() => {
  window.electron.ipcRenderer.off('theme-changed', handleTheme)
})
```

### 2. 防抖处理

```javascript
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

window.addEventListener(
  'resize',
  debounce(() => {
    // 处理窗口大小变化
  }, 100)
)
```

### 3. 错误处理

```javascript
window.electron.ipcRenderer.on('theme-changed', (event, theme) => {
  try {
    applyTheme(theme)
  } catch (error) {
    console.error('应用主题失败:', error)
  }
})
```
