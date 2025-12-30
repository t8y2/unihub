# UniHub - 开放式插件平台

基于 Electron + Vue 的可扩展工具平台，支持任意前后端技术栈的插件开发。

## ✨ 核心特性

- 🎨 **前端自由**：支持原生 JS、Vue、React 等任何前端框架
- 🔧 **后端自由**：支持 Python、Go、Node.js、Rust 等任何后端语言
- 📦 **即插即用**：ZIP 格式插件，一键安装
- ⚡ **高性能**：子进程隔离，原生性能
- 🔒 **安全可靠**：权限系统，沙箱隔离

## 🚀 快速开始

### 运行应用

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建应用
pnpm build:mac    # macOS
pnpm build:win    # Windows
pnpm build:linux  # Linux
```

### 测试插件

```bash
# 使用快速测试脚本
./test-plugin.sh

# 或手动测试
cd examples/vanilla-go-plugin
./build.sh && ./package.sh
python3 -m http.server 8080

# 在应用的插件商店输入
http://localhost:8080/plugin.zip
```

## 📚 插件开发

### 三种示例插件

1. **原生 JS + Go** - 高性能工具
   ```bash
   cd examples/vanilla-go-plugin
   ```

2. **React + Python** - 数据分析工具
   ```bash
   cd examples/react-python-plugin
   ```

3. **Vue + Node.js** - 快速开发工具
   ```bash
   cd examples/simple-plugin
   ```

### 创建你的第一个插件

```bash
# 1. 创建目录结构
mkdir my-plugin && cd my-plugin
mkdir frontend

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
  "keywords": ["关键词"]
}
EOF

# 3. 创建前端页面
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>我的插件</title></head>
<body><h1>Hello World!</h1></body>
</html>
EOF

# 4. 打包并测试
zip -r plugin.zip manifest.json frontend/
python3 -m http.server 8080
```

### 文档

- **[PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)** - 完整开发指南
- **[PLUGIN_ARCHITECTURE.md](PLUGIN_ARCHITECTURE.md)** - 架构设计
- **[PLUGIN_EXAMPLES.md](PLUGIN_EXAMPLES.md)** - 技术栈对比
- **[PLUGIN_SUMMARY.md](PLUGIN_SUMMARY.md)** - 功能总结

## 🎯 技术栈对比

| 组合 | 适用场景 | 学习难度 | 性能 |
|------|----------|----------|------|
| 原生 JS + Go | 高性能工具 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| React + Python | 数据分析 | ⭐⭐⭐ | ⭐⭐⭐ |
| Vue + Node.js | 快速开发 | ⭐⭐ | ⭐⭐⭐⭐ |

## 🛠️ 开发环境
