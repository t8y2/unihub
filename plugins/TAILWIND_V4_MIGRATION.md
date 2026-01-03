# Tailwind CSS v4 迁移指南

本文档说明如何将插件从 Tailwind CSS v3 迁移到 v4。

## ✅ 已完成迁移

- `plugins/_template/` - 插件模板
- `plugins/jwt-tool/` - JWT 工具插件

## 🔄 主要变化

### 1. 依赖更新

**移除的依赖：**

- `autoprefixer` - v4 不再需要
- `postcss` - v4 不再需要

**新增的依赖：**

- `@tailwindcss/vite` - Vite 插件
- `tailwindcss-animate` - 动画插件

**package.json 变化：**

```diff
  "devDependencies": {
+   "@tailwindcss/vite": "^4.1.18",
    "@vitejs/plugin-vue": "^5.2.1",
    "archiver": "^7.0.1",
-   "autoprefixer": "^10.4.23",
-   "postcss": "^8.5.6",
-   "tailwindcss": "^3.4.19",
+   "tailwindcss": "^4.1.18",
+   "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.7.3",
    "vite": "^6.0.3"
  }
```

### 2. Vite 配置更新

**vite.config.ts 变化：**

```diff
  import { defineConfig } from 'vite'
  import vue from '@vitejs/plugin-vue'
+ import tailwindcss from '@tailwindcss/vite'
  import path from 'path'

  export default defineConfig({
-   plugins: [vue()],
+   plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  })
```

### 3. CSS 文件更新

**style.css 主要变化：**

#### 导入方式

```diff
- @tailwind base;
- @tailwind components;
- @tailwind utilities;
+ @import 'tailwindcss';
+
+ @plugin "tailwindcss-animate";
+
+ @custom-variant dark (&:is(.dark *));
```

#### 颜色系统

从 HSL 迁移到 OKLCH：

```diff
  :root {
    --radius: 0.5rem;
-   --background: 0 0% 100%;
-   --foreground: 0 0% 3.9%;
+   --background: oklch(1 0 0);
+   --foreground: oklch(0.145 0 0);
    /* ... 其他颜色 */
  }
```

#### 主题配置

使用 `@theme inline` 定义颜色映射：

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  /* ... 其他颜色映射 */
}
```

### 4. 删除的配置文件

以下文件在 v4 中不再需要：

- ❌ `tailwind.config.js` - 配置现在在 CSS 中
- ❌ `postcss.config.js` - v4 不再使用 PostCSS

## 📋 迁移步骤

### 步骤 1: 更新依赖

```bash
cd plugins/your-plugin
pnpm remove autoprefixer postcss
pnpm add -D @tailwindcss/vite tailwindcss@^4.1.18 tailwindcss-animate
```

### 步骤 2: 更新 Vite 配置

在 `vite.config.ts` 中添加 Tailwind 插件：

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()]
  // ... 其他配置
})
```

### 步骤 3: 更新 CSS 文件

将 `src/style.css` 中的内容替换为 v4 语法（参考 `plugins/_template/src/style.css`）。

### 步骤 4: 删除配置文件

```bash
rm tailwind.config.js postcss.config.js
```

### 步骤 5: 测试

```bash
pnpm install
pnpm run dev
pnpm run build
```

## 🎨 颜色转换参考

### HSL 到 OKLCH 转换表

| HSL 值          | OKLCH 值                    | 说明           |
| --------------- | --------------------------- | -------------- |
| `0 0% 100%`     | `oklch(1 0 0)`              | 白色           |
| `0 0% 98%`      | `oklch(0.985 0 0)`          | 接近白色       |
| `0 0% 96.1%`    | `oklch(0.97 0 0)`           | 浅灰           |
| `0 0% 89.8%`    | `oklch(0.922 0 0)`          | 边框灰         |
| `0 0% 63.9%`    | `oklch(0.708 0 0)`          | 中灰           |
| `0 0% 45.1%`    | `oklch(0.556 0 0)`          | 静音灰         |
| `0 0% 14.9%`    | `oklch(0.269 0 0)`          | 深灰           |
| `0 0% 9%`       | `oklch(0.205 0 0)`          | 主色深         |
| `0 0% 3.9%`     | `oklch(0.145 0 0)`          | 接近黑色       |
| `0 84.2% 60.2%` | `oklch(0.577 0.245 27.325)` | 红色（破坏性） |
| `0 62.8% 30.6%` | `oklch(0.704 0.191 22.216)` | 深红色         |

## 🔧 常见问题

### Q: 为什么要迁移到 v4？

A: Tailwind CSS v4 带来了：

- 更快的构建速度
- 更小的包体积
- 更好的性能
- 原生 CSS 支持
- 不再需要 PostCSS

### Q: v4 兼容 v3 的类名吗？

A: 是的，所有 v3 的类名在 v4 中都可以正常使用。

### Q: 需要更新组件代码吗？

A: 不需要。只需要更新配置文件和 CSS 文件，组件代码无需修改。

### Q: 如何处理自定义插件？

A: 使用 `@plugin` 指令在 CSS 中引入插件：

```css
@plugin "tailwindcss-animate";
@plugin "./my-custom-plugin.js";
```

### Q: 深色模式还能用吗？

A: 可以。使用 `@custom-variant` 定义深色模式：

```css
@custom-variant dark (&:is(.dark *));
```

## 📚 参考资源

- [Tailwind CSS v4 官方文档](https://tailwindcss.com/docs/v4-beta)
- [Tailwind CSS v4 迁移指南](https://tailwindcss.com/docs/upgrade-guide)
- [OKLCH 颜色空间](https://oklch.com/)

## ✨ 优势总结

迁移到 v4 后，你将获得：

1. **更快的开发体验** - 构建速度提升 10 倍
2. **更简洁的配置** - 不再需要多个配置文件
3. **更好的颜色系统** - OKLCH 提供更准确的颜色
4. **原生 CSS 支持** - 更符合 Web 标准
5. **更小的包体积** - 减少依赖和构建产物

## 🚀 下一步

如果你有其他插件需要迁移，可以参考本指南进行迁移。如有问题，请查看：

- `plugins/_template/` - 最新的插件模板
- `plugins/jwt-tool/` - 已迁移的示例插件
