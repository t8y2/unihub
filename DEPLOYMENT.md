# 🚀 UniHub 部署指南

## 📋 部署清单

如果你 fork 了 UniHub 项目，需要完成以下配置才能让插件市场正常工作。

### ✅ 必需步骤

- [ ] 1. 创建 GitHub Gist
- [ ] 2. 创建 GitHub Token
- [ ] 3. 部署 Plugin API 到 Vercel
- [ ] 4. 配置本地环境变量
- [ ] 5. 更新前端 API 地址

---

## 1️⃣ 创建 GitHub Gist

### 步骤

1. 访问 https://gist.github.com
2. 点击 "New gist"
3. 创建两个文件：

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

4. 选择 "Create public gist"
5. 从 URL 复制 Gist ID

   例如：`https://gist.github.com/username/abc123def456`

   Gist ID = `abc123def456`

---

## 2️⃣ 创建 GitHub Token

### 步骤

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写：
   - Note: `UniHub Plugin API`
   - Expiration: `No expiration` 或选择合适的时间
   - 勾选权限：✅ `gist`
4. 点击 "Generate token"
5. **立即复制 token**（只显示一次！）

---

## 3️⃣ 部署 Plugin API 到 Vercel

### 步骤

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

   在 Vercel Dashboard 中：
   - 进入你的项目
   - Settings → Environment Variables
   - 添加：
     - `GIST_ID` = 你的 Gist ID
     - `GITHUB_TOKEN` = 你的 GitHub Token
   - 点击 "Save"

5. **重新部署**（使环境变量生效）

   ```bash
   vercel --prod
   ```

6. **记录 API URL**

   例如：`https://your-project.vercel.app`

---

## 4️⃣ 配置本地环境变量

### 步骤

1. **复制配置模板**

   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件**

   ```env
   GIST_ID=abc123def456
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   VITE_PLUGIN_API_URL=https://your-project.vercel.app/api
   ```

3. **测试同步脚本**

   ```bash
   node scripts/sync-plugins-to-gist.js
   ```

   应该看到：

   ```
   📤 正在同步插件列表到 Gist...
   ✅ 插件列表已同步到 Gist
   ```

---

## 5️⃣ 更新前端 API 地址

### 方式 1：使用环境变量（推荐）

在 `.env` 中配置：

```env
VITE_PLUGIN_API_URL=https://your-project.vercel.app/api
```

### 方式 2：修改代码

如果你想硬编码 API 地址，编辑 `src/renderer/src/constants/index.ts`：

```typescript
export const MARKETPLACE_URL = 'https://your-project.vercel.app/api/plugins'
```

---

## ✅ 验证部署

### 1. 测试 API

```bash
# 测试插件列表
curl https://your-project.vercel.app/api/plugins

# 测试统计数据
curl https://your-project.vercel.app/api/stats?pluginIds=com.unihub.jwt-tool
```

### 2. 测试同步

```bash
# 修改 marketplace/plugins.json
# 提交代码
git add marketplace/plugins.json
git commit -m "test: update plugins"

# 应该看到同步成功的消息
```

### 3. 测试前端

```bash
# 启动应用
pnpm dev

# 打开插件商店，应该能看到插件列表
```

---

## 🔧 故障排查

### API 返回 500 错误

**原因**：Vercel 环境变量未配置

**解决**：

1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确保 `GIST_ID` 和 `GITHUB_TOKEN` 已配置
3. 重新部署：`vercel --prod`

### 前端显示"加载插件列表失败"

**原因**：API URL 配置错误

**解决**：

1. 检查 `.env` 中的 `VITE_PLUGIN_API_URL`
2. 确保 URL 格式正确（不要包含 `/plugins`）
3. 重启开发服务器：`pnpm dev`

### 同步脚本提示"未配置"

**原因**：本地 `.env` 文件未配置

**解决**：

1. 确保 `.env` 文件存在
2. 检查 `GIST_ID` 和 `GITHUB_TOKEN` 是否填写
3. 重新运行：`node scripts/sync-plugins-to-gist.js`

---

## 📚 相关文档

- [插件市场配置指南](./marketplace/SETUP.md)
- [Plugin API 文档](./plugin-api/README.md)
- [Vercel 文档](https://vercel.com/docs)

---

## 🎯 快速开始（已部署用户）

如果你已经部署了 `stats-api`，现在改名为 `plugin-api`：

```bash
# 1. 重命名已完成（stats-api → plugin-api）

# 2. 更新 Vercel 项目
cd plugin-api
vercel link  # 链接到现有项目
vercel --prod  # 部署更新

# 3. 更新本地配置
# 编辑 .env，确保 VITE_PLUGIN_API_URL 指向正确的 URL

# 4. 测试
node scripts/sync-plugins-to-gist.js
pnpm dev
```

完成！🎉
