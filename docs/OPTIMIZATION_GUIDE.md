# 项目优化指南

## 📋 优化概览

本文档记录了 UniHub 项目的整体优化方案和最佳实践。

## 🎯 优化目标

1. **提高代码可维护性** - 减少重复代码，提高代码复用性
2. **改善性能** - 优化渲染性能和内存使用
3. **增强类型安全** - 完善 TypeScript 类型定义
4. **统一代码风格** - 建立一致的编码规范

## 📁 项目结构优化

### 常量管理策略

**分层管理原则：**
- **全局常量** → `src/constants/index.ts` - 跨组件、跨模块共享
- **模块常量** → 各模块内的 `constants.ts` - 模块特定配置
- **组件常量** → 组件内部 - 仅该组件使用的配置

```typescript
// ✅ 好的做法 - 全局常量
// src/constants/index.ts
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed'
} as const

// ✅ 好的做法 - 组件内常量
// Component.vue
const MAX_ITEMS = 10 // 仅此组件使用
```

### 目录结构

```
src/
├── constants/          # 全局常量
│   └── index.ts
├── types/             # 类型定义
│   ├── common.ts
│   └── plugin.ts
├── utils/             # 工具函数
│   └── index.ts
├── composables/       # Vue 组合式函数
│   ├── usePluginData.ts
│   ├── useKeyboard.ts
│   └── useLocalStorage.ts
├── main/              # 主进程
│   ├── constants.ts
│   └── utils/
└── renderer/          # 渲染进程
    └── src/
```

## 🔧 核心优化

### 1. 使用 Composables 提取逻辑

**优化前：**
```typescript
// 在组件中直接写逻辑
const recentPlugins = ref<string[]>([])
const loadRecents = async () => {
  const data = await window.api.db.getRecents(10)
  recentPlugins.value = data.map(r => r.pluginId)
}
```

**优化后：**
```typescript
// 使用 composable
import { usePluginData } from '@/composables/usePluginData'

const { recentPlugins, loadAll } = usePluginData()
```

### 2. 统一类型定义

**优化前：**
```typescript
// 每个文件重复定义
interface Tab {
  id: string
  type: 'plugin' | 'management'
}
```

**优化后：**
```typescript
// 统一在 types/common.ts
import type { Tab, TabType } from '@/types/common'
```

### 3. 提取重复逻辑

**优化前：**
```typescript
// 5 个函数有相同的模式
const openSettings = () => {
  const existing = tabs.value.find(t => t.type === 'settings')
  if (existing) {
    activeTabId.value = existing.id
    return
  }
  const newTab = { id: Date.now().toString(), ... }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
}
```

**优化后：**
```typescript
// 通用函数
const createOrActivateTab = (type, pluginId, title, matcher?) => {
  // 统一逻辑
}

const openSettings = () => createOrActivateTab('settings', 'settings', '设置')
```

### 4. 键盘快捷键优化

**优化前：**
```typescript
// 多个 if 语句
if ((e.metaKey || e.ctrlKey) && e.key === 'w') { ... }
if ((e.metaKey || e.ctrlKey) && e.key === 'n') { ... }
```

**优化后：**
```typescript
// 使用 composable 和对象映射
useKeyboard({
  w: () => closeTab(),
  n: () => addHomeTab(),
  b: () => toggleSidebar()
}, shouldHandle)
```

### 5. LocalStorage 封装

**优化前：**
```typescript
const theme = localStorage.getItem('theme')
localStorage.setItem('theme', 'dark')
```

**优化后：**
```typescript
import { useLocalStorage } from '@/composables/useLocalStorage'

const theme = useLocalStorage('theme', 'light')
// 自动同步到 localStorage
```

## 🚀 性能优化

### 1. 计算属性缓存

```typescript
// ✅ 使用 computed 缓存
const filteredPlugins = computed(() => {
  return plugins.value.filter(p => p.enabled)
})
```

### 2. 避免不必要的响应式

```typescript
// ❌ 不好
const config = ref({ a: 1, b: 2, c: 3 })

// ✅ 好 - 不需要响应式的用普通对象
const config = { a: 1, b: 2, c: 3 }
```

### 3. 使用 v-show 代替 v-if

```typescript
// 频繁切换的内容
<div v-show="activeTab === 'settings'">...</div>
```

### 4. 列表渲染优化

```typescript
// ✅ 使用 key
<div v-for="item in items" :key="item.id">

// ✅ 使用 for...of 代替 forEach
for (const item of items) { ... }
```

## 📝 编码规范

### 命名约定

- **常量** - 大写下划线：`STORAGE_KEYS`
- **函数** - 驼峰命名：`loadPluginData`
- **组件** - 帕斯卡命名：`HomePage`
- **类型** - 帕斯卡命名：`TabType`

### 函数组织

```typescript
// 1. 导入
import { ref } from 'vue'

// 2. 类型定义
type TabType = 'plugin' | 'settings'

// 3. 常量
const MAX_TABS = 10

// 4. 响应式状态
const tabs = ref<Tab[]>([])

// 5. 计算属性
const activeTabs = computed(() => ...)

// 6. 方法
const openTab = () => { ... }

// 7. 生命周期
onMounted(() => { ... })
```

### 错误处理

```typescript
// ✅ 统一错误处理
try {
  await someAsyncOperation()
} catch (error) {
  console.error('操作失败:', error)
  toast.error(error instanceof Error ? error.message : '未知错误')
}
```

## 🔍 代码审查清单

- [ ] 是否有重复代码可以提取？
- [ ] 常量是否放在合适的位置？
- [ ] 类型定义是否完整？
- [ ] 是否使用了合适的 composable？
- [ ] 性能是否有优化空间？
- [ ] 错误处理是否完善？
- [ ] 代码是否符合命名规范？

## 📚 相关资源

- [Vue 3 组合式 API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Electron 性能优化](https://www.electronjs.org/docs/latest/tutorial/performance)

## 🎓 最佳实践示例

### 示例 1：插件数据管理

```typescript
// ❌ 优化前 - 分散在各个组件
const recentPlugins = ref<string[]>([])
const loadRecents = async () => { ... }

// ✅ 优化后 - 统一管理
import { usePluginData } from '@/composables/usePluginData'
const { recentPlugins, loadAll } = usePluginData()
```

### 示例 2：常量管理

```typescript
// ❌ 优化前 - 硬编码
localStorage.getItem('theme')
localStorage.getItem('sidebarCollapsed')

// ✅ 优化后 - 使用常量
import { STORAGE_KEYS } from '@/constants'
localStorage.getItem(STORAGE_KEYS.THEME)
```

### 示例 3：类型安全

```typescript
// ❌ 优化前 - 字符串字面量
type: 'plugin' | 'management' | 'settings'

// ✅ 优化后 - 导入类型
import type { TabType } from '@/types/common'
type: TabType
```

## 🔄 持续优化

优化是一个持续的过程，建议：

1. **定期代码审查** - 每周检查新代码
2. **性能监控** - 使用 Vue DevTools 监控性能
3. **重构计划** - 逐步优化旧代码
4. **文档更新** - 及时更新优化文档

---

**最后更新：** 2026-01-01
