# 快速参考

## 🚀 常用 Composables

### usePluginData
```typescript
import { usePluginData } from '@/composables/usePluginData'

const { 
  recentPlugins,      // 最近访问列表
  favoritePlugins,    // 收藏列表
  loadAll,            // 加载所有数据
  addRecent,          // 添加最近访问
  toggleFavorite,     // 切换收藏
  isFavorite          // 检查是否收藏
} = usePluginData()
```

### useKeyboard
```typescript
import { useKeyboard } from '@/composables/useKeyboard'

useKeyboard({
  w: () => closeTab(),
  n: () => newTab(),
  k: () => openSearch()
}, shouldHandle) // 可选的条件函数
```

### useTheme
```typescript
import { useTheme } from '@/composables/useTheme'

const { 
  isDark,           // 是否暗色主题
  initTheme,        // 初始化主题
  toggleTheme,      // 切换主题
  setTheme          // 设置主题
} = useTheme()
```

### useLocalStorage
```typescript
import { useLocalStorage } from '@/composables/useLocalStorage'

// 自动序列化和响应式
const settings = useLocalStorage('settings', { theme: 'light' })
settings.value.theme = 'dark' // 自动保存
```

### useDialog
```typescript
import { useDialog } from '@/composables/useDialog'

const dialog = useDialog<{ id: string; name: string }>()

dialog.open({ id: '1', name: 'Test' })
dialog.close()
```

### usePluginInstaller
```typescript
import { usePluginInstaller } from '@/composables/usePluginInstaller'

const { 
  installing,         // 安装状态
  installFromUrl,     // 从 URL 安装
  installFromFile,    // 从文件安装
  uninstall,          // 卸载
  reload              // 重新加载
} = usePluginInstaller()
```

---

## 📦 常用常量

### 存储键
```typescript
import { STORAGE_KEYS } from '@/constants'

STORAGE_KEYS.THEME              // 'theme'
STORAGE_KEYS.SIDEBAR_COLLAPSED  // 'sidebarCollapsed'
STORAGE_KEYS.LANGUAGE           // 'language'
```

### 分类名称
```typescript
import { CATEGORY_NAMES } from '@/constants'

CATEGORY_NAMES.formatter  // '格式化'
CATEGORY_NAMES.tool       // '工具'
CATEGORY_NAMES.encoder    // '编码'
CATEGORY_NAMES.custom     // '自定义'
```

### 限制配置
```typescript
import { LIMITS } from '@/constants'

LIMITS.RECENT_PLUGINS      // 10
LIMITS.FAVORITE_DISPLAY    // 6
LIMITS.SEARCH_CACHE_SIZE   // 50
LIMITS.MAX_CACHED_VIEWS    // 5
```

### UI 尺寸
```typescript
import { UI_SIZES } from '@/constants'

UI_SIZES.SIDEBAR_WIDTH      // 208
UI_SIZES.TITLE_BAR_HEIGHT   // 36
```

### 来源标签
```typescript
import { SOURCE_LABELS } from '@/constants'

SOURCE_LABELS.official  // '官方'
SOURCE_LABELS.url       // '第三方'
SOURCE_LABELS.local     // '本地'
```

---

## 🛠️ 常用工具函数

### 日期格式化
```typescript
import { formatDate } from '@/utils'

formatDate('2026-01-01')  // '2026/01/01 00:00'
formatDate(new Date())    // '2026/01/01 12:30'
```

### 防抖和节流
```typescript
import { debounce, throttle } from '@/utils'

const debouncedSearch = debounce(search, 300)
const throttledScroll = throttle(handleScroll, 100)
```

### 深度克隆
```typescript
import { deepClone } from '@/utils'

const cloned = deepClone(original)
```

### 生成 ID
```typescript
import { generateId } from '@/utils'

const id = generateId()  // '1735689600000-abc123def'
```

### 安全 JSON 解析
```typescript
import { safeJsonParse } from '@/utils'

const data = safeJsonParse(jsonString, { default: 'value' })
```

### 平台检测
```typescript
import { isMac, getModifierKey } from '@/utils'

if (isMac()) {
  console.log('Running on Mac')
}

const key = getModifierKey()  // 'Cmd' on Mac, 'Ctrl' on others
```

---

## 📘 类型定义

### 标签类型
```typescript
import type { Tab, TabType } from '@/types/common'

type TabType = 'plugin' | 'management' | 'settings' | 'favorites' | 'recents'

interface Tab {
  id: string
  pluginId: string
  title: string
  type: TabType
}
```

### 操作结果
```typescript
import type { OperationResult } from '@/types/common'

interface OperationResult<T = any> {
  success: boolean
  message?: string
  data?: T
}
```

---

## 🎨 代码片段

### 创建新组件
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CATEGORY_NAMES } from '@/constants'
import { formatDate } from '@/utils'

// Props
const props = defineProps<{
  data: string[]
}>()

// Emits
const emit = defineEmits<{
  update: [value: string]
}>()

// State
const loading = ref(false)

// Computed
const filteredData = computed(() => {
  return props.data.filter(item => item.length > 0)
})

// Methods
const handleUpdate = (value: string): void => {
  emit('update', value)
}

// Lifecycle
onMounted(() => {
  // 初始化
})
</script>

<template>
  <div>
    <!-- 内容 -->
  </div>
</template>
```

### 使用插件数据
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { usePluginData } from '@/composables/usePluginData'

const { recentPlugins, favoritePlugins, loadAll, toggleFavorite } = usePluginData()

onMounted(() => {
  loadAll()
})
</script>

<template>
  <div>
    <div v-for="id in recentPlugins" :key="id">
      {{ id }}
      <button @click="toggleFavorite(id)">收藏</button>
    </div>
  </div>
</template>
```

### 添加快捷键
```vue
<script setup lang="ts">
import { useKeyboard } from '@/composables/useKeyboard'

const handleSave = () => console.log('Save')
const handleClose = () => console.log('Close')

useKeyboard({
  s: handleSave,
  w: handleClose
})
</script>
```

---

## 🔍 调试技巧

### Vue DevTools
```typescript
// 在组件中添加调试信息
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
console.log('Component:', instance?.type.name)
```

### 性能监控
```typescript
// 测量函数执行时间
console.time('operation')
await someOperation()
console.timeEnd('operation')
```

### 响应式调试
```typescript
import { watch } from 'vue'

watch(
  () => someRef.value,
  (newVal, oldVal) => {
    console.log('Changed:', oldVal, '->', newVal)
  },
  { deep: true }
)
```

---

## 📚 更多资源

- [优化指南](./OPTIMIZATION_GUIDE.md)
- [迁移示例](./COMPONENT_MIGRATION_EXAMPLE.md)
- [迁移总结](./MIGRATION_SUMMARY.md)

---

**最后更新：** 2026-01-01
