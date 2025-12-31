# 插件市场部署方案

## 🎯 两种部署方案

### 方案 A：使用当前仓库（推荐前期）

#### 适用场景
- ✅ 开发和测试阶段
- ✅ 快速验证功能
- ✅ 团队内部使用
- ✅ 插件数量较少（< 10 个）

#### 配置步骤

1. **确保 marketplace 目录已推送到 GitHub**
   ```bash
   git add marketplace/
   git commit -m "Add plugin marketplace"
   git push
   ```

2. **更新 CDN URL**
   
   编辑 `src/renderer/src/components/PluginMarketplace.vue`：
   ```typescript
   const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub@main/marketplace/plugins.json'
   ```

3. **测试**
   ```bash
   pnpm dev
   # 打开「插件管理」→「插件商店」
   ```

#### 优点
- ⚡ 快速开始，无需额外配置
- 🔄 插件和应用代码在一起，方便同步开发
- 🧪 适合快速迭代和测试

#### 缺点
- ⚠️ 插件仓库和应用代码耦合
- ⚠️ 每次应用更新都会刷新 CDN 缓存
- ⚠️ 不够专业，不适合大规模使用

---

### 方案 B：独立插件仓库（推荐正式发布）

#### 适用场景
- ✅ 正式发布后
- ✅ 接受社区插件提交
- ✅ 插件数量较多（> 10 个）
- ✅ 需要独立的版本控制

#### 配置步骤

1. **创建独立仓库**
   ```bash
   # 在 GitHub 创建新仓库 "unihub-plugins"
   
   mkdir unihub-plugins
   cd unihub-plugins
   git init
   
   # 复制 marketplace 目录内容
   cp -r /path/to/unihub/marketplace/* .
   
   # 推送到 GitHub
   git add .
   git commit -m "Initial commit: UniHub Plugin Marketplace"
   git remote add origin https://github.com/你的用户名/unihub-plugins.git
   git push -u origin main
   ```

2. **更新 CDN URL**
   
   编辑 `src/renderer/src/components/PluginMarketplace.vue`：
   ```typescript
   const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub-plugins@main/plugins.json'
   ```

3. **配置仓库**
   
   在 `unihub-plugins` 仓库添加：
   - `.github/PULL_REQUEST_TEMPLATE.md` - PR 模板
   - `.github/workflows/validate.yml` - 自动验证
   - `.github/ISSUE_TEMPLATE/` - Issue 模板

4. **测试**
   ```bash
   # 等待 jsDelivr 索引（5-10 分钟）
   curl https://cdn.jsdelivr.net/gh/你的用户名/unihub-plugins@main/plugins.json
   
   # 在应用中测试
   pnpm dev
   ```

#### 优点
- 🎯 插件和应用分离，更专业
- 🔄 独立的版本控制和发布节奏
- 👥 社区可以独立提交插件 PR
- 💾 CDN 缓存更稳定
- 📊 可以独立统计插件下载量

#### 缺点
- ⚠️ 需要额外维护一个仓库
- ⚠️ 初期配置稍微复杂
- ⚠️ 需要同步更新两个仓库

---

## 🚀 推荐路线

### 阶段 1：开发测试（现在）

使用 **方案 A**（当前仓库）

```typescript
// PluginMarketplace.vue
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub@main/marketplace/plugins.json'
```

**理由：**
- 快速验证功能
- 方便调试和修改
- 无需额外维护

### 阶段 2：内测发布

继续使用 **方案 A**，但开始准备迁移

**准备工作：**
1. 完善插件提交流程
2. 编写插件审核标准
3. 准备独立仓库的文档

### 阶段 3：正式发布

迁移到 **方案 B**（独立仓库）

**迁移步骤：**
1. 创建 `unihub-plugins` 仓库
2. 复制 `marketplace/` 内容
3. 更新应用中的 CDN URL
4. 发布新版本应用
5. 公告迁移信息

---

## 📊 方案对比表

| 特性 | 方案 A（当前仓库） | 方案 B（独立仓库） |
|------|-------------------|-------------------|
| 配置难度 | ⭐ 简单 | ⭐⭐ 中等 |
| 维护成本 | ⭐ 低 | ⭐⭐ 中等 |
| 专业程度 | ⭐⭐ 一般 | ⭐⭐⭐ 专业 |
| 社区友好 | ⭐⭐ 一般 | ⭐⭐⭐ 友好 |
| CDN 稳定性 | ⭐⭐ 一般 | ⭐⭐⭐ 稳定 |
| 适用阶段 | 开发/测试 | 正式发布 |

---

## 🔄 迁移指南（从 A 到 B）

当你准备好迁移时：

### 1. 创建独立仓库
```bash
mkdir unihub-plugins
cd unihub-plugins
git init
cp -r /path/to/unihub/marketplace/* .
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/unihub-plugins.git
git push -u origin main
```

### 2. 更新应用配置
```typescript
// 修改 PluginMarketplace.vue
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/你的用户名/unihub-plugins@main/plugins.json'
```

### 3. 发布新版本
```bash
# 在 unihub 仓库
git add src/renderer/src/components/PluginMarketplace.vue
git commit -m "Update marketplace URL to independent repo"
npm version patch
git push
```

### 4. 通知用户
在 Release Notes 中说明：
```markdown
## 🎉 插件市场升级

插件市场已迁移到独立仓库，提供更好的服务：

- 🚀 更快的加载速度
- 🔄 更稳定的更新
- 👥 更方便的社区贡献

新的插件仓库：https://github.com/你的用户名/unihub-plugins
```

---

## 💡 最佳实践

### 开发阶段（方案 A）
- ✅ 使用 `@main` 分支，实时更新
- ✅ 在 `marketplace/plugins.json` 中添加测试插件
- ✅ 频繁测试和迭代

### 正式发布（方案 B）
- ✅ 使用 Git 标签（`@v1.0.0`），稳定版本
- ✅ 建立插件审核流程
- ✅ 配置 GitHub Actions 自动验证
- ✅ 定期更新插件统计

---

## 🎯 当前建议

**现在就用方案 A 开始！**

1. 确保 `marketplace/` 已推送到 GitHub
2. 更新 `MARKETPLACE_URL` 为当前仓库
3. 测试功能
4. 等正式发布时再考虑迁移到方案 B

**5 分钟就能跑起来！** 🚀
