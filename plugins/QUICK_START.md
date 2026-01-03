# 官方插件快速开始指南

## 🚀 创建新插件（超简单！）

### 方法 1: 使用简化脚本（推荐）

```bash
# 一键创建插件
./scripts/create-plugin-simple.sh base64-tool

# 进入插件目录
cd plugins/base64-tool

# 安装依赖
npm install

# 开始开发
npm run dev
```

**就这么简单！** 所有样式、UI 组件、配置都已经准备好了！

### 方法 2: 手动复制模板

```bash
# 复制模板
cp -r plugins/_template plugins/your-plugin-name

# 进入目录
cd plugins/your-plugin-name

# 修改 package.json
# 实现 src/App.vue
# 安装依赖
npm install
```

## 📝 只需修改两个文件

### 1. package.json

修改插件元数据：

```json
{
  "name": "your-plugin-name",
  "description": "你的插件描述",
  "unihub": {
    "id": "com.unihub.your-plugin",
    "name": "插件名称",
    "icon": "SVG path",
    "category": "tool"
  }
}
```

### 2. src/App.vue

实现你的功能：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const input = ref('')
const output = ref('')

const process = () => {
  // 你的逻辑
  output.value = input.value
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- 工具栏 -->
    <div class="h-14 bg-white dark:bg-gray-800 border-b flex items-center px-4 gap-2">
      <Button @click="process">处理</Button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 flex">
      <textarea v-model="input" class="flex-1 p-4" />
      <div class="flex-1 p-4">{{ output }}</div>
    </div>
  </div>
</template>
```

## ✅ 已包含的内容

### 样式系统

- ✅ 完整的 CSS 变量（与主应用一致）
- ✅ 深色模式支持
- ✅ Tailwind CSS 配置
- ✅ 响应式布局

### UI 组件

- ✅ Button - 按钮组件（支持多种变体）
- ✅ Label - 标签组件
- ✅ Input - 输入框组件

### 构建配置

- ✅ Vite 配置
- ✅ TypeScript 配置
- ✅ 打包脚本

## 🎨 可用的 UI 组件

### Button 按钮

```vue
<Button>默认按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button size="sm">小按钮</Button>
```

### Label 标签

```vue
<Label>标签文字</Label>
<Label class="whitespace-nowrap">不换行标签</Label>
```

### Input 输入框

```vue
<Input v-model="value" placeholder="请输入..." />
<Input type="text" class="w-24" />
```

## 🎨 可用的样式类

### 颜色

- `bg-primary` / `text-primary-foreground` - 主色
- `bg-secondary` / `text-secondary-foreground` - 次要色
- `bg-accent` / `text-accent-foreground` - 强调色
- `border-border` - 边框色
- `bg-background` / `text-foreground` - 背景/前景色

### 布局

- `flex-1` - 占满剩余空间
- `min-h-0` - 最小高度为 0（解决 flex 溢出）
- `overflow-hidden` / `overflow-auto` - 溢出控制

### 深色模式

- `dark:bg-gray-800` - 深色模式背景
- `dark:text-gray-100` - 深色模式文字
- 所有颜色变量自动支持深色模式

## 🔧 开发流程

```bash
# 1. 创建插件
./scripts/create-plugin-simple.sh my-tool

# 2. 进入目录
cd plugins/my-tool

# 3. 修改 package.json 和 src/App.vue

# 4. 安装依赖
npm install

# 5. 开发模式（热重载）
npm run dev

# 6. 构建
npm run build

# 7. 打包
npm run package

# 8. 测试安装
# 在 UniHub 中选择"从本地安装"，选择 plugin.zip
```

## 📦 构建和发布

```bash
# 构建
npm run build

# 打包
npm run package

# 查看打包内容
unzip -l plugin.zip

# 上传到 GitHub Release 或 CDN
# 更新 marketplace/plugins.json
```

## 🐛 常见问题

### Q: UI 没有撑满窗口？

A: 已经在模板中修复，直接使用即可。

### Q: 深色模式样式不对？

A: 已经在模板中配置好 CSS 变量，自动支持。

### Q: 按钮颜色不一致？

A: 使用 `bg-primary` 等变量类，不要硬编码颜色。

### Q: 卸载后还有缓存？

A: 已添加缓存清理逻辑，卸载后会自动清理。

## 📚 参考示例

查看 `plugins/jwt-tool/` 作为完整示例：

- 完整的功能实现
- 正确的样式使用
- 标准的代码结构

## 💡 最佳实践

1. **使用 CSS 变量** - 不要硬编码颜色
2. **使用 flexbox** - 确保布局正确
3. **添加 whitespace-nowrap** - 防止标签换行
4. **测试深色模式** - 确保所有元素可见
5. **保持简洁** - 只实现必要的功能

## 🎉 就是这么简单！

有了模板，创建新插件只需要：

1. 运行一个命令
2. 修改两个文件
3. 实现你的功能

所有样式、配置、UI 组件都已经准备好了！
