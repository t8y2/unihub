# 🚀 快速部署指南

你已经部署了 `stats-api`，现在需要更新到 `plugin-api`。

## 📝 已修复的问题

1. ✅ 修复了 CORS 导出错误
2. ✅ 环境变量重命名：`VITE_STATS_API_URL` → `VITE_PLUGIN_API_URL`
3. ✅ 简化了 API 端点的 CORS 处理

## 🔄 立即部署

### 方式 1：更新现有项目（推荐）

```bash
cd plugin-api
vercel link  # 选择你现有的 stats-api 项目
vercel --prod
```

这样可以保持原来的 URL 不变。

### 方式 2：重新部署

```bash
cd plugin-api
vercel --prod
```

会得到一个新的 URL，需要更新 `.env` 文件。

## ⚙️ 配置 Vercel 环境变量

在 Vercel Dashboard 中配置（如果还没配置）：

1. 进入项目 Settings → Environment Variables
2. 添加：
   - `GIST_ID` = 你的 Gist ID
   - `GITHUB_TOKEN` = 你的 GitHub Token
3. 保存后重新部署：`vercel --prod`

## 🧪 测试部署

```bash
# 测试插件列表 API
curl https://stats-api-nu.vercel.app/api/plugins

# 测试统计 API
curl https://stats-api-nu.vercel.app/api/stats?pluginIds=com.unihub.jwt-tool
```

如果返回数据，说明部署成功！

## 📝 更新本地配置

你的 `.env` 文件已经更新为使用 `VITE_PLUGIN_API_URL`，但值还是指向旧的 URL：

```env
VITE_PLUGIN_API_URL=https://stats-api-nu.vercel.app/api
```

这个 URL 仍然有效（因为我们用 `vercel link` 更新了现有项目）。

## ✅ 验证

```bash
# 1. 测试同步脚本（需要先配置 GIST_ID 和 GITHUB_TOKEN）
node scripts/sync-plugins-to-gist.js

# 2. 启动开发服务器
pnpm dev

# 3. 打开插件商店，检查是否能看到插件列表
```

## 🎯 下一步

1. 在 Vercel 配置 `GIST_ID` 和 `GITHUB_TOKEN`
2. 在本地 `.env` 配置 `GIST_ID` 和 `GITHUB_TOKEN`
3. 运行 `node scripts/sync-plugins-to-gist.js` 初始化 Gist
4. 提交代码测试自动同步

完成！🎉
