# UniHub 快速开始指南

## 🚀 5 分钟上手

### 1. 启动应用

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev
```

### 2. 使用全局搜索

1. 按 `⌘K` (Mac) 或 `Ctrl+K` (Windows/Linux)
2. 输入关键词搜索插件
3. 按 `Enter` 打开插件

![全局搜索](../screenshots/global-search.png)

### 3. 创建你的第一个插件

```bash
# 使用模板创建插件
cd examples
cp -r modern-vue-plugin my-first-plugin
cd my-first-plugin

# 安装依赖
npm install

# 开发模式
npm run dev
```

### 4. 配置插件信息

编辑 `package.json`：

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "我的第一个插件",
  "unihub": {
    "id": "com.yourname.myfirstplugin",
    "icon": "🎉",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard"],
    "keywords": ["工具", "效率"]
  }
}
```

### 5. 使用 UniHub API

```vue
<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')

// 读取剪贴板
const readClipboard = async () => {
  const text = await window.unihub.clipboard.readText()
  input.value = text
}

// 写入剪贴板
const writeClipboard = async () => {
  await window.unihub.clipboard.writeText(output.value)
  alert('已复制到剪贴板')
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">我的第一个插件</h1>
    
    <button @click="readClipboard" class="btn">
      读取剪贴板
    </button>
    
    <textarea v-model="input" class="w-full p-2 border rounded mt-2" />
    
    <button @click="writeClipboard" class="btn mt-2">
      写入剪贴板
    </button>
  </div>
</template>
```

### 6. 打包插件

```bash
# 构建
npm run build

# 打包成 .zip
npm run package
```

### 7. 安装插件

1. 在 UniHub 中打开"插件管理"
2. 点击"安装插件"
3. 选择 `plugin.zip` 文件
4. 允许权限请求
5. 完成！

---

## 🎯 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘K` / `Ctrl+K` | 打开全局搜索 |
| `⌘P` / `Ctrl+P` | 打开全局搜索 |
| `⌘T` / `Ctrl+T` | 新建标签页 |
| `⌘W` / `Ctrl+W` | 关闭当前标签 |
| `⌘B` / `Ctrl+B` | 切换侧边栏 |
| `⌘⇧Space` / `Ctrl+Shift+Space` | 显示/隐藏主窗口 |

---

## 📚 下一步

- [插件开发指南](./PLUGIN_DEVELOPMENT.md)
- [API 完整文档](./PLUGIN_API.md)
- [查看示例插件](../examples/modern-vue-plugin)
- [了解改进内容](./IMPROVEMENTS.md)

---

## 💡 提示

1. **开发模式**：使用 `npm run dev` 启动开发服务器，支持热重载
2. **权限系统**：只声明需要的权限，提高用户信任度
3. **关键词优化**：添加准确的关键词，方便用户搜索
4. **错误处理**：使用 try-catch 处理 API 调用
5. **测试**：在打包前充分测试插件功能

---

## ❓ 常见问题

### Q: 如何调试插件？

A: 在开发模式下，打开 DevTools：
```javascript
// 在插件代码中
console.log('调试信息')
```

### Q: 插件无法访问文件系统？

A: 检查 `package.json` 中是否声明了 `fs` 权限：
```json
{
  "unihub": {
    "permissions": ["fs"]
  }
}
```

### Q: 如何使用 Sidecar？

A: 参考 [Sidecar 示例](../examples/modern-vue-plugin/sidecar/main.go)：
```typescript
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({ action: 'process', data: 'hello' })
})
console.log(result.stdout)
```

### Q: 插件如何持久化数据？

A: 使用数据库 API：
```typescript
// 保存
await window.unihub.db.set('key', { value: 123 })

// 读取
const data = await window.unihub.db.get('key')
```

---

## 🆘 获取帮助

- [GitHub Issues](https://github.com/yourname/unihub/issues)
- [文档](./README.md)
- [示例代码](../examples)
