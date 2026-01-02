# UniHub Stats API

插件统计 API 服务，使用 Vercel Serverless + GitHub Gist。

## 部署步骤

### 1. 创建 GitHub Gist

1. 访问 https://gist.github.com
2. 创建新 Gist：
   - 文件名：`unihub-plugin-stats.json`
   - 内容：`{}`
   - 设置为 Public 或 Secret（推荐 Secret）
3. 记录 Gist ID（URL 中的字符串）

### 2. 创建 GitHub Token

1. 访问 https://github.com/settings/tokens
2. Generate new token (classic)
3. 权限选择：`gist`
4. 生成并保存 token

### 3. 安装依赖

```bash
cd stats-api
npm install
```

### 4. 本地测试（可选）

创建 `.env` 文件：

```env
GIST_ID=your_gist_id_here
GITHUB_TOKEN=your_github_token_here
```

运行开发服务器：

```bash
npm run dev
```

测试 API：

```bash
# 获取统计
curl http://localhost:3000/api/stats?pluginId=com.unihub.test

# 记录下载
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"pluginId":"com.unihub.test","userId":"user_123"}'

# 提交评分
curl -X POST http://localhost:3000/api/rate \
  -H "Content-Type: application/json" \
  -d '{"pluginId":"com.unihub.test","rating":5,"userId":"user_123"}'
```

### 5. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 首次部署
vercel

# 设置环境变量
vercel env add GIST_ID
# 输入你的 Gist ID

vercel env add GITHUB_TOKEN
# 输入你的 GitHub Token

# 生产部署
vercel --prod
```

### 6. 获取 API 地址

部署成功后，Vercel 会给你一个地址，类似：

```
https://your-project.vercel.app
```

记录这个地址，在主项目中配置。

## API 端点

### GET /api/stats

获取插件统计信息

**参数**：

- `pluginId` (string, required): 插件 ID

**响应**：

```json
{
  "downloads": 156,
  "averageRating": 4.9,
  "ratingCount": 10,
  "lastUpdated": "2024-12-31T00:00:00Z"
}
```

### POST /api/download

记录插件下载

**Body**：

```json
{
  "pluginId": "com.unihub.test",
  "userId": "user_123"
}
```

**响应**：

```json
{
  "success": true,
  "downloads": 157
}
```

### POST /api/rate

提交插件评分

**Body**：

```json
{
  "pluginId": "com.unihub.test",
  "rating": 5,
  "userId": "user_123"
}
```

**响应**：

```json
{
  "success": true,
  "averageRating": 4.9,
  "ratingCount": 11
}
```

### GET /api/user-rating

获取用户评分

**参数**：

- `pluginId` (string, required): 插件 ID
- `userId` (string, required): 用户 ID

**响应**：

```json
{
  "rating": 5,
  "timestamp": "2024-12-31T00:00:00Z"
}
```

## 维护

### 查看日志

```bash
vercel logs
```

### 更新部署

```bash
vercel --prod
```

### 备份数据

定期备份 Gist 数据：

```bash
curl https://api.github.com/gists/YOUR_GIST_ID \
  -H "Authorization: token YOUR_TOKEN" \
  > backup-$(date +%Y%m%d).json
```

## 故障排查

### API 返回 500 错误

1. 检查环境变量是否正确设置
2. 检查 GitHub Token 权限
3. 查看 Vercel 日志：`vercel logs`

### Gist 更新失败

1. 检查 Token 是否过期
2. 检查 Gist ID 是否正确
3. 检查网络连接

### 响应太慢

1. 考虑添加 CDN 缓存
2. 使用 Vercel Edge Functions
3. 迁移到数据库方案（Supabase）
