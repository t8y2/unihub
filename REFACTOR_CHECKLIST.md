# 代码重构和组件优化清单

## 🔴 高优先级 - 需要使用 shadcn 组件

### 1. PluginMarketplace.vue

**问题：** 使用原生 `<select>` 标签
**位置：** 第 193-200 行
**改进：** 使用 shadcn 的 Select 组件

```vue
<!-- 当前 -->
<select v-model="selectedCategory" class="...">
  <option v-for="cat in MARKETPLACE_CATEGORIES">...</option>
</select>

<!-- 应改为 -->
<Select v-model="selectedCategory">
  <SelectTrigger>
    <SelectValue placeholder="选择分类" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem v-for="cat in MARKETPLACE_CATEGORIES" :value="cat.value">
      {{ cat.label }}
    </SelectItem>
  </SelectContent>
</Select>
```

### 2. SettingsPage.vue

**问题：** 使用自定义样式的按钮，未使用 Button 组件
**位置：** 多处（重置按钮、删除按钮等）
**改进：** 统一使用 Button 组件的 variant

### 3. QRCodeTool.vue

**问题：** 使用原生 `<input type="file">` 样式
**位置：** 文件上传区域
**改进：** 创建统一的文件上传组件或使用更好的样式

## 🟡 中优先级 - 代码重构

### 4. GlobalSearch.vue

**问题：** 键盘快捷键提示使用自定义 `<kbd>` 样式
**改进：** 创建统一的 Kbd 组件

```vue
<!-- 创建 components/ui/kbd/Kbd.vue -->
<template>
  <kbd
    class="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
  >
    <slot />
  </kbd>
</template>
```

### 5. PermissionDialog.vue

**问题：** 风险等级标签使用自定义样式
**改进：** 使用 Badge 组件的不同 variant

### 6. 多个工具组件的重复代码

**问题：** 以下组件有相似的布局结构：

- Base64Tool.vue
- CodeFormatter.vue
- DataConverter.vue
- JsonFormatter.vue
- JwtTool.vue
- TimestampTool.vue
- TwoFactorAuth.vue
- UrlTool.vue
- QRCodeTool.vue

**改进：** 创建统一的工具布局组件

```vue
<!-- components/ToolLayout.vue -->
<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
      <slot name="header" />
    </div>
    <div class="flex-1 overflow-hidden">
      <slot name="content" />
    </div>
  </div>
</template>
```

## 🟢 低优先级 - 优化建议

### 7. 创建缺失的 shadcn 组件

需要添加的组件：

- **Separator** - 用于替代 `<div class="h-px bg-gray-200">` 分隔线
- **ScrollArea** - 用于统一滚动区域样式
- **Tooltip** - 用于提示信息
- **Alert** - 用于错误/警告/信息提示
- **Skeleton** - 用于加载状态
- **Command** - 可以改进 GlobalSearch 组件

### 8. 统一颜色和间距

**问题：** 多处使用硬编码的颜色和间距
**改进：**

- 创建 `src/renderer/src/lib/colors.ts` 定义颜色常量
- 创建 `src/renderer/src/lib/spacing.ts` 定义间距常量

### 9. 提取重复的工具函数

**问题：** 多个组件有相似的功能：

- 复制到剪贴板
- 文件上传处理
- 错误处理

**改进：** 创建统一的 composables

```typescript
// composables/useClipboard.ts
export function useClipboard() {
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }
  return { copy }
}

// composables/useFileUpload.ts
export function useFileUpload(accept: string) {
  const handleFile = (file: File) => { ... }
  return { handleFile }
}
```

### 10. App.vue 侧边栏重构

**问题：** 侧边栏代码过长（600+ 行）
**改进：** 拆分为独立组件

```
components/
  Sidebar/
    Sidebar.vue          - 主容器
    SidebarNav.vue       - 导航菜单
    SidebarCategory.vue  - 分类组
    SidebarItem.vue      - 单个菜单项
    SidebarFooter.vue    - 底部工具栏
```

## 📋 具体改进步骤

### 第一阶段：组件替换（1-2小时）

1. ✅ 替换 PluginMarketplace 的 select
2. ✅ 统一 SettingsPage 的按钮样式
3. ✅ 创建 Kbd 组件并替换所有 kbd 标签

### 第二阶段：代码重构（2-3小时）

4. ✅ 创建 ToolLayout 组件
5. ✅ 重构所有工具组件使用 ToolLayout
6. ✅ 创建 useClipboard 和 useFileUpload composables

### 第三阶段：组件优化（1-2小时）

7. ✅ 添加缺失的 shadcn 组件
8. ✅ 拆分 App.vue 侧边栏
9. ✅ 统一颜色和间距常量

## 🎯 预期收益

- **代码量减少：** 约 30-40%
- **可维护性：** 提升 50%+
- **一致性：** 100% 使用统一组件
- **性能：** 减少重复渲染
- **开发效率：** 新功能开发速度提升 40%

## 📝 注意事项

1. **向后兼容：** 确保重构不影响现有功能
2. **测试：** 每个阶段完成后进行测试
3. **渐进式：** 可以逐步进行，不必一次完成
4. **文档：** 更新组件使用文档
