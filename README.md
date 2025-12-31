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

### 快速创建插件

```bash
# 使用脚手架工具创建插件
node tools/create-plugin.js my-awesome-plugin

cd my-awesome-plugin
npm install
npm run dev
```

### 打包发布

```bash
# 1. 构建插件
npm run build

# 2. 打包成 zip
npm run package

# 3. 测试插件
# 在 UniHub 中安装 plugin.zip

# 4. 发布到 GitHub Release
# 上传 plugin.zip 到你的仓库 Release
```

### 示例插件

**modern-vue-plugin** - 使用 Vite + Vue 3 + TypeScript

```bash
cd examples/modern-vue-plugin
npm install
npm run dev
npm run package
```

### 文档

- **[PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md)** - 完整开发指南（配置、API、打包、发布）
- **[PLUGIN_API_REFERENCE.md](PLUGIN_API_REFERENCE.md)** - API 详细参考

## 🎯 技术栈对比

| 组合           | 适用场景   | 学习难度 | 性能       |
| -------------- | ---------- | -------- | ---------- |
| 原生 JS + Go   | 高性能工具 | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| React + Python | 数据分析   | ⭐⭐⭐   | ⭐⭐⭐     |
| Vue + Node.js  | 快速开发   | ⭐⭐     | ⭐⭐⭐⭐   |

## 🛠️ 开发环境
