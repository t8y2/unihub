# 📊 UniHub 插件统计系统

为 UniHub 插件市场添加实时的下载量和评分统计功能。

## 🎯 功能

- ✅ 实时下载量统计
- ✅ 用户评分系统（1-5星）
- ✅ 平均评分计算
- ✅ 完全免费（使用 GitHub Gist + Vercel）

## 🚀 快速开始

### 开发者使用

如果你只是想贡献代码，直接使用官方统计服务：

```bash
# 复制环境变量模板
cp .env.example .env

# 已经配置好官方 API，直接启动即可
npm run dev
```

### 部署自己的统计服务

如果你想 fork 并发布自己的版本：

1. **创建 GitHub Gist**
   - 访问 https://gist.github.com
   - 创建文件：`unihub-plugin-stats.json`，内容：`{}`
   - 复制 Gist ID

2. **创建 GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 权限：只勾选 `gist`
   - 复制 Token

3. **部署到 Vercel**

   ```bash
   cd stats-api
   npm install
   npm install -g vercel
   vercel login
   vercel

   # 设置环境变量
   vercel env add GIST_ID production
   vercel env add GITHUB_TOKEN production

   # 生产部署
   vercel --prod
   ```

4. **配置主项目**
   ```bash
   # 编辑 .env
   VITE_STATS_API_URL=https://your-stats-api.vercel.app/api
   ```

## 📖 API 文档

详见 [stats-api/README.md](./stats-api/README.md)

## 🔒 安全性

- ✅ `.env` 已在 `.gitignore`，不会被提交
- ✅ 敏感信息（Token、Gist ID）存储在 Vercel 环境变量
- ✅ API 使用 CORS 保护

## 💰 成本

完全免费！GitHub Gist + Vercel 免费额度足够支持数千用户。

## 📄 许可证

MIT License
