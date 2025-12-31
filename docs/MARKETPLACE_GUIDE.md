# UniHub 插件市场搭建指南

## 🏗️ 架构设计

### 零成本方案（推荐）

使用 GitHub 作为插件市场后端：

```
unihub-plugins (GitHub 仓库)
├── plugins.json              # 插件列表（主索引）
├── plugins/                  # 插件详情
│   ├── com.example.plugin1.json
│   ├── com.example.plugin2.json
│   └── com.unihub.modern-vue.json
├── screenshots/              # 插件截图
│   ├── plugin1/
│   │   ├── 1.png
│   │   └── 2.png
│   └── plugin2/
└── README.md
```

### 优势

- ✅ **零成本**：完全免费
- ✅ **去中心化**：开发者自己托管插件文件
- ✅ **透明**：所有提交都是 PR，可审核
- ✅ **版本控制**：Git 历史记录
- ✅ **CDN 加速**：jsDelivr 自动加速
- ✅ **易于维护**：标准的 Git 工作流

---

## 📋 第一步：创建插件仓库

### 1. 创建 GitHub 仓库

```bash
# 创建新仓库
mkdir unihub-plugins
cd unihub-plugins
git init

# 创建基础结构
mkdir -p plugins screenshots
touch plugins.json README.md
```

### 2. 创建 plugins.json

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-12-31T00:00:00Z",
  "plugins": [
    {
      "id": "com.unihub.modern-vue",
      "name": "Modern Vue Plugin",
      "version": "1.0.0",
      "description": "使用 Vite + Vue 3 + TypeScript 构建的现代化插件示例",
      "author": {
        "name": "UniHub Team",
        "email": "team@unihub.dev",
        "url": "https://github.com/unihub"
      },
      "icon": "🚀",
      "category": "tool",
      "keywords": ["vue", "typescript", "encode", "encrypt"],
      "permissions": ["fs", "clipboard", "http", "spawn"],
      "downloadUrl": "https://github.com/yourname/modern-vue-plugin/releases/download/v1.0.0/plugin.zip",
      "homepage": "https://github.com/yourname/modern-vue-plugin",
      "repository": "https://github.com/yourname/modern-vue-plugin",
      "screenshots": [
        "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/modern-vue/1.png",
        "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/modern-vue/2.png"
      ],
      "downloads": 0,
      "rating": 0,
      "createdAt": "2024-12-31T00:00:00Z",
      "updatedAt": "2024-12-31T00:00:00Z"
    }
  ]
}
```

### 3. 创建插件详情文件

`plugins/com.unihub.modern-vue.json`:

```json
{
  "id": "com.unihub.modern-vue",
  "name": "Modern Vue Plugin",
  "version": "1.0.0",
  "description": "使用 Vite + Vue 3 + TypeScript 构建的现代化插件示例",
  "longDescription": "这是一个完整的插件示例，展示了如何使用现代化的技术栈开发 UniHub 插件。包含 Base64 编码、文本加密、数据压缩等功能，并演示了 Sidecar 的使用。",
  "author": {
    "name": "UniHub Team",
    "email": "team@unihub.dev",
    "url": "https://github.com/unihub"
  },
  "icon": "🚀",
  "category": "tool",
  "keywords": ["vue", "typescript", "encode", "encrypt", "compress"],
  "permissions": ["fs", "clipboard", "http", "spawn"],
  "versions": [
    {
      "version": "1.0.0",
      "downloadUrl": "https://github.com/yourname/modern-vue-plugin/releases/download/v1.0.0/plugin.zip",
      "releaseNotes": "初始版本",
      "releasedAt": "2024-12-31T00:00:00Z"
    }
  ],
  "homepage": "https://github.com/yourname/modern-vue-plugin",
  "repository": "https://github.com/yourname/modern-vue-plugin",
  "issues": "https://github.com/yourname/modern-vue-plugin/issues",
  "screenshots": [
    "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/modern-vue/1.png",
    "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/modern-vue/2.png"
  ],
  "stats": {
    "downloads": 0,
    "rating": 0,
    "reviews": 0
  },
  "createdAt": "2024-12-31T00:00:00Z",
  "updatedAt": "2024-12-31T00:00:00Z"
}
```

### 4. 创建 README.md

```markdown
# UniHub 插件市场

官方插件仓库，收录优质的 UniHub 插件。

## 📦 提交插件

1. Fork 本仓库
2. 在 `plugins/` 目录创建你的插件配置文件
3. 在 `plugins.json` 中添加插件信息
4. 提交 PR

详见：[提交指南](./CONTRIBUTING.md)

## 🔍 浏览插件

访问 UniHub 应用内的插件市场，或查看 [plugins.json](./plugins.json)

## 📊 统计

- 插件总数：1
- 分类：工具、效率、开发者工具
```

### 5. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit: Plugin marketplace"
git remote add origin https://github.com/yourname/unihub-plugins.git
git push -u origin main
```

---

## 📋 第二步：实现市场 UI

### 1. 创建市场组件

我会帮你创建一个完整的插件市场 UI，包括：
- 插件列表
- 搜索和筛选
- 插件详情
- 一键安装
- 评分和评论

### 2. API 设计

```typescript
// 获取插件列表
GET https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/plugins.json

// 获取插件详情
GET https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/plugins/{pluginId}.json

// 下载插件
GET {plugin.downloadUrl}
```

---

## 📋 第三步：开发者工作流

### 发布插件流程

1. **开发插件**
   ```bash
   npm create vite@latest my-plugin -- --template vue-ts
   cd my-plugin
   # 开发插件...
   ```

2. **构建和打包**
   ```bash
   npm run build
   npm run package  # 生成 plugin.zip
   ```

3. **发布到 GitHub Release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # 在 GitHub 上创建 Release，上传 plugin.zip
   ```

4. **提交到插件市场**
   - Fork `unihub-plugins` 仓库
   - 创建 `plugins/com.yourname.myplugin.json`
   - 更新 `plugins.json`
   - 提交 PR

5. **审核通过**
   - 维护者审核 PR
   - 合并后自动发布

---

## 📋 第四步：自动化

### GitHub Actions 自动验证

`.github/workflows/validate.yml`:

```yaml
name: Validate Plugin Submission

on:
  pull_request:
    paths:
      - 'plugins/**'
      - 'plugins.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate JSON
        run: |
          # 验证 JSON 格式
          for file in plugins/*.json; do
            jq empty "$file" || exit 1
          done
          jq empty plugins.json || exit 1
      
      - name: Check Required Fields
        run: |
          # 检查必需字段
          node scripts/validate-plugin.js
```

---

## 🎯 下一步

我现在会帮你实现：

1. ✅ 创建插件市场 UI 组件
2. ✅ 实现插件浏览和搜索
3. ✅ 实现一键安装功能
4. ✅ 创建插件提交模板
5. ✅ 创建自动化脚本

准备好了吗？我开始实现！
