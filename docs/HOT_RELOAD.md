# 🔥 插件热重载 - 快速开始

## 5 分钟上手

### 1. 启动插件开发服务器

```bash
cd examples/modern-vue-plugin
npm install  # 首次需要安装依赖
npm run dev
```

你会看到：

```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2. 在 UniHub 中启用开发模式

1. 打开 UniHub
2. 点击左侧边栏的 **"插件管理"**
3. 点击右上角的 **"🔥 开发模式"** 按钮
4. 填写以下信息：
   - **插件 ID**: `com.unihub.modern-vue`
   - **开发服务器 URL**: `http://localhost:5173`
   - **自动重载**: ✅ 勾选
5. 点击 **"注册开发模式"**

### 3. 打开插件

在 UniHub 主界面，点击插件列表中的 **"现代化 Vue 插件"**

你会看到：

- 插件窗口左上角显示 `🔥 DEV MODE` 标签
- 插件内容来自开发服务器

### 4. 开始开发

打开 `examples/modern-vue-plugin/src/App.vue`，修改任意内容：

```vue
<template>
  <div class="app">
    <header class="app-header">
      <h1>🚀 现代化 Vue 插件</h1>
      <p>修改这里试试！</p>
      <!-- 修改这行 -->
    </header>
    <!-- ... -->
  </div>
</template>
```

保存文件，插件会自动刷新！✨

## 🎯 效率对比

| 操作     | 传统方式 | 热重载   |
| -------- | -------- | -------- |
| 修改代码 | 1s       | 1s       |
| 构建     | 5s       | -        |
| 打包     | 2s       | -        |
| 安装     | 3s       | -        |
| 刷新     | 1s       | 0.5s     |
| **总计** | **12s**  | **1.5s** |

**节省 87% 的时间！** ⚡

## 💡 提示

### 修改后没有自动刷新？

1. 检查开发服务器是否正常运行
2. 检查是否勾选了"自动重载"
3. 手动刷新：在插件窗口按 `Cmd+R` (Mac) 或 `Ctrl+R` (Windows)

### 端口被占用？

修改端口：

```bash
npm run dev -- --port 5174
```

然后在开发模式中使用 `http://localhost:5174`

### 开发完成后

1. 取消开发模式：在"🔥 开发模式"对话框中点击"取消"
2. 构建插件：`npm run build`
3. 打包插件：`npm run package`
4. 测试打包版本：在"手动安装"页面安装 `plugin.zip`

## 🚀 下一步

- 查看完整文档：[HOT_RELOAD_GUIDE.md](HOT_RELOAD_GUIDE.md)
- 学习插件开发：[PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md)
- 查看 API 文档：[PLUGIN_API_REFERENCE.md](PLUGIN_API_REFERENCE.md)
