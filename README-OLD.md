# UniHub

一个基于 Tauri + Vue 3 的通用开发者工具集，集成了多种常用的开发工具。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI**: shadcn-vue + Tailwind CSS
- **桌面框架**: Tauri (Rust)
- **包管理**: pnpm

## 功能特性

### 🔌 插件化架构

- ✅ **插件系统** - 所有工具都是插件，可以自由启用/禁用
- ✅ **插件管理器** - 可视化管理所有插件
- ✅ **插件商店** - 安装第三方开发者的插件
- ✅ **Rust 后端支持** - 插件可以包含高性能 Rust 代码 🚀
- ✅ **状态持久化** - 自动保存你的插件设置
- ✅ **易于扩展** - 添加新工具只需注册插件
- ✅ **沙箱环境** - 安全地运行第三方插件

### 🛠️ 内置工具（12个插件）

**格式化工具**

- ✅ JSON 格式化与压缩
- ✅ JavaScript 代码格式化
- ✅ CSS 样式格式化
- ✅ HTML 代码格式化
- ✅ H5 页面格式化与压缩

**开发工具**

- ✅ JWT 编码/解码工具
- ✅ 格式转换（JSON/YAML/TOML/XML）
- ✅ 2FA 验证码生成（TOTP）
- ✅ 二维码生成与识别
- ✅ 时间戳转换

**编码工具**

- ✅ Base64 编码/解码
- ✅ URL 编码/解码

### 🎨 用户体验

- ✅ 原生桌面应用体验
- ✅ 深色/浅色主题切换
- ✅ 多标签页支持
- ✅ 键盘快捷键（Cmd/Ctrl+W）
- ✅ 跨平台支持 (macOS, Windows, Linux)

## 开发环境要求

1. **Node.js** (v18+)
2. **pnpm** - `npm install -g pnpm`
3. **Rust** - 访问 https://rustup.rs/ 安装
4. **系统依赖**:
   - macOS: `xcode-select --install`
   - Linux: 参考 [Tauri 文档](https://tauri.app/v1/guides/getting-started/prerequisites)
   - Windows: 参考 [Tauri 文档](https://tauri.app/v1/guides/getting-started/prerequisites)

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装前端依赖
cd frontend
pnpm install
cd ..
```

### 开发模式

```bash
pnpm tauri:dev
```

这会启动 Vite 开发服务器并打开 Tauri 桌面应用窗口。

### 构建生产版本

```bash
pnpm tauri:build
```

构建产物在 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
.
├── frontend/              # Vue 前端项目
│   ├── src/
│   │   ├── plugins/       # 🔌 插件系统
│   │   │   ├── builtin/   # 内置插件定义
│   │   │   ├── registry.ts # 插件注册中心
│   │   │   └── index.ts   # 插件系统入口
│   │   ├── types/         # TypeScript 类型定义
│   │   │   └── plugin.ts  # 插件类型
│   │   ├── components/    # Vue 组件
│   │   │   ├── PluginManager.vue # 插件管理器
│   │   │   ├── JsonFormatter.vue
│   │   │   └── ...        # 其他工具组件
│   │   ├── App.vue        # 根组件
│   │   └── main.ts        # 入口文件
│   ├── PLUGIN_SYSTEM.md   # 插件系统文档
│   ├── package.json
│   └── vite.config.ts
├── src-tauri/             # Tauri 后端 (Rust)
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── QUICK_START.md         # 快速启动指南
├── PLUGIN_MIGRATION.md    # 插件系统迁移指南
├── package.json           # 根目录配置
└── README.md
```

## 开发说明

### 前端开发

前端使用 Vue 3 + TypeScript + shadcn-vue 组件库。

```bash
cd frontend
pnpm dev  # 单独运行前端 (http://localhost:5173)
```

### 🔌 插件开发

#### 内置插件（集成到应用）

只需 3 步即可添加新工具：

1. **创建组件** - 在 `frontend/src/components/` 创建 Vue 组件
2. **注册插件** - 在 `frontend/src/plugins/builtin/index.ts` 中注册
3. **测试** - 运行 `pnpm tauri:dev` 查看效果

#### 第三方插件（独立分发）

创建可以分享给其他用户的插件：

**纯 JavaScript 插件：**

1. **创建插件文件** - 参考 `examples/complete-example.js`
2. **本地测试** - 使用插件商店从 URL 安装
3. **发布分享** - 上传到 GitHub Gist 或自己的服务器
4. **分享 URL** - 其他用户可以一键安装

**带 Rust 后端的插件：** 🚀

1. **创建插件** - 参考 `examples/plugin-with-backend/`
2. **编写 Rust 代码** - 实现高性能计算
3. **提交到市场** - 服务器自动编译多平台版本
4. **用户安装** - 自动下载对应平台的版本

**插件能力：**

- ✅ 完整的 Vue 3 支持
- ✅ HTTP 请求（通过 Tauri 后端）
- ✅ 剪贴板访问
- ✅ 通知功能
- ✅ 加密/哈希（MD5, SHA256, SHA512）
- ✅ Base64 编码/解码
- ✅ 数据压缩/解压
- ✅ 系统信息
- ✅ 文件读写
- ✅ 权限系统
- ✅ **Rust 后端调用** - 高性能计算 🚀

详细文档见 **[PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)** ⭐

### 插件管理

#### 插件管理器

- 查看所有已安装的插件
- 启用/禁用任意插件
- 自定义工具栏

#### 插件商店

- 从 URL 安装第三方插件
- 查看已安装的插件
- 一键卸载插件

## 常见问题

### 1. 首次运行很慢？

首次运行会下载 Rust 依赖和编译 Tauri，需要较长时间，这是正常的。

### 2. 如何修改窗口大小？

编辑 `src-tauri/tauri.conf.json` 中的 `windows` 配置。

### 3. 如何自定义应用图标？

替换 `src-tauri/icons/` 目录下的图标文件，或使用 `pnpm tauri icon` 命令生成。

### 4. 插件可以做什么？

查看 [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md) 了解插件能力和限制。

### 5. 如何开发插件？

查看 [examples/](examples/) 目录的示例代码，参考 [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)。

## 📚 文档

- **[PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)** - 完整的插件开发指南（JavaScript + Rust）⭐
- **[examples/](examples/)** - 完整示例代码

## License

MIT
