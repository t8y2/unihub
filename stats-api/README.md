# UniHub Stats API

插件统计 API 服务，使用 Vercel Serverless + GitHub Gist。

## 快速部署

### 1. 创建 GitHub Gist

- 访问 https://gist.github.com
- 创建文件：`unihub-plugin-stats.json`，内容：`{}`
- 复制 Gist ID

### 2. 创建 GitHub Token

- 访问 https://github.com/settings/tokens
- 权限：只勾选 `gist`
- 复制 Token

### 3. 部署到 Vercel

```bash
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

## API 端点

### GET /api/stats?pluginId=xxx

获取插件统计

### POST /api/download

记录下载

```json
{ "pluginId": "xxx", "userId": "xxx" }
```

### POST /api/rate

提交评分

```json
{ "pluginId": "xxx", "rating": 5, "userId": "xxx" }
```

### GET /api/user-rating?pluginId=xxx&userId=xxx

获取用户评分

## 防护机制

- ✅ 限流：下载 20次/分钟，评分 10次/小时
- ✅ 异常检测：自动识别刷量行为
- ✅ CORS 保护

## 监控

```bash
vercel logs  # 查看日志
```

访问 Gist 查看数据：`https://gist.github.com/username/gist-id`
