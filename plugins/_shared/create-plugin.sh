#!/bin/bash

# 创建新的官方插件脚本
# 用法: ./create-plugin.sh <plugin-name>

if [ -z "$1" ]; then
  echo "❌ 请提供插件名称"
  echo "用法: ./create-plugin.sh <plugin-name>"
  exit 1
fi

PLUGIN_NAME=$1
PLUGIN_DIR="../$PLUGIN_NAME"

if [ -d "$PLUGIN_DIR" ]; then
  echo "❌ 插件目录已存在: $PLUGIN_DIR"
  exit 1
fi

echo "📦 创建新插件: $PLUGIN_NAME"

# 创建目录结构
mkdir -p "$PLUGIN_DIR/src"

# 创建 package.json
cat > "$PLUGIN_DIR/package.json" << 'EOF'
{
  "name": "PLUGIN_NAME",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "UniHub Team",
    "email": "team@unihub.dev",
    "url": "https://github.com/unihub"
  },
  "keywords": ["tool"],
  "type": "module",
  "scripts": {
    "dev": "vite --config ../_shared/vite.config.ts",
    "build": "vite build --config ../_shared/vite.config.ts",
    "package": "node ../_shared/scripts/package.js"
  },
  "unihub": {
    "id": "com.unihub.PLUGIN_ID",
    "name": "插件名称",
    "icon": "🔧",
    "category": "tool",
    "permissions": ["clipboard"],
    "entry": "dist/index.html"
  },
  "dependencies": {
    "lucide-vue-next": "^0.562.0",
    "vue": "^3.5.13",
    "vue-sonner": "^2.0.9"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "@vitejs/plugin-vue": "^5.2.1",
    "@vueuse/core": "^14.1.0",
    "tailwindcss": "^4.1.18",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.7.3",
    "vite": "^6.0.3"
  }
}
EOF

# 替换占位符
sed -i '' "s/PLUGIN_NAME/$PLUGIN_NAME/g" "$PLUGIN_DIR/package.json"
sed -i '' "s/PLUGIN_ID/${PLUGIN_NAME//-/_}/g" "$PLUGIN_DIR/package.json"

# 创建 index.html
cat > "$PLUGIN_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>插件</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF

# 创建 src/main.ts
cat > "$PLUGIN_DIR/src/main.ts" << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
EOF

# 创建 src/App.vue
cat > "$PLUGIN_DIR/src/App.vue" << 'EOF'
<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">新插件</h1>
      <p class="text-muted-foreground">开始构建你的插件...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 插件逻辑
</script>
EOF

# 创建 src/style.css
cat > "$PLUGIN_DIR/src/style.css" << 'EOF'
@import 'tailwindcss';
EOF

# 创建 .gitignore
cat > "$PLUGIN_DIR/.gitignore" << 'EOF'
node_modules
dist
*.zip
*.log
.DS_Store
EOF

# 创建 README.md
cat > "$PLUGIN_DIR/README.md" << EOF
# $PLUGIN_NAME

插件描述

## 功能

- 功能 1
- 功能 2

## 开发

\`\`\`bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# 打包
pnpm package
\`\`\`
EOF

echo "✅ 插件创建成功: $PLUGIN_DIR"
echo ""
echo "📁 插件目录结构:"
echo "  $PLUGIN_NAME/"
echo "    ├── src/"
echo "    │   ├── App.vue"
echo "    │   ├── main.ts"
echo "    │   └── style.css"
echo "    ├── index.html"
echo "    ├── package.json"
echo "    ├── .gitignore"
echo "    └── README.md"
echo ""
echo "✨ 配置文件已共享 (无需创建):"
echo "  - tsconfig.json (使用 ../_shared/tsconfig.json)"
echo "  - tsconfig.node.json (使用 ../_shared/tsconfig.node.json)"
echo "  - vite.config.ts (使用 ../_shared/vite.config.ts)"
echo "  - scripts/package.js (使用 ../_shared/scripts/package.js)"
echo ""
echo "下一步:"
echo "1. cd $PLUGIN_DIR"
echo "2. pnpm install"
echo "3. pnpm dev"

