# 主题适配

UniHub 支持浅色和深色主题，插件应该适配这两种主题以提供一致的用户体验。

## 监听主题变化

当用户切换主题时，UniHub 会通知所有插件：

```javascript
// 监听主题变化事件
window.electron.ipcRenderer.on('theme-changed', (event, theme) => {
  applyTheme(theme)
})

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}
```

## CSS 主题适配

### 使用 CSS 类

```css
/* 默认浅色主题 */
body {
  background-color: #ffffff;
  color: #333333;
}

/* 深色主题 */
body.dark {
  background-color: #1a1a1a;
  color: #ffffff;
}

/* 组件样式 */
.card {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

body.dark .card {
  background: #2d2d2d;
  border: 1px solid #404040;
}
```

### 使用 CSS 变量

推荐使用 CSS 变量，更易于维护：

```css
:root {
  /* 浅色主题变量 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #007aff;
}

body.dark {
  /* 深色主题变量 */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
  --accent-color: #0a84ff;
}

/* 使用变量 */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.button {
  background: var(--accent-color);
  color: white;
}
```

### 使用 prefers-color-scheme

也可以使用媒体查询作为后备：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
  }
}
```

## 获取初始主题

插件加载时，可能需要获取当前主题：

```javascript
// 方式一：检查 URL 参数（UniHub 会传递）
const params = new URLSearchParams(window.location.search)
const initialTheme = params.get('theme') || 'light'

// 方式二：等待主题通知
// UniHub 会在插件加载后发送当前主题
```

## Vue 组件示例

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)

const handleThemeChange = (event, theme) => {
  isDark.value = theme === 'dark'
}

onMounted(() => {
  window.electron.ipcRenderer.on('theme-changed', handleThemeChange)
})

onUnmounted(() => {
  window.electron.ipcRenderer.off('theme-changed', handleThemeChange)
})
</script>

<template>
  <div :class="{ dark: isDark }">
    <!-- 内容 -->
  </div>
</template>

<style>
.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}
</style>
```

## React 组件示例

```jsx
import { useState, useEffect } from 'react'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const handleThemeChange = (event, newTheme) => {
      setTheme(newTheme)
    }

    window.electron.ipcRenderer.on('theme-changed', handleThemeChange)

    return () => {
      window.electron.ipcRenderer.off('theme-changed', handleThemeChange)
    }
  }, [])

  return <div className={theme === 'dark' ? 'dark' : ''}>{/* 内容 */}</div>
}
```

## 最佳实践

1. **始终支持两种主题**: 不要只支持一种主题
2. **使用 CSS 变量**: 便于维护和扩展
3. **测试两种主题**: 确保在两种主题下都能正常显示
4. **注意对比度**: 确保文字在两种主题下都清晰可读
5. **图标适配**: 使用能适应两种主题的图标（如 SVG）
6. **避免硬编码颜色**: 使用变量而不是硬编码的颜色值

## 颜色参考

UniHub 使用的主要颜色：

| 用途     | 浅色主题  | 深色主题  |
| -------- | --------- | --------- |
| 背景     | `#ffffff` | `#1a1a1a` |
| 次要背景 | `#f5f5f5` | `#2d2d2d` |
| 主要文字 | `#333333` | `#ffffff` |
| 次要文字 | `#666666` | `#a0a0a0` |
| 边框     | `#e0e0e0` | `#404040` |
| 强调色   | `#007aff` | `#0a84ff` |
