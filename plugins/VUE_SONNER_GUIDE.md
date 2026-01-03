# Vue Sonner 使用指南

本指南说明如何在 UniHub 插件中使用 vue-sonner 显示通知。

## ✅ 已配置

所有插件模板已经配置好 vue-sonner，开箱即用！

## 📦 依赖

已添加到 `package.json`：

```json
{
  "dependencies": {
    "vue-sonner": "^2.0.9"
  },
  "devDependencies": {
    "tw-animate-css": "^1.4.0"
  }
}
```

## 🎨 样式配置

在 `src/style.css` 中已导入：

```css
@import 'tailwindcss';

@plugin "tailwindcss-animate";
@import 'tw-animate-css';

/* ... 其他样式 ... */

/* 导入 vue-sonner 样式 */
@import 'vue-sonner/style.css';
```

## 🚀 基本使用

### 1. 在组件中导入

```vue
<script setup lang="ts">
import { toast, Toaster } from 'vue-sonner'
</script>

<template>
  <!-- 添加 Toaster 组件 -->
  <Toaster position="top-center" :duration="3000" />

  <!-- 你的组件内容 -->
</template>
```

### 2. 显示通知

```typescript
// 成功通知
toast.success('操作成功！', {
  description: '你的操作已完成'
})

// 错误通知
toast.error('操作失败！', {
  description: '请稍后重试'
})

// 信息通知
toast.info('提示信息', {
  description: '这是一条信息'
})

// 警告通知
toast.warning('警告', {
  description: '请注意'
})

// 加载通知
const loadingToast = toast.loading('加载中...')
// 完成后更新
toast.success('加载完成！', { id: loadingToast })

// Promise 通知
toast.promise(fetch('/api/data'), {
  loading: '加载中...',
  success: '加载成功！',
  error: '加载失败'
})
```

## 🎯 完整示例

参考 `plugins/_template/src/App.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { toast, Toaster } from 'vue-sonner'

const showToast = () => {
  toast.success('这是一个成功提示！', {
    description: '使用 vue-sonner 显示通知'
  })
}

const showErrorToast = () => {
  toast.error('这是一个错误提示！', {
    description: '可以显示不同类型的通知'
  })
}

const showInfoToast = () => {
  toast.info('这是一个信息提示！', {
    description: '支持多种通知类型'
  })
}
</script>

<template>
  <Toaster position="top-center" :duration="3000" />

  <div class="flex gap-2">
    <button @click="showToast">成功提示</button>
    <button @click="showErrorToast">错误提示</button>
    <button @click="showInfoToast">信息提示</button>
  </div>
</template>
```

## ⚙️ Toaster 配置选项

```vue
<Toaster
  position="top-center"        <!-- 位置: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->
  :duration="3000"              <!-- 持续时间（毫秒） -->
  :close-button="true"          <!-- 显示关闭按钮 -->
  :rich-colors="true"           <!-- 使用丰富的颜色 -->
  :expand="false"               <!-- 展开显示 -->
  :visible-toasts="3"           <!-- 可见通知数量 -->
  theme="system"                <!-- 主题: light, dark, system -->
/>
```

## 🎨 Toast 选项

```typescript
toast.success('消息', {
  description: '描述文本',
  duration: 5000, // 持续时间
  position: 'top-center', // 位置
  dismissible: true, // 可关闭
  action: {
    // 操作按钮
    label: '撤销',
    onClick: () => console.log('撤销')
  },
  cancel: {
    // 取消按钮
    label: '取消',
    onClick: () => console.log('取消')
  },
  id: 'unique-id', // 唯一 ID
  onDismiss: () => {}, // 关闭回调
  onAutoClose: () => {} // 自动关闭回调
})
```

## 💡 高级用法

### 自定义内容

```typescript
import { toast } from 'vue-sonner'
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

toast(h(MyComponent, { prop: 'value' }))
```

### 更新通知

```typescript
const toastId = toast.loading('加载中...')

// 稍后更新
toast.success('完成！', { id: toastId })
```

### 关闭通知

```typescript
// 关闭特定通知
toast.dismiss(toastId)

// 关闭所有通知
toast.dismiss()
```

### 自定义样式

```typescript
toast.success('消息', {
  style: {
    background: 'green',
    color: 'white'
  },
  className: 'my-custom-toast'
})
```

## 🎯 实际应用场景

### 1. 复制到剪贴板

```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  } catch (error) {
    toast.error('复制失败', {
      description: error.message
    })
  }
}
```

### 2. API 请求

```typescript
const fetchData = async () => {
  const promise = fetch('/api/data').then((res) => res.json())

  toast.promise(promise, {
    loading: '加载数据中...',
    success: (data) => `加载了 ${data.length} 条数据`,
    error: '加载失败，请重试'
  })
}
```

### 3. 表单提交

```typescript
const submitForm = async (formData: FormData) => {
  const toastId = toast.loading('提交中...')

  try {
    await api.submit(formData)
    toast.success('提交成功！', { id: toastId })
  } catch (error) {
    toast.error('提交失败', {
      id: toastId,
      description: error.message
    })
  }
}
```

### 4. 撤销操作

```typescript
const deleteItem = (id: string) => {
  const deletedItem = items.value.find((item) => item.id === id)
  items.value = items.value.filter((item) => item.id !== id)

  toast.success('已删除', {
    action: {
      label: '撤销',
      onClick: () => {
        items.value.push(deletedItem)
        toast.success('已恢复')
      }
    }
  })
}
```

## 🎨 与主题集成

vue-sonner 会自动适配你的深色模式：

```css
/* 在 style.css 中已配置 */
.dark {
  /* 深色模式变量 */
}
```

Toaster 会自动使用 CSS 变量中的颜色。

## 📚 更多资源

- [vue-sonner GitHub](https://github.com/xiaoluoboding/vue-sonner)
- [Sonner 官方文档](https://sonner.emilkowal.ski/)

## ✨ 特性总结

- ✅ 开箱即用，已配置好所有依赖
- ✅ 支持多种通知类型（success, error, info, warning, loading）
- ✅ 自动适配深色模式
- ✅ 支持 Promise 通知
- ✅ 支持自定义内容和样式
- ✅ 支持操作按钮和撤销功能
- ✅ 完全类型安全（TypeScript）
- ✅ 动画流畅（使用 tw-animate-css）

## 🔧 Cursor Pointer 支持

所有按钮元素已自动添加 `cursor: pointer`：

```css
@layer base {
  button {
    cursor: pointer;
  }

  input[type='number'] {
    cursor: pointer;
  }
}
```

你也可以使用 Tailwind 类：

```html
<div class="cursor-pointer">点击我</div>
<div class="hover:cursor-pointer">悬停显示指针</div>
```

## 🎉 开始使用

现在你可以在插件中自由使用 vue-sonner 了！参考 `plugins/_template/src/App.vue` 查看完整示例。
