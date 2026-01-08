# 发布插件

本指南介绍如何将插件发布到 UniHub 插件商店。

## 发布前检查

在发布前，请确保：

- [ ] `package.json` 信息完整准确
- [ ] 插件在浅色和深色主题下都能正常工作
- [ ] 所有功能都经过测试
- [ ] 只申请了必需的权限
- [ ] 没有包含敏感信息（API 密钥等）
- [ ] 代码不包含恶意行为

## 打包插件

### 1. 构建生产版本

如果使用构建工具：

```bash
pnpm build
```

### 2. 创建 ZIP 包

```bash
# 进入构建输出目录
cd dist

# 创建 ZIP 包
zip -r ../my-plugin-1.0.0.zip .
```

ZIP 包结构应该是：

```
my-plugin-1.0.0.zip
├── package.json     # 在根目录
├── index.html
├── assets/
│   ├── style.css
│   └── ...
└── js/
    └── main.js
```

::: warning 注意

- `package.json` 必须在 ZIP 根目录
- 不要包含 `node_modules`
- 不要包含源代码（如 `.ts` 文件）
  :::

### 3. 验证 ZIP 包

解压验证结构是否正确：

```bash
unzip -l my-plugin-1.0.0.zip
```

## 上传到插件商店

### 方式一：GitHub 发布

1. 在 GitHub 创建 Release
2. 上传 ZIP 包作为 Release Asset
3. 提交插件信息到 UniHub 插件仓库

### 方式二：直接提交

1. Fork [unihub-plugins](https://github.com/t8y2/unihub) 仓库
2. 在 `marketplace/plugins.json` 中添加插件信息
3. 提交 Pull Request

## 插件信息格式

在 `marketplace/plugins.json` 中添加：

```json
{
  "id": "com.example.my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "开发者名称",
    "email": "developer@example.com",
    "url": "https://example.com"
  },
  "icon": "https://example.com/icon.svg",
  "category": "tool",
  "keywords": ["keyword1", "keyword2"],
  "permissions": ["clipboard", "storage"],
  "install": {
    "zip": "https://github.com/example/my-plugin/releases/download/v1.0.0/my-plugin-1.0.0.zip"
  },
  "homepage": "https://github.com/example/my-plugin",
  "repository": "https://github.com/example/my-plugin",
  "screenshots": ["https://example.com/screenshot1.png", "https://example.com/screenshot2.png"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 更新插件

发布新版本时：

1. 更新 `package.json` 中的 `version`
2. 重新打包
3. 上传新的 ZIP 包
4. 更新 `marketplace/plugins.json` 中的版本和下载链接

## 审核流程

提交的插件会经过以下审核：

1. **基本检查**: package.json 格式、必需字段
2. **安全检查**: 权限合理性、代码安全性
3. **功能测试**: 基本功能是否正常
4. **UI 检查**: 主题适配、界面质量

审核通过后，插件会出现在插件商店中。

## 最佳实践

### 版本管理

- 遵循语义化版本
- 在 CHANGELOG 中记录变更
- 保留旧版本下载链接

### 文档

- 提供清晰的 README
- 说明插件功能和用法
- 列出所需权限及原因

### 用户支持

- 提供问题反馈渠道
- 及时响应用户问题
- 定期更新修复 bug

## 常见问题

### Q: 插件审核需要多长时间？

A: 通常 1-3 个工作日。

### Q: 插件被拒绝怎么办？

A: 审核反馈会说明原因，修复后可以重新提交。

### Q: 如何下架插件？

A: 提交 PR 从 `plugins.json` 中移除，或联系管理员。

### Q: 可以发布付费插件吗？

A: 目前不支持付费插件，所有插件都是免费的。
