# 📋 接下来要做的事情

## ✅ 已完成

- [x] 删除 `plugins/official-plugins.json`，统一使用 `marketplace/plugins.json`
- [x] 重命名 `stats-api` → `plugin-api`
- [x] 创建自动同步脚本 `scripts/sync-plugins-to-gist.js`
- [x] 添加新的 API 端点 `/api/plugins`
- [x] 更新前端支持从 API 获取插件列表
- [x] 添加降级逻辑（API → CDN）
- [x] 完善文档

## 🔄 需要你做的事情

### 1. 更新 Vercel 部署 ⚠️ 重要

你之前部署的是 `stats-api`，现在需要更新：

```bash
cd plugin-api
vercel link  # 链接到现有的 stats-api 项目
vercel --prod  # 部署更新
```

**或者**重新部署（会得到新的 URL）：

```bash
cd plugin-api
vercel --prod
```

如果重新部署，记得更新 `.env` 中的 `VITE_PLUGIN_API_URL`。

### 2. 配置 Vercel 环境变量

在 Vercel Dashboard 中确保配置了：

- `GIST_ID`: 你的 GitHub Gist ID
- `GITHUB_TOKEN`: 你的 GitHub Personal Access Token

### 3. 初始化 Gist 文件

访问你的 Gist，确保有两个文件：

**文件 1: `unihub-plugins.json`**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-03T00:00:00Z",
  "plugins": []
}
```

**文件 2: `unihub-plugin-stats.json`**

```json
{}
```

如果没有，手动创建或运行同步脚本：

```bash
node scripts/sync-plugins-to-gist.js
```

### 4. 更新本地 .env 文件

确保 `.env` 文件包含：

```env
GIST_ID=your_gist_id
GITHUB_TOKEN=your_github_token
VITE_PLUGIN_API_URL=https://your-vercel-url.vercel.app/api
```

### 5. 测试完整流程

```bash
# 1. 测试同步脚本
node scripts/sync-plugins-to-gist.js

# 2. 测试 API
curl https://your-vercel-url.vercel.app/api/plugins

# 3. 测试前端
pnpm dev
# 打开插件商店，检查是否能看到插件列表

# 4. 测试提交流程
git add marketplace/plugins.json
git commit -m "test: update plugins"
# 应该看到同步成功的消息
```

### 6. 更新 marketplace/plugins.json

将你现有的插件信息添加到 `marketplace/plugins.json` 中。

### 7. 提交代码

```bash
git add .
git commit -m "refactor: rename stats-api to plugin-api and add auto-sync"
git push
```

## 📝 可选优化

### 添加 GitHub Actions

可以创建 GitHub Actions 自动同步到 Gist（作为 pre-commit hook 的备份）：

```yaml
# .github/workflows/sync-plugins.yml
name: Sync Plugins to Gist

on:
  push:
    paths:
      - 'marketplace/plugins.json'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Sync to Gist
        env:
          GIST_ID: ${{ secrets.GIST_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/sync-plugins-to-gist.js
```

### 添加插件验证

可以在 pre-commit 时验证 `plugins.json` 的格式：

```bash
# 在 .husky/pre-commit 中添加
node scripts/validate-plugins.js
```

## 🎯 验证清单

完成上述步骤后，验证以下功能：

- [ ] API 端点 `/api/plugins` 返回插件列表
- [ ] API 端点 `/api/stats` 返回统计数据
- [ ] 前端插件商店能显示插件列表
- [ ] 修改 `marketplace/plugins.json` 后提交会自动同步到 Gist
- [ ] Gist 中的数据会实时反映到前端

## 📚 相关文档

- [部署指南](./DEPLOYMENT.md) - 完整的部署流程
- [插件市场配置](./marketplace/SETUP.md) - Gist 配置详解
- [Plugin API 文档](./plugin-api/README.md) - API 使用说明

---

**有问题？** 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的故障排查部分。
