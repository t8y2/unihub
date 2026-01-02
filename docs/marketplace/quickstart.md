# 🚀 插件市场快速开始

5 分钟搭建零成本插件市场（GitHub + jsDelivr CDN）

## 方案选择

### 方案 A：使用当前仓库（推荐开发阶段）

**优点：** 快速开始，无需额外配置  
**适合：** 开发测试阶段

```typescript
// PluginMarketplace.vue
const MARKETPLACE_URL =
  'https://cdn.jsdelivr.net/gh/你的用户名/unihub@main/marketplace/plugins.json'
```

### 方案 B：独立插件仓库（推荐正式发布）

**优点：** 更专业，方便社区贡献  
**适合：** 正式发布后

```bash
# 创建独立仓库
mkdir unihub-plugins
cd unihub-plugins
git init
cp -r /path/to/unihub/marketplace/* .
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/unihub-plugins.git
git push -u origin main
```

```typescript
// PluginMarketplace.vue
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub-plugins@main/plugins.json'
```

## 快速部署（方案 A）

### 1. 推送到 GitHub (1 分钟)

```bash
git add marketplace/
git commit -m "Add plugin marketplace"
git push
```

### 2. 配置 CDN URL (1 分钟)

编辑 `src/renderer/src/components/PluginMarketplace.vue` 第 47 行：

```typescript
const MARKETPLACE_URL =
  'https://cdn.jsdelivr.net/gh/你的用户名/unihub@main/marketplace/plugins.json'
//                                              ^^^^^^^^ 改成你的 GitHub 用户名
```

### 3. 测试 (2 分钟)

```bash
pnpm dev
# 打开「插件管理」→「插件商店」标签
```

## 添加插件

### 1. 构建插件

```bash
cd examples/modern-vue-plugin
npm run build
npm run package
```

### 2. 发布到 GitHub Release

- 创建 Release
- 上传 `plugin.zip`
- 复制下载链接

### 3. 更新插件列表

编辑 `marketplace/plugins.json`，添加插件信息。

### 4. 推送更新

```bash
git add marketplace/plugins.json
git commit -m "Add: Modern Vue Plugin"
git push
```

### 5. 等待 CDN 更新（5-10 分钟）

jsDelivr 会自动索引更新。

## 常见问题

**Q: CDN 没有更新？**  
A: 等待 5-10 分钟或使用 `?v=timestamp` 强制刷新。

**Q: 插件下载失败？**  
A: 检查下载链接是否正确，确保 GitHub Release 是公开的。

## 相关文档

- [插件市场指南](./docs/MARKETPLACE_GUIDE.md)
- [市场部署指南](./docs/MARKETPLACE_DEPLOYMENT.md)
- [提交指南](./marketplace/CONTRIBUTING.md)

---

**5 分钟搞定！** 🎉
