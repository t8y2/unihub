# 插件市场部署指南

## 🎯 目标

搭建一个零成本、去中心化的插件市场，使用 GitHub + jsDelivr CDN。

## 📋 步骤

### 1. 创建 GitHub 仓库

```bash
# 创建新仓库
mkdir unihub-plugins
cd unihub-plugins

# 初始化 Git
git init
git branch -M main

# 复制市场文件
cp -r ../marketplace/* .

# 提交
git add .
git commit -m "Initial commit: UniHub Plugin Marketplace"

# 推送到 GitHub
git remote add origin https://github.com/yourname/unihub-plugins.git
git push -u origin main
```

### 2. 配置 jsDelivr CDN

jsDelivr 会自动为你的 GitHub 仓库提供 CDN 加速。

**CDN URL 格式**：
```
https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json
```

**优势**：
- ✅ 全球 CDN 加速
- ✅ 自动缓存
- ✅ 免费使用
- ✅ 支持版本控制

### 3. 更新应用配置

在 `src/renderer/src/components/PluginMarketplace.vue` 中更新 URL：

```typescript
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json'
```

### 4. 测试市场

```bash
# 启动应用
pnpm dev

# 打开插件管理 -> 插件商店
# 应该能看到插件列表
```

## 🔄 工作流程

### 开发者提交插件

1. **开发插件**
   ```bash
   npm create vite@latest my-plugin -- --template vue-ts
   cd my-plugin
   # 开发...
   npm run build
   npm run package
   ```

2. **发布到 GitHub**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # 在 GitHub 创建 Release，上传 plugin.zip
   ```

3. **提交到市场**
   - Fork `unihub-plugins`
   - 创建 `plugins/com.yourname.myplugin.json`
   - 更新 `plugins.json`
   - 提交 PR

### 维护者审核

1. **审核 PR**
   - 检查 JSON 格式
   - 验证下载链接
   - 测试插件功能
   - 检查安全性

2. **合并 PR**
   ```bash
   # 审核通过后合并
   git merge pr-branch
   git push origin main
   ```

3. **自动发布**
   - jsDelivr 自动更新 CDN
   - 用户刷新即可看到新插件

## 🤖 自动化

### GitHub Actions 验证

创建 `.github/workflows/validate.yml`：

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
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Validate JSON Format
        run: |
          echo "Validating JSON files..."
          for file in plugins/*.json; do
            echo "Checking $file"
            jq empty "$file" || exit 1
          done
          jq empty plugins.json || exit 1
          echo "✅ All JSON files are valid"
      
      - name: Check Required Fields
        run: |
          echo "Checking required fields..."
          node -e "
            const fs = require('fs');
            const plugins = JSON.parse(fs.readFileSync('plugins.json', 'utf8')).plugins;
            
            const required = ['id', 'name', 'version', 'description', 'author', 'downloadUrl'];
            
            plugins.forEach(plugin => {
              required.forEach(field => {
                if (!plugin[field]) {
                  console.error(\`❌ Plugin \${plugin.id || 'unknown'} missing field: \${field}\`);
                  process.exit(1);
                }
              });
            });
            
            console.log('✅ All required fields present');
          "
      
      - name: Check Download URLs
        run: |
          echo "Checking download URLs..."
          node -e "
            const fs = require('fs');
            const https = require('https');
            const plugins = JSON.parse(fs.readFileSync('plugins.json', 'utf8')).plugins;
            
            async function checkUrl(url) {
              return new Promise((resolve) => {
                https.get(url, { method: 'HEAD' }, (res) => {
                  resolve(res.statusCode === 200);
                }).on('error', () => resolve(false));
              });
            }
            
            (async () => {
              for (const plugin of plugins) {
                const valid = await checkUrl(plugin.downloadUrl);
                if (!valid) {
                  console.error(\`❌ Invalid download URL for \${plugin.id}: \${plugin.downloadUrl}\`);
                  process.exit(1);
                }
                console.log(\`✅ \${plugin.id}: URL valid\`);
              }
            })();
          "
      
      - name: Comment on PR
        if: success()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ 验证通过！插件配置正确，可以合并。'
            })
```

### 自动更新统计

创建 `.github/workflows/update-stats.yml`：

```yaml
name: Update Plugin Stats

on:
  schedule:
    - cron: '0 0 * * *'  # 每天更新
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Update Download Counts
        run: |
          # 从 GitHub API 获取下载统计
          # 更新 plugins.json
          echo "Updating stats..."
      
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add plugins.json
          git commit -m "chore: Update plugin stats" || exit 0
          git push
```

## 📊 监控和分析

### 使用 GitHub Insights

- **流量统计**：查看仓库访问量
- **克隆统计**：查看下载次数
- **PR 统计**：查看提交活跃度

### 自定义分析

创建 `scripts/analytics.js`：

```javascript
const fs = require('fs')

const plugins = JSON.parse(fs.readFileSync('plugins.json', 'utf8')).plugins

console.log('📊 插件市场统计')
console.log('================')
console.log(`总插件数: ${plugins.length}`)
console.log(`总下载量: ${plugins.reduce((sum, p) => sum + p.downloads, 0)}`)
console.log(`平均评分: ${(plugins.reduce((sum, p) => sum + p.rating, 0) / plugins.length).toFixed(2)}`)

const categories = {}
plugins.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1
})

console.log('\n分类统计:')
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`)
})
```

## 🔒 安全措施

### 1. 代码审查

所有 PR 必须经过审查：
- 检查恶意代码
- 验证权限声明
- 测试插件功能

### 2. 自动扫描

使用 GitHub Security 功能：
- Dependabot 扫描依赖
- CodeQL 代码分析
- Secret scanning

### 3. 签名验证

未来可以添加插件签名：
```json
{
  "signature": "SHA256:...",
  "publicKey": "..."
}
```

## 💡 最佳实践

### 1. 版本管理

使用 Git 标签管理版本：
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. 缓存策略

jsDelivr 缓存时间：
- 默认：12 小时
- 强制刷新：添加 `?v=timestamp`

### 3. 备份策略

定期备份插件列表：
```bash
# 每周备份
cp plugins.json backups/plugins-$(date +%Y%m%d).json
```

## 🚀 扩展功能

### 1. 插件评分系统

添加评分 API：
```typescript
// POST /api/plugins/:id/rate
{
  "rating": 5,
  "comment": "很棒的插件！"
}
```

### 2. 插件搜索优化

使用 Algolia 或 Meilisearch：
```typescript
const searchClient = algoliasearch('APP_ID', 'API_KEY')
const index = searchClient.initIndex('plugins')
```

### 3. 插件分析

添加 Google Analytics：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## 📞 获取帮助

- **文档**：[插件市场指南](./MARKETPLACE_GUIDE.md)
- **Issues**：[GitHub Issues](https://github.com/yourname/unihub-plugins/issues)
- **Discord**：[加入社区](https://discord.gg/unihub)

---

**祝你部署顺利！** 🎉
