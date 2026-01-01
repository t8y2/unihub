# 组件迁移示例

本文档展示如何将旧组件迁移到新的优化架构。

## 示例 1：使用 usePluginData

### 优化前

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const recentPlugins = ref<string[]>([])
const favoritePlugins = ref<string[]>([])

const loadRecents = async () => {
  const data = await window.api.db.getRecents(10)
  recentPlugins.value = data.map(r => r.pluginId)
}

const loadFavorites = async () => {
  const data = await window.api.db.getFavorites()
  favoritePlugins.value = data.map(f => f.pluginId)
}

const toggleFavorite = async (pluginId: string) => {
  const isFav = await window.api.db.isFavorite(pluginId)
  if (isFav) {
    await window.api.db.removeFavorite(pluginId)
  } else {
    await window.api.db.addFavorite(pluginId)
  }
  await loadFavorites()
}

onMounted(async () => {
  await loadRecents()
  await loadFavorites()
})
</script>
```

### 优化后

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { usePluginData } from '@/composables/usePluginData'

const { recentPlugins, favoritePlugins, loadAll, toggleFavorite } = usePluginData()

onMounted(() => {
  loadAll()
})
</script>
```

**优化效果：**
- 代码从 30+ 行减少到 10 行
- 逻辑复用，多个组件可共享
- 更好的类型安全

---

## 示例 2：使用常量

### 优化前

```vue
<script setup lang="ts">
const categoryNames: Record<string, string> = {
  formatter: '格式化',
  tool: '工具',
  encoder: '编码'
}

const RECENT_LIMIT = 10
</script>

<template>
  <div>{{ categoryNames[category] }}</div>
</template>
```

### 优化后

```vue
<script setup lang="ts">
import { CATEGORY_NAMES, LIMITS } from '@/constants'
</script>

<template>
  <div>{{ CATEGORY_NAMES[category] }}</div>
</template>
```

**优化效果：**
- 避免重复定义
- 统一管理，易于维护
- 减少代码量

---

## 示例 3：使用工具函数

### 优化前

```vue
<script setup lang="ts">
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
```

### 优化后

```vue
<script setup lang="ts">
import { formatDate } from '@/utils'
</script>
```

**优化效果：**
- 工具函数复用
- 统一格式化逻辑
- 易于测试

---

## 示例 4：使用 useKeyboard

### 优化前

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault()
    closeTab()
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault()
    newTab()
  }
  // ... 更多快捷键
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
```

### 优化后

```vue
<script setup lang="ts">
import { useKeyboard } from '@/composables/useKeyboard'

useKeyboard({
  w: closeTab,
  n: newTab
})
</script>
```

**优化效果：**
- 代码从 20+ 行减少到 5 行
- 自动处理生命周期
- 更清晰的快捷键映射

---

## 示例 5：使用 useDialog

### 优化前

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showDialog = ref(false)
const dialogData = ref<{ id: string; name: string } | null>(null)

const openDialog = (id: string, name: string) => {
  dialogData.value = { id, name }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  setTimeout(() => {
    dialogData.value = null
  }, 300)
}
</script>
```

### 优化后

```vue
<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

const dialog = useDialog<{ id: string; name: string }>()

// 使用
dialog.open({ id: 'xxx', name: 'xxx' })
dialog.close()
</script>
```

**优化效果：**
- 统一对话框管理
- 类型安全
- 减少样板代码

---

## 示例 6：使用 useTheme

### 优化前

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
```

### 优化后

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, initTheme, toggleTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>
```

**优化效果：**
- 主题逻辑集中管理
- 支持系统主题
- 更好的可维护性

---

## 迁移检查清单

在迁移组件时，检查以下项目：

- [ ] 是否使用了全局常量？→ 导入 `@/constants`
- [ ] 是否有插件数据操作？→ 使用 `usePluginData`
- [ ] 是否有键盘快捷键？→ 使用 `useKeyboard`
- [ ] 是否有主题切换？→ 使用 `useTheme`
- [ ] 是否有对话框管理？→ 使用 `useDialog`
- [ ] 是否有插件安装？→ 使用 `usePluginInstaller`
- [ ] 是否有工具函数？→ 导入 `@/utils`
- [ ] 是否有重复的类型定义？→ 导入 `@/types/common`
- [ ] 是否有 localStorage 操作？→ 使用 `useLocalStorage`

---

## 迁移步骤

1. **识别可优化的代码**
   - 查找重复逻辑
   - 查找硬编码的常量
   - 查找可提取的工具函数

2. **选择合适的工具**
   - Composables - 复杂逻辑
   - 常量 - 配置数据
   - 工具函数 - 纯函数

3. **逐步迁移**
   - 一次迁移一个功能
   - 测试确保功能正常
   - 提交代码

4. **清理旧代码**
   - 删除未使用的代码
   - 更新注释
   - 运行 lint 检查

---

## 常见问题

### Q: 什么时候应该创建新的 composable？

A: 当逻辑满足以下条件时：
- 在多个组件中重复使用
- 包含响应式状态
- 有复杂的业务逻辑
- 需要生命周期管理

### Q: 常量应该放在哪里？

A: 根据使用范围：
- 全局使用 → `src/renderer/src/constants/index.ts`
- 模块使用 → 模块内的 `constants.ts`
- 组件使用 → 组件内部

### Q: 如何处理组件特定的逻辑？

A: 保留在组件内部，不要过度抽象。只有在确实需要复用时才提取。

---

**最后更新：** 2026-01-01
