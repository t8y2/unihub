# UniHub 插件市场

## 📦 插件列表管理

所有插件（包括官方和第三方）统一在 `plugins.json` 中管理。

### 插件分类

- **官方插件**: `author.name` 为 "UniHub Team"
- **第三方插件**: 其他作者

### 自动同步到 Gist

当你提交代码时，`plugins.json` 会自动同步到 GitHub Gist，确保插件商店实时更新。

**首次使用需要配置**，详见 [配置指南](./SETUP.md)。

### 工作原理

```
提交代码
  ↓
pre-commit hook
  ↓
同步 plugins.json 到 Gist
  ↓
前端从 Gist API 获取最新列表
  ↓
降级到 CDN（如果 API 不可用）
```

## 📝 添加新插件

编辑 `plugins.json`，添加插件信息：

```json
{
  "id": "com.example.plugin",
  "name": "插件名称",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "作者名",
    "email": "email@example.com",
    "url": "https://github.com/author"
  },
  "icon": "🔧",
  "category": "tool",
  "keywords": ["keyword1", "keyword2"],
  "permissions": ["clipboard"],
  "downloadUrl": "https://example.com/plugin.zip",
  "homepage": "https://github.com/author/plugin",
  "repository": "https://github.com/author/plugin",
  "screenshots": [],
  "downloads": 0,
  "rating": 5.0,
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

提交后会自动同步到 Gist，用户立即可见。

## 🎯 计划迁移的官方插件

### 高优先级

- [ ] Base64 工具
- [ ] URL 编码工具
- [ ] 时间戳工具

### 中优先级

- [ ] 二维码工具
- [ ] 2FA 验证码
- [ ] 格式转换工具
- [ ] 代码格式化工具

## 📚 相关文档

- [插件开发指南](../docs/plugin-development/)
- [贡献指南](./CONTRIBUTING.md)
