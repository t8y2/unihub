# 插件发布和安装流程演示

## 🎯 完整流程概览

```
开发 → 构建 → 打包 → 发布 → 安装 → 使用
```

## 📦 步骤 1: 开发插件

插件目录结构：

```
modern-vue-plugin/
├── package.json          # 配置文件（包含 unihub 字段）
├── index.html            # 开发入口
├── vite.config.ts        # Vite 配置
├── src/
│   ├── main.ts          # 主入口
│   ├── App.vue          # 主组件
│   └── style.css        # 样式
├── backend/             # 后端（可选）
│   └── main.py
└── scripts/
    └── package.js       # 打包脚本
```

**package.json 配置**：

```json
{
  "name": "modern-vue-plugin",
  "version": "1.0.0",
  "description": "现代化 Vue 插件",
  "author": "UniHub Team",
  "unihub": {
    "id": "com.unihub.modern-vue",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "backend": {
      "entry": "backend/main.py",
      "type": "python"
    },
    "permissions": ["backend"]
  }
}
```

## 🔨 步骤 2: 构建插件

```bash
cd examples/modern-vue-plugin
npm run build
```

**输出**：

```
vite v5.4.21 building for production...
✓ 19 modules transformed.
dist/index.html  75.33 kB │ gzip: 29.73 kB
✓ built in 537ms
```

**构建产物**：

```
dist/
└── index.html       # 自包含的单文件（所有 JS/CSS 已内联）
```

## 📦 步骤 3: 打包插件

```bash
npm run package
```

**输出**：

```
📦 开始打包插件...
🗑️  删除旧的 plugin.zip
📄 添加 package.json
📁 添加 dist/
🔧 添加 backend/
📖 添加 README.md
✅ 打包完成!
📦 文件: plugin.zip
📊 大小: 0.03 MB (33.04 KB)
```

**打包内容**：

```
plugin.zip
├── package.json     # 配置文件
├── dist/
│   └── index.html  # 构建产物
├── backend/
│   └── main.py     # 后端文件
└── README.md        # 说明文档
```

## 🌐 步骤 4: 发布插件

### 方式 1: GitHub Release（推荐）

```bash
# 1. 创建 Git 标签
git tag v1.0.0
git push origin v1.0.0

# 2. 在 GitHub 创建 Release
# 3. 上传 plugin.zip
```

**下载地址**：
```
https://github.com/username/plugin/releases/download/v1.0.0/plugin.zip
```

### 方式 2: 本地测试

```bash
# 启动 HTTP 服务器
python3 -m http.server 8080
```

**下载地址**：
```
http://localhost:8080/plugin.zip
```

## 📥 步骤 5: 安装插件

### 在 UniHub 中安装

1. **启动 UniHub**
   ```bash
   npm run dev
   ```

2. **打开插件管理**
   - 点击侧边栏"插件"图标
   - 或按快捷键 `Cmd/Ctrl + P`

3. **输入插件 URL**
   ```
   http://localhost:8080/plugin.zip
   ```

4. **点击安装**
   - 系统自动下载 plugin.zip
   - 解压到 `~/.unihub/plugins/com.unihub.modern-vue/`
   - 读取 package.json 配置
   - 注册插件到系统

### 安装过程（内部）

```javascript
// 1. 下载插件
const response = await fetch(url)
const buffer = await response.arrayBuffer()

// 2. 解压 ZIP
const zip = new AdmZip(buffer)
zip.extractAllTo(pluginDir)

// 3. 读取配置
const pkg = JSON.parse(fs.readFileSync('package.json'))
const manifest = {
  id: pkg.unihub.id,
  name: pkg.name,
  version: pkg.version,
  entry: pkg.unihub.entry,
  ...
}

// 4. 保存插件信息
savePluginInfo(manifest)

// 5. 加载插件
loadPlugin(manifest.id)
```

## 🎮 步骤 6: 使用插件

### 插件界面

插件通过 iframe 加载，自动注入 `window.unihub` API：

```javascript
// 插件代码可以直接使用
await window.unihub.db.put('key', 'value')
const value = await window.unihub.db.get('key')

await window.unihub.clipboard.writeText('Hello')
const text = await window.unihub.clipboard.readText()
```

### 数据隔离

每个插件有独立的数据存储：

```
~/.unihub/plugin-storage/
├── com.unihub.modern-vue.json
├── com.example.plugin1.json
└── com.example.plugin2.json
```

## 📊 完整流程时间线

| 步骤 | 操作 | 时间 | 输出 |
|------|------|------|------|
| 1 | 开发插件 | - | 源代码 |
| 2 | `npm run build` | ~0.5s | dist/index.html (75KB) |
| 3 | `npm run package` | ~0.1s | plugin.zip (33KB) |
| 4 | 上传到 GitHub | ~5s | Release URL |
| 5 | 在 UniHub 安装 | ~2s | 插件已安装 |
| 6 | 使用插件 | - | 运行中 |

**总计**：从打包到安装只需 **~8 秒**！

## 🎯 关键优势

### 1. 开发者友好

- ✅ 使用标准 `package.json`
- ✅ 支持任何前端框架（Vue/React/Svelte）
- ✅ 本地构建，完全可控
- ✅ 一键打包命令

### 2. 用户体验好

- ✅ 下载即用，无需安装依赖
- ✅ 秒级安装（33KB 压缩包）
- ✅ 离线可用（所有依赖已打包）
- ✅ 自动更新检测

### 3. 分发简单

- ✅ 标准 ZIP 格式
- ✅ 可托管在任何地方（GitHub/CDN/自建）
- ✅ 支持版本管理
- ✅ 去中心化（开发者自己托管）

## 🔍 测试命令

```bash
# 1. 测试构建
npm run build --prefix examples/modern-vue-plugin

# 2. 测试打包
npm run package --prefix examples/modern-vue-plugin

# 3. 查看内容
unzip -l examples/modern-vue-plugin/plugin.zip

# 4. 启动测试服务器
python3 -m http.server 8080 --directory examples/modern-vue-plugin

# 5. 测试下载
curl -I http://localhost:8080/plugin.zip

# 6. 完整演示
./test-plugin-install.sh
```

## 📝 提交到插件市场

创建 PR 到 `unihub-plugins` 仓库：

```json
{
  "id": "com.unihub.modern-vue",
  "name": "现代化 Vue 插件",
  "version": "1.0.0",
  "description": "使用 Vite + Vue 3 + TypeScript 构建的现代化插件",
  "author": "UniHub Team",
  "icon": "🚀",
  "category": "tool",
  "keywords": ["vue", "typescript", "tool"],
  "downloadUrl": "https://github.com/unihub/modern-vue-plugin/releases/download/v1.0.0/plugin.zip",
  "homepage": "https://github.com/unihub/modern-vue-plugin",
  "screenshots": []
}
```

## 🎉 完成！

现在你已经了解了完整的插件发布和安装流程。开始创建你的第一个插件吧！

```bash
node tools/create-plugin.js my-awesome-plugin
```
