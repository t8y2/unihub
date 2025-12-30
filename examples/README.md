# 插件示例集合

展示不同前后端技术栈组合的插件开发方式，从简单的 CDN 引入到现代化的构建工具。

## 📚 示例列表

### 1. 原生 JS + Go 插件

**路径**: `vanilla-go-plugin/`

**技术栈**：

- 前端：纯原生 JavaScript（零依赖）
- 后端：Go 1.21+

**特点**：

- ⚡ 极快的加载和执行速度
- 📦 最小的体积
- 🚀 高性能后端处理

**适合**：性能敏感的工具、系统工具

---

### 2. React + Python 插件

**路径**: `react-python-plugin/`

**技术栈**：

- 前端：React 18 (CDN)
- 后端：Python 3

**特点**：

- 🎨 现代化的 UI 开发
- 🐍 强大的数据处理能力
- 📊 丰富的 Python 库支持

**适合**：数据分析、AI 工具、科学计算

---

### 3. Vue + Python 插件 (CDN)

**路径**: `vue-python-plugin/`

**技术栈**：

- 前端：Vue 3 (CDN)
- 后端：Python 3

**特点**：

- 🔄 响应式开发
- 🐍 强大的数据处理能力
- 📦 零构建配置

**适合**：快速原型、数据处理工具

---

### 4. 现代化 Vue + Python 插件 ⭐

**路径**: `modern-vue-plugin/`

**技术栈**：

- 前端：Vue 3 + TypeScript + Vite
- 后端：Python 3

**特点**：

- 🛠️ 现代化构建工具
- 📝 TypeScript 类型安全
- 🎨 组件化开发
- 📦 单文件打包（解决 CORS）
- 🔥 热重载开发体验

**适合**：复杂应用、团队开发、生产环境

---

## 🚀 快速开始

### 测试任意插件

```bash
# 1. 进入示例目录
cd vanilla-go-plugin  # 或其他示例

# 2. 编译后端（如果需要）
./build.sh

# 3. 打包插件
./package.sh

# 4. 启动测试服务器
python3 -m http.server 8080

# 5. 在 UniHub 插件商店输入
http://localhost:8080/plugin.zip
```

### 现代化 Vue 插件开发

```bash
# 1. 进入现代化 Vue 插件目录
cd modern-vue-plugin

# 2. 安装依赖
npm install

# 3. 开发模式（热重载）
npm run dev

# 4. 构建并打包
npm run package

# 5. 在 UniHub 中拖拽安装 plugin.zip
```

---

## 📖 文档

- **[PLUGIN_GUIDE.md](../PLUGIN_GUIDE.md)** - 完整开发指南
- **[PLUGIN_ARCHITECTURE.md](../PLUGIN_ARCHITECTURE.md)** - 架构设计
- **[PLUGIN_EXAMPLES.md](../PLUGIN_EXAMPLES.md)** - 技术栈对比

---

## 🎯 选择指南

### 我该选择哪个示例？

**如果你想要...**

- **最快的性能** → 原生 JS + Go
- **快速原型** → Vue + Python (CDN)
- **数据处理** → React + Python
- **现代化开发** → 现代化 Vue + Python ⭐
- **最小体积** → 原生 JS + Python
- **复杂应用** → 现代化 Vue + Python

### 技术栈对比

| 示例                    | 学习难度 | 开发速度   | 性能       | 体积       | 开发体验   |
| ----------------------- | -------- | ---------- | ---------- | ---------- | ---------- |
| 原生 JS + Go           | ⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐       |
| React + Python (CDN)   | ⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐⭐     |
| Vue + Python (CDN)     | ⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| 现代化 Vue + Python ⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |

### CDN vs 构建工具

**CDN 方式** (vue-python-plugin, react-python-plugin)
- ✅ 零配置，即写即用
- ✅ 学习成本低
- ❌ 缺少类型检查
- ❌ 没有代码分割
- ❌ 开发体验一般

**构建工具方式** (modern-vue-plugin)
- ✅ TypeScript 支持
- ✅ 热重载开发
- ✅ 代码分割优化
- ✅ 现代化工具链
- ❌ 需要学习构建配置
- ❌ 初始设置复杂

---

## 🛠️ 自定义开发

### 创建你自己的插件

#### 方式一：简单快速（CDN）

1. **选择前端框架**
   - 原生 JS（零依赖）
   - Vue 3（响应式）
   - React（组件化）

2. **选择后端语言**（可选）
   - Python（数据处理）
   - Go（高性能）
   - Node.js（Web 工具）

3. **实现功能**
   - 前端：创建 `frontend/index.html`
   - 后端：创建 `backend/main.*`
   - 配置：编写 `manifest.json`

4. **打包发布**
   ```bash
   zip -r plugin.zip manifest.json frontend/ backend/
   ```

#### 方式二：现代化开发（推荐）

1. **复制现代化模板**
   ```bash
   cp -r modern-vue-plugin my-plugin
   cd my-plugin
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发你的功能**
   - 修改 `src/App.vue`
   - 添加组件到 `src/components/`
   - 更新后端 `backend/main.py`
   - 修改 `manifest.json`

4. **构建和打包**
   ```bash
   npm run build
   npm run package
   ```

### 解决 CORS 问题

如果你使用构建工具，确保所有资源都内联到 HTML 中：

```javascript
// vite.config.ts
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  // ...
})
```

---

## 💡 更多示例

想要更多示例？查看：

- **图像处理插件** - 使用 Python PIL
- **Markdown 编辑器** - 使用现代化 Vue
- **文件加密工具** - 使用 Rust
- **API 测试工具** - 使用 React + Go
- **代码格式化工具** - 使用 TypeScript

### 插件功能展示

**现代化 Vue 插件** 包含以下功能：
- 🔤 Base64 编码/解码
- 🔐 多种加密算法（凯撒密码、ROT13、MD5、SHA256）
- 📦 数据压缩（Gzip、Zlib）
- 📋 操作历史记录
- ⚡ 实时处理反馈
- 🎨 现代化 UI 设计

---

## 🤝 贡献

欢迎提交你的插件示例！

1. Fork 项目
2. 创建示例目录
3. 添加 README
4. 提交 PR

---

**开始创建你的插件吧！** 🎉
