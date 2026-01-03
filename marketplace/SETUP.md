# 插件市场 Gist 同步配置指南

## 🎯 功能说明

当你修改 `marketplace/plugins.json` 并提交代码时，会自动同步到 GitHub Gist，插件商店会实时从 Gist 获取最新的插件列表。

## 📋 配置步骤

### 1. 创建 GitHub Gist

1. 访问 https://gist.github.com
2. 点击 "New gist"
3. 文件名填写：`unihub-plugins.json`
4. 内容可以先留空或复制 `marketplace/plugins.json` 的内容
5. 选择 "Create public gist" 或 "Create secret gist"
6. 创建后，从 URL 中复制 Gist ID

   例如：`https://gist.github.com/username/abc123def456`

   Gist ID 就是：`abc123def456`

### 2. 创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写 Note（例如：UniHub Gist Sync）
4. 勾选权限：
   - ✅ `gist` - Create gists
5. 点击 "Generate token"
6. **立即复制 token**（只显示一次！）

### 3. 配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

填入你的配置：

```env
GIST_ID=abc123def456
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
VITE_PLUGIN_API_URL=https://plugin-api.vercel.app/api
```

### 4. 测试同步

```bash
# 手动运行同步脚本
node scripts/sync-plugins-to-gist.js
```

如果配置正确，你会看到：

```
📤 正在同步插件列表到 Gist...
✅ 插件列表已同步到 Gist
   Gist ID: abc123def456
   文件名: unihub-plugins.json
```

### 5. 验证同步

访问你的 Gist 页面，应该能看到 `unihub-plugins.json` 文件已更新。

## 🔄 工作流程

```
修改 marketplace/plugins.json
  ↓
git add & git commit
  ↓
pre-commit hook 触发
  ↓
自动同步到 Gist
  ↓
前端从 Gist API 获取最新列表
```

## 🚨 注意事项

1. **不要提交 .env 文件**
   - `.env` 已在 `.gitignore` 中
   - 只提交 `.env.example` 作为模板

2. **Token 安全**
   - 不要分享你的 GitHub Token
   - 如果泄露，立即在 GitHub 删除并重新生成

3. **Gist 权限**
   - Public Gist：任何人都可以访问
   - Secret Gist：只有知道链接的人可以访问
   - 推荐使用 Public Gist（插件列表本身是公开的）

4. **同步失败不会阻止提交**
   - 如果 Gist 同步失败，会显示警告但不会阻止提交
   - 可以稍后手动运行同步脚本

## 🔧 故障排查

### 问题：提示 "未配置 GIST_ID 或 GITHUB_TOKEN"

**解决**：检查 `.env` 文件是否存在且配置正确

### 问题：GitHub API 错误 401

**解决**：Token 无效或过期，重新生成 Token

### 问题：GitHub API 错误 404

**解决**：Gist ID 错误，检查 Gist URL

### 问题：同步成功但前端看不到更新

**解决**：

1. 检查 `VITE_PLUGIN_API_URL` 是否配置正确
2. 确保 plugin-api 已部署到 Vercel
3. 在 Vercel 项目设置中配置 GIST_ID 和 GITHUB_TOKEN
4. 检查浏览器控制台是否有错误

## 📚 相关文档

- [插件市场 README](./README.md)
- [贡献指南](./CONTRIBUTING.md)
