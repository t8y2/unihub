# 🚀 插件市场快速开始

## 5 分钟搭建插件市场

### 第 1 步：创建 GitHub 仓库 (2 分钟)

```bash
# 1. 在 GitHub 上创建新仓库 "unihub-plugins"

# 2. 克隆并初始化
git clone https://github.com/yourname/unihub-plugins.git
cd unihub-plugins

# 3. 复制市场文件
cp -r /path/to/unihub/marketplace/* .

# 4. 推送
git add .
git commit -m "Initial commit"
git push origin main
```

### 第 2 步：配置 CDN URL (1 分钟)

编辑 `src/renderer/src/components/PluginMarketplace.vue`：

```typescript
// 第 45 行左右
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json'
//                                              ^^^^^^^^ 改成你的 GitHub 用户名
```

### 第 3 步：测试 (2 分钟)

```bash
# 1. 启动应用
pnpm dev

# 2. 打开插件管理
# 3. 切换到"插件商店"标签
# 4. 应该能看到插件列表！
```

## ✅ 完成！

现在你有了一个完整的插件市场：

- ✅ 零成本（GitHub + jsDelivr 免费）
- ✅ 全球 CDN 加速
- ✅ 自动更新
- ✅ 版本控制

## 📝 下一步

### 添加你的第一个插件

1. **构建插件**
   ```bash
   cd examples/modern-vue-plugin
   npm run build
   npm run package
   ```

2. **发布到 GitHub Release**
   - 创建 Release
   - 上传 `plugin.zip`
   - 复制下载链接

3. **更新市场**
   
   编辑 `plugins.json`：
   ```json
   {
     "plugins": [
       {
         "id": "com.unihub.modern-vue",
         "name": "Modern Vue Plugin",
         "downloadUrl": "https://github.com/yourname/modern-vue-plugin/releases/download/v1.0.0/plugin.zip",
         // ... 其他字段
       }
     ]
   }
   ```

4. **推送更新**
   ```bash
   git add plugins.json
   git commit -m "Add: Modern Vue Plugin"
   git push
   ```

5. **等待 CDN 更新**（约 5-10 分钟）

6. **在应用中刷新**
   - 点击"刷新"按钮
   - 应该能看到新插件！

## 🎯 接受插件提交

### 启用 PR 模板

创建 `.github/PULL_REQUEST_TEMPLATE.md`：

```markdown
## 插件信息

- **插件名称**：
- **插件 ID**：
- **版本**：
- **分类**：
- **作者**：

## 检查清单

- [ ] JSON 格式正确
- [ ] 下载链接有效
- [ ] 插件已测试
- [ ] 遵循开发指南
```

### 启用自动验证

复制 `.github/workflows/validate.yml` 到你的仓库。

## 💡 提示

### 1. 使用 jsDelivr 缓存

```
# 默认 URL（有缓存）
https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json

# 强制刷新（无缓存）
https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json?v=123456
```

### 2. 使用 Git 标签

```bash
# 发布稳定版本
git tag v1.0.0
git push origin v1.0.0

# 使用标签版本的 CDN
https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@v1.0.0/plugins.json
```

### 3. 本地测试

```bash
# 启动本地服务器
cd unihub-plugins
python -m http.server 8000

# 修改 MARKETPLACE_URL
const MARKETPLACE_URL = 'http://localhost:8000/plugins.json'
```

## 🐛 常见问题

### Q: CDN 没有更新？

A: jsDelivr 有缓存，等待 5-10 分钟或使用 `?v=timestamp` 强制刷新。

### Q: 插件下载失败？

A: 检查下载链接是否正确，确保 GitHub Release 是公开的。

### Q: 如何添加截图？

A: 
```bash
# 1. 添加截图到仓库
mkdir -p screenshots/myplugin
cp screenshot.png screenshots/myplugin/1.png

# 2. 更新插件配置
"screenshots": [
  "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/screenshots/myplugin/1.png"
]
```

## 📚 相关文档

- [完整部署指南](./docs/MARKETPLACE_DEPLOYMENT.md)
- [插件市场指南](./docs/MARKETPLACE_GUIDE.md)
- [提交指南](./marketplace/CONTRIBUTING.md)

---

**5 分钟搞定！开始使用吧！** 🎉
