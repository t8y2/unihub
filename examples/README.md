# 插件示例集合

展示不同前后端技术栈组合的插件开发方式。

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

### 3. Vue + Node.js 插件
**路径**: `simple-plugin/`

**技术栈**：
- 前端：Vue 3 (CDN)
- 后端：Node.js

**特点**：
- 💚 前后端同语言
- 🔄 响应式开发
- 📦 npm 生态丰富

**适合**：Web 工具、通用工具、快速开发

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
- **快速开发** → Vue + Node.js
- **数据处理** → React + Python
- **最小体积** → 原生 JS + Python
- **复杂应用** → React + Node.js

### 技术栈对比

| 示例 | 学习难度 | 开发速度 | 性能 | 体积 |
|------|----------|----------|------|------|
| 原生 JS + Go | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| React + Python | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Vue + Node.js | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🛠️ 自定义开发

### 创建你自己的插件

1. **选择前端框架**
   - 原生 JS（零依赖）
   - Vue 3（响应式）
   - React（组件化）
   - 其他任何框架

2. **选择后端语言**（可选）
   - Python（数据处理）
   - Go（高性能）
   - Node.js（Web 工具）
   - Rust（系统工具）
   - 其他任何语言

3. **实现功能**
   - 前端：创建 `frontend/index.html`
   - 后端：创建 `backend/main.*`
   - 配置：编写 `manifest.json`

4. **打包发布**
   ```bash
   zip -r plugin.zip manifest.json frontend/ backend/
   ```

---

## 💡 更多示例

想要更多示例？查看：

- **图像处理插件** - 使用 Python PIL
- **Markdown 编辑器** - 使用 Vue + Node.js
- **文件加密工具** - 使用 Rust
- **API 测试工具** - 使用 React + Go

---

## 🤝 贡献

欢迎提交你的插件示例！

1. Fork 项目
2. 创建示例目录
3. 添加 README
4. 提交 PR

---

**开始创建你的插件吧！** 🎉
