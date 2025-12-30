# 插件系统总结

## 🎉 已实现的功能

### ✅ 完全开放的插件架构

**前端支持**：

- ✅ 原生 JavaScript
- ✅ Vue 3
- ✅ React
- ✅ 任何可以打包成 HTML 的框架

**后端支持**：

- ✅ Python
- ✅ Go
- ✅ Node.js
- ✅ Rust
- ✅ 任何可以编译为可执行文件的语言

### ✅ 插件管理器

**功能**：

- 从 URL 安装插件
- 卸载插件
- 列出已安装插件
- 加载插件前端
- 调用插件后端

**通信方式**：

- Electron IPC（主进程 ↔ 渲染进程）
- 子进程（主进程 ↔ 后端可执行文件）

### ✅ 三个完整示例

1. **原生 JS + Go**
   - 零依赖前端
   - 高性能后端
   - 适合系统工具

2. **React + Python**
   - 现代化 UI
   - 强大的数据处理
   - 适合数据分析

3. **Vue + Node.js**
   - 响应式开发
   - 前后端同语言
   - 适合快速开发

---

## 📁 项目结构

```
unihub/
├── src/
│   ├── main/
│   │   ├── index.ts              # 主进程入口
│   │   └── plugin-manager.ts    # 插件管理器 ⭐
│   ├── preload/
│   │   └── index.ts              # Preload 脚本
│   └── renderer/
│       └── src/
│           └── components/
│               ├── PluginManager.vue  # 插件管理界面
│               └── PluginStore.vue    # 插件商店界面
├── examples/
│   ├── vanilla-go-plugin/        # 原生 JS + Go 示例 ⭐
│   ├── react-python-plugin/      # React + Python 示例 ⭐
│   └── simple-plugin/            # Vue + Node.js 示例 ⭐
├── PLUGIN_GUIDE.md               # 开发指南 ⭐
├── PLUGIN_ARCHITECTURE.md        # 架构设计 ⭐
├── PLUGIN_EXAMPLES.md            # 技术栈对比 ⭐
└── test-plugin.sh                # 快速测试脚本 ⭐
```

---

## 🔄 工作流程

### 1. 插件开发

```bash
# 选择技术栈
前端：原生 JS / Vue / React / ...
后端：Python / Go / Node.js / Rust / ...

# 创建文件
manifest.json       # 元数据
frontend/index.html # 前端入口
backend/main.*      # 后端代码（可选）

# 打包
zip -r plugin.zip manifest.json frontend/ backend/
```

### 2. 插件安装

```bash
# 方式 1：本地测试
python3 -m http.server 8080
# 在插件商店输入: http://localhost:8080/plugin.zip

# 方式 2：GitHub Release
# 上传到 GitHub Release
# 在插件商店输入 Release URL
```

### 3. 插件运行

```
用户点击插件
    ↓
渲染进程加载 frontend/index.html
    ↓
前端调用 window.api.plugin.backendCall()
    ↓
IPC 通信到主进程
    ↓
主进程启动子进程执行后端
    ↓
后端返回结果（stdout）
    ↓
主进程返回给渲染进程
    ↓
前端显示结果
```

---

## 🎯 核心优势

### 1. 技术栈自由

开发者可以使用任何熟悉的技术栈，无需学习特定框架。

### 2. 性能优化

- 前端：可选择零依赖的原生 JS
- 后端：可选择编译型语言（Go、Rust）

### 3. 易于开发

- 前端：直接加载 HTML，支持 CDN
- 后端：标准输入输出，简单直接

### 4. 安全隔离

- 插件运行在独立的 iframe 中
- 后端通过子进程隔离
- 权限系统控制访问

---

## 📊 与其他插件系统对比

| 特性       | UniHub     | VS Code  | uTools   | Electron Forge |
| ---------- | ---------- | -------- | -------- | -------------- |
| 前端自由度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐     | ⭐⭐⭐⭐       |
| 后端自由度 | ⭐⭐⭐⭐⭐ | ⭐⭐     | ⭐⭐⭐   | ⭐⭐⭐⭐       |
| 学习成本   | ⭐⭐       | ⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐       |
| 性能       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐       |
| 易用性     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐         |

---

## 🚀 快速开始

### 测试现有示例

```bash
# 使用快速测试脚本
./test-plugin.sh

# 或手动测试
cd examples/vanilla-go-plugin
./build.sh && ./package.sh
python3 -m http.server 8080
```

### 创建新插件

```bash
# 1. 创建目录
mkdir my-plugin
cd my-plugin

# 2. 创建 manifest.json
cat > manifest.json << 'EOF'
{
  "id": "com.yourname.plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {"name": "你的名字"},
  "main": "frontend/index.html",
  "category": "tool",
  "keywords": ["关键词"],
  "permissions": []
}
EOF

# 3. 创建前端
mkdir frontend
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>我的插件</title></head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
EOF

# 4. 打包
zip -r plugin.zip manifest.json frontend/

# 5. 测试
python3 -m http.server 8080
```

---

## 📚 文档导航

- **[PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)** - 完整开发指南
- **[PLUGIN_ARCHITECTURE.md](PLUGIN_ARCHITECTURE.md)** - 架构设计文档
- **[PLUGIN_EXAMPLES.md](PLUGIN_EXAMPLES.md)** - 技术栈对比
- **[examples/README.md](examples/README.md)** - 示例说明

---

## 🎓 学习路径

### 新手

1. 阅读 `PLUGIN_GUIDE.md`
2. 测试 `simple-plugin`（Vue + Node.js）
3. 修改示例，添加自己的功能
4. 创建第一个插件

### 进阶

1. 尝试不同技术栈组合
2. 阅读 `PLUGIN_ARCHITECTURE.md`
3. 优化性能和体积
4. 学习最佳实践

### 高级

1. 贡献示例插件
2. 优化插件管理器
3. 添加新功能
4. 参与社区讨论

---

## 🤝 贡献

欢迎贡献代码、示例和文档！

**可以贡献的内容**：

- 新的示例插件
- 技术栈组合
- 文档改进
- Bug 修复
- 功能建议

---

## 📝 TODO

- [ ] 添加插件市场
- [ ] 支持插件更新
- [ ] 添加插件评分
- [ ] 支持插件依赖
- [ ] 添加插件沙箱
- [ ] 支持插件热重载

---

**开始创建你的插件吧！** 🚀
