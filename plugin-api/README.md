# UniHub Plugin API

插件市场后端服务，提供插件列表和统计数据。

## 📡 API 端点

### 1. 获取插件列表

```
GET /api/plugins
```

从 GitHub Gist 获取最新的插件列表。

**响应示例**：

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-03T00:00:00Z",
  "plugins": [
    {
      "id": "com.unihub.jwt-tool",
      "name": "JWT 工具",
      "version": "1.0.0",
      "description": "JWT 编码解码与验证工具",
      "author": {
        "name": "UniHub Team",
        "email": "team@unihub.dev"
      },
      "downloadUrl": "https://...",
      "downloads": 156,
      "rating": 4.9
    }
  ]
}
```

### 2. 记录下载统计

```
POST /api/download
Content-Type: application/json

{
  "pluginId": "com.unihub.jwt-tool"
}
```

### 3. 提交评分

```
POST /api/rate
Content-Type: application/json

{
  "pluginId": "com.unihub.jwt-tool",
  "rating": 5,
  "userId": "user-fingerprint"
}
```

### 4. 获取统计数据

```
GET /api/stats?pluginIds=com.unihub.jwt-tool,com.unihub.h5-formatter
```

**响应示例**：

```json
{
  "com.unihub.jwt-tool": {
    "downloads": 156,
    "averageRating": 4.9,
    "totalRatings": 23
  }
}
```

## 🚀 部署到 Vercel

### 首次部署

1. **安装 Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**

   ```bash
   vercel login
   ```

3. **部署**

   ```bash
   cd plugin-api
   vercel --prod
   ```

4. **配置环境变量**

   在 Vercel 项目设置中添加：
   - `GIST_ID`: 你的 GitHub Gist ID
   - `GITHUB_TOKEN`: 你的 GitHub Personal Access Token

### 更新已部署的项目

如果你之前部署的是 `stats-api`，现在改名为 `plugin-api`：

**选项 1：重新部署（推荐）**

```bash
cd plugin-api
vercel --prod
```

这会创建一个新的 Vercel 项目。然后：

1. 在 Vercel Dashboard 删除旧的 `stats-api` 项目
2. 更新前端的 `VITE_PLUGIN_API_URL` 环境变量为新的 URL

**选项 2：保持原项目名**

如果想保持原来的 Vercel 项目和 URL：

```bash
cd plugin-api
vercel link  # 链接到现有的 stats-api 项目
vercel --prod
```

## 🔧 本地开发

```bash
# 安装依赖
cd plugin-api
npm install

# 配置环境变量
cp ../.env.example .env
# 编辑 .env 填入 GIST_ID 和 GITHUB_TOKEN

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000/api/plugins 测试。

## 📝 环境变量

在 Vercel 项目设置中配置：

- `GIST_ID`: GitHub Gist ID（必需）
- `GITHUB_TOKEN`: GitHub Personal Access Token，需要 `gist` 权限（必需）

## 🔒 安全性

- 使用速率限制防止滥用
- CORS 配置允许来自任何域的请求
- GitHub Token 仅用于读写 Gist，不会暴露给客户端

## 📊 数据存储

所有数据存储在 GitHub Gist 中：

- `unihub-plugins.json`: 插件列表（由 pre-commit hook 自动同步）
- `unihub-plugin-stats.json`: 统计数据（下载量、评分等）

## 🔄 数据流

```
开发者提交代码
  ↓
pre-commit hook
  ↓
同步 plugins.json 到 Gist
  ↓
Vercel API 从 Gist 读取
  ↓
客户端获取最新数据
```

## 📚 相关文档

- [插件市场配置指南](../marketplace/SETUP.md)
- [Vercel 文档](https://vercel.com/docs)
