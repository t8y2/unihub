# 插件更新日志

## 2025-01-03 - Vue Sonner 集成

### ✨ 新功能

#### JWT 工具插件 (`plugins/jwt-tool/`)

**替换错误提示为 Vue Sonner**

- ✅ 移除底部错误提示栏
- ✅ 使用 vue-sonner 显示所有通知
- ✅ 更好的用户体验和视觉效果

**通知类型：**

1. **成功通知** ✅
   - 解码成功
   - 验证成功（显示 "Token 签名有效"）
   - 生成成功（显示使用的算法）
   - 复制成功

2. **警告通知** ⚠️
   - 请输入 JWT Token
   - 请输入密钥
   - 请输入 Payload

3. **错误通知** ❌
   - 解码失败（显示错误详情）
   - 验证失败（显示错误详情）
   - 编码失败（显示错误详情）
   - 复制失败（显示错误详情）

4. **信息通知** ℹ️
   - 已清空

**改进点：**

- 🎯 通知自动消失（3秒）
- 🎨 使用丰富的颜色（rich-colors）
- 📍 顶部居中显示
- 💬 错误信息显示在描述中，更清晰
- 🚀 不占用界面空间
- ✨ 动画流畅

### 📦 构建结果

**JWT 工具插件：**

- 包大小: **59 KB** (之前: 49 KB)
- CSS: 33.22 KB (包含 vue-sonner 样式)
- JS: 144.84 KB (包含 vue-sonner 逻辑)

**插件模板：**

- 包大小: **40 KB** (之前: 29 KB)
- 包含 vue-sonner 示例代码

### 🔧 技术细节

**新增依赖：**

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

**CSS 更新：**

```css
@import 'tailwindcss';
@plugin "tailwindcss-animate";
@import 'tw-animate-css';

/* ... */

/* 导入 vue-sonner 样式 */
@import 'vue-sonner/style.css';

/* 添加 cursor-pointer 支持 */
@layer base {
  button {
    cursor: pointer;
  }
}
```

**代码示例：**

```typescript
// 之前
error.value = '请输入 JWT Token'

// 现在
toast.warning('请输入 JWT Token')
```

```typescript
// 之前
error.value = `解码失败: ${e.message}`

// 现在
toast.error('解码失败', {
  description: e.message
})
```

### 🎯 用户体验提升

**之前：**

- ❌ 错误提示占用底部空间
- ❌ 需要手动关闭
- ❌ 只能显示一个错误
- ❌ 样式单一

**现在：**

- ✅ 通知浮动显示，不占空间
- ✅ 自动消失
- ✅ 可以显示多个通知
- ✅ 支持多种类型和颜色
- ✅ 动画流畅
- ✅ 显示详细的错误信息

### 📝 使用示例

```vue
<script setup lang="ts">
import { toast, Toaster } from 'vue-sonner'

// 成功
toast.success('操作成功')

// 带描述
toast.success('验证成功', {
  description: 'Token 签名有效'
})

// 错误
toast.error('操作失败', {
  description: error.message
})

// 警告
toast.warning('请输入内容')

// 信息
toast.info('已清空')
</script>

<template>
  <Toaster position="top-center" :duration="3000" rich-colors />
  <!-- 你的组件 -->
</template>
```

### 🚀 下一步

所有新插件都应该使用 vue-sonner 来显示通知，而不是自定义的错误提示栏。

参考文档：

- [Vue Sonner 使用指南](./VUE_SONNER_GUIDE.md)
- [Tailwind v4 迁移指南](./TAILWIND_V4_MIGRATION.md)

---

## 2025-01-03 - Tailwind CSS v4 迁移

### ✨ 主要变化

- 升级到 Tailwind CSS v4
- 移除 PostCSS 和 autoprefixer
- 使用 OKLCH 颜色空间
- 添加 tw-animate-css 支持
- 添加 cursor-pointer 支持

详见：[Tailwind v4 迁移指南](./TAILWIND_V4_MIGRATION.md)
