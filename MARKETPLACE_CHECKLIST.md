# ✅ 插件市场实施检查清单

## 📋 准备工作

### 1. 代码文件

- [x] `src/renderer/src/components/PluginMarketplace.vue` - 市场 UI 组件
- [x] `src/renderer/src/components/PluginStore.vue` - 商店容器
- [x] `src/renderer/src/components/PermissionDialog.vue` - 权限对话框
- [x] `src/renderer/src/components/PluginManagementPage.vue` - 已集成

### 2. 市场文件

- [x] `marketplace/plugins.json` - 插件列表
- [x] `marketplace/CONTRIBUTING.md` - 提交指南
- [x] `marketplace/README.md` - 市场说明

### 3. 文档

- [x] `docs/MARKETPLACE_GUIDE.md` - 完整指南
- [x] `docs/MARKETPLACE_DEPLOYMENT.md` - 部署指南
- [x] `MARKETPLACE_QUICKSTART.md` - 快速开始
- [x] `MARKETPLACE_SUMMARY.md` - 总结文档

---

## 🚀 部署步骤

### 第 1 步：创建 GitHub 仓库

- [ ] 在 GitHub 创建 `unihub-plugins` 仓库
- [ ] 设置为公开仓库
- [ ] 添加 README 和 LICENSE

```bash
# 命令
mkdir unihub-plugins
cd unihub-plugins
git init
cp -r /path/to/unihub/marketplace/* .
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/unihub-plugins.git
git push -u origin main
```

### 第 2 步：配置 CDN

- [ ] 等待 jsDelivr 索引（约 5-10 分钟）
- [ ] 测试 CDN URL：`https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json`
- [ ] 确认返回正确的 JSON

### 第 3 步：更新应用配置

- [ ] 编辑 `src/renderer/src/components/PluginMarketplace.vue`
- [ ] 更新 `MARKETPLACE_URL` 为你的 CDN URL
- [ ] 保存文件

```typescript
// 第 45 行
const MARKETPLACE_URL = 'https://cdn.jsdelivr.net/gh/yourname/unihub-plugins@main/plugins.json'
```

### 第 4 步：测试

- [ ] 运行 `pnpm dev`
- [ ] 打开「插件管理」
- [ ] 切换到「插件商店」标签
- [ ] 确认能看到插件列表
- [ ] 测试搜索功能
- [ ] 测试分类筛选
- [ ] 测试安装功能

---

## 🔧 可选配置

### GitHub Actions

- [ ] 创建 `.github/workflows/validate.yml`
- [ ] 测试 PR 验证
- [ ] 配置自动评论

### 插件提交模板

- [ ] 创建 `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] 创建 `.github/ISSUE_TEMPLATE/plugin-submission.md`

### 统计分析

- [ ] 添加 Google Analytics
- [ ] 创建统计脚本
- [ ] 定期更新下载数

---

## 📝 添加第一个插件

### 1. 准备插件

- [ ] 构建插件：`npm run build`
- [ ] 打包插件：`npm run package`
- [ ] 测试插件：本地安装测试

### 2. 发布到 GitHub

- [ ] 创建插件仓库
- [ ] 推送代码
- [ ] 创建 Release
- [ ] 上传 `plugin.zip`
- [ ] 复制下载链接

### 3. 更新市场

- [ ] 编辑 `plugins.json`
- [ ] 添加插件信息
- [ ] 验证 JSON 格式
- [ ] 提交并推送

```bash
git add plugins.json
git commit -m "Add: My First Plugin"
git push
```

### 4. 验证

- [ ] 等待 CDN 更新（5-10 分钟）
- [ ] 在应用中刷新
- [ ] 确认能看到新插件
- [ ] 测试安装

---

## 🎯 功能测试

### 基础功能

- [ ] 加载插件列表
- [ ] 显示插件卡片
- [ ] 显示插件图标
- [ ] 显示插件信息
- [ ] 显示分类标签
- [ ] 显示关键词

### 搜索和筛选

- [ ] 按名称搜索
- [ ] 按描述搜索
- [ ] 按关键词搜索
- [ ] 按分类筛选
- [ ] 组合搜索

### 插件详情

- [ ] 打开详情对话框
- [ ] 显示完整信息
- [ ] 显示权限列表
- [ ] 显示链接
- [ ] 关闭对话框

### 安装流程

- [ ] 点击安装按钮
- [ ] 显示权限对话框
- [ ] 显示风险等级
- [ ] 确认安装
- [ ] 显示安装进度
- [ ] 安装成功提示
- [ ] 安装失败提示

### 错误处理

- [ ] 网络错误提示
- [ ] 加载失败提示
- [ ] 安装失败提示
- [ ] 重试功能

### UI/UX

- [ ] 响应式布局
- [ ] 深色模式
- [ ] 加载动画
- [ ] 过渡动画
- [ ] 悬停效果

---

## 🐛 常见问题排查

### 问题 1：CDN 没有更新

- [ ] 检查 GitHub 仓库是否公开
- [ ] 等待 5-10 分钟
- [ ] 尝试强制刷新：添加 `?v=timestamp`
- [ ] 检查 jsDelivr 状态

### 问题 2：插件列表为空

- [ ] 检查 `plugins.json` 格式
- [ ] 检查 CDN URL 是否正确
- [ ] 检查网络连接
- [ ] 查看浏览器控制台错误

### 问题 3：安装失败

- [ ] 检查下载链接是否有效
- [ ] 检查插件包格式
- [ ] 检查权限配置
- [ ] 查看错误信息

### 问题 4：权限对话框不显示

- [ ] 检查 `PermissionDialog.vue` 是否导入
- [ ] 检查 `showPermissionDialog` 状态
- [ ] 检查权限数组是否为空

---

## 📊 性能优化

### 加载优化

- [ ] 使用 CDN 加速
- [ ] 启用浏览器缓存
- [ ] 压缩 JSON 文件
- [ ] 懒加载图片

### 搜索优化

- [ ] 防抖处理
- [ ] 本地缓存
- [ ] 索引优化

### UI 优化

- [ ] 虚拟滚动（大量插件时）
- [ ] 图片懒加载
- [ ] 骨架屏

---

## 🎉 发布清单

### 代码

- [ ] 所有功能已测试
- [ ] 没有控制台错误
- [ ] 代码已格式化
- [ ] 类型检查通过

### 文档

- [ ] README 已更新
- [ ] 文档已完善
- [ ] 示例已添加
- [ ] FAQ 已创建

### 市场

- [ ] GitHub 仓库已创建
- [ ] CDN 已配置
- [ ] 至少有 1 个插件
- [ ] 提交指南已发布

### 宣传

- [ ] 发布公告
- [ ] 更新官网
- [ ] 社交媒体宣传
- [ ] 邀请开发者

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [快速开始指南](./MARKETPLACE_QUICKSTART.md)
2. 查看 [完整文档](./docs/MARKETPLACE_GUIDE.md)
3. 搜索 [GitHub Issues](https://github.com/yourname/unihub/issues)
4. 提交新 Issue

---

## ✅ 完成确认

当你完成所有步骤后：

- [ ] 市场可以正常访问
- [ ] 插件可以正常安装
- [ ] 文档已经完善
- [ ] 社区已经通知

**恭喜！你的插件市场已经上线！** 🎉

---

**下一步**：邀请开发者提交插件，打造繁荣的生态！
