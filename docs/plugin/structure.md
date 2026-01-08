# 插件结构

本文档介绍 UniHub 插件的文件结构和组织方式。

## 基本结构

一个最简单的插件只需要两个文件：

```
my-plugin/
├── package.json     # 必需：插件配置
└── index.html       # 必需：插件入口
```

## 推荐结构

对于更复杂的插件，推荐以下结构：

```
my-plugin/
├── package.json        # 插件配置
├── index.html          # 插件入口
├── assets/             # 静态资源
│   ├── icon.svg        # 插件图标
│   ├── style.css       # 样式文件
│   └── images/         # 图片资源
├── js/                 # JavaScript 文件
│   ├── main.js         # 主脚本
│   └── utils.js        # 工具函数
└── README.md           # 插件说明
```

## 使用构建工具

对于使用 Vite、Webpack 等构建工具的项目：

```
my-plugin/
├── src/                # 源代码
│   ├── main.ts         # 入口文件
│   ├── App.vue         # Vue 组件
│   ├── components/     # 组件目录
│   └── styles/         # 样式目录
├── public/             # 静态资源
├── dist/               # 构建输出（打包时使用）
├── package.json        # 项目配置（包含 unihub 字段）
├── vite.config.ts      # Vite 配置
└── tsconfig.json       # TypeScript 配置
```

### Vite 配置示例

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // 使用相对路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源内联或使用相对路径
    assetsInlineLimit: 4096
  }
})
```

## 文件说明

### package.json

插件配置文件，包含插件的元信息和配置。详见 [插件配置](/plugin/config)。

### index.html

插件的入口 HTML 文件。UniHub 会在 WebContentsView 中加载这个文件。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>插件名称</title>
    <!-- 样式文件 -->
    <link rel="stylesheet" href="./assets/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <!-- 脚本文件 -->
    <script type="module" src="./js/main.js"></script>
  </body>
</html>
```

### 静态资源

- 图片、字体等资源放在 `assets` 目录
- 使用相对路径引用资源
- 避免使用绝对路径

## 打包要求

发布插件时，需要将所有文件打包为 ZIP：

```bash
# 如果使用构建工具，先构建
pnpm build

# 打包 dist 目录（确保 package.json 在根目录）
cd dist
zip -r ../my-plugin.zip .
```

ZIP 包的根目录应该直接包含 `package.json`：

```
my-plugin.zip
├── package.json     # 在根目录
├── index.html
└── assets/
    └── ...
```

::: warning 注意
不要将 `node_modules` 或源代码打包进 ZIP。只打包构建后的文件。
:::

## 最佳实践

1. **使用相对路径**: 所有资源引用使用相对路径
2. **压缩资源**: 生产构建时压缩 JS/CSS
3. **图片优化**: 使用适当的图片格式和尺寸
4. **代码分割**: 大型插件考虑代码分割
5. **缓存友好**: 使用内容哈希命名文件
