# 提交插件到 UniHub 插件市场

感谢你为 UniHub 生态做出贡献！

## 📋 提交前检查清单

在提交插件之前，请确保：

- [ ] 插件已经过充分测试
- [ ] 插件遵循 [插件开发指南](../docs/PLUGIN_DEVELOPMENT.md)
- [ ] 插件有清晰的 README 文档
- [ ] 插件有合适的开源协议（推荐 MIT）
- [ ] 插件已发布到 GitHub Release
- [ ] 插件包是 .zip 格式
- [ ] 插件 ID 是唯一的（格式：com.yourname.pluginname）

## 🚀 提交流程

### 1. Fork 仓库

Fork [unihub-plugins](https://github.com/yourname/unihub-plugins) 仓库到你的账号。

### 2. 创建插件配置文件

在 `plugins/` 目录下创建你的插件配置文件：

`plugins/com.yourname.myplugin.json`:

```json
{
  "id": "com.yourname.myplugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "一个很棒的插件",
  "longDescription": "详细的插件描述，可以包含更多信息...",
  "author": {
    "name": "Your Name",
    "email": "your@email.com",
    "url": "https://github.com/yourname"
  },
  "icon": "🎉",
  "category": "tool",
  "keywords": ["工具", "效率", "实用"],
  "permissions": ["clipboard", "http"],
  "versions": [
    {
      "version": "1.0.0",
      "downloadUrl": "https://github.com/yourname/myplugin/releases/download/v1.0.0/plugin.zip",
      "releaseNotes": "初始版本",
      "releasedAt": "2024-12-31T00:00:00Z"
    }
  ],
  "homepage": "https://github.com/yourname/myplugin",
  "repository": "https://github.com/yourname/myplugin",
  "issues": "https://github.com/yourname/myplugin/issues",
  "screenshots": [
    "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/myplugin/1.png"
  ],
  "stats": {
    "downloads": 0,
    "rating": 0,
    "reviews": 0
  },
  "createdAt": "2024-12-31T00:00:00Z",
  "updatedAt": "2024-12-31T00:00:00Z"
}
```

### 3. 更新插件列表

在 `plugins.json` 中添加你的插件：

```json
{
  "plugins": [
    // ... 其他插件
    {
      "id": "com.yourname.myplugin",
      "name": "My Awesome Plugin",
      "version": "1.0.0",
      "description": "一个很棒的插件",
      "author": {
        "name": "Your Name",
        "email": "your@email.com"
      },
      "icon": "🎉",
      "category": "tool",
      "keywords": ["工具", "效率"],
      "permissions": ["clipboard", "http"],
      "downloadUrl": "https://github.com/yourname/myplugin/releases/download/v1.0.0/plugin.zip",
      "homepage": "https://github.com/yourname/myplugin",
      "repository": "https://github.com/yourname/myplugin",
      "screenshots": [],
      "downloads": 0,
      "rating": 0,
      "createdAt": "2024-12-31T00:00:00Z",
      "updatedAt": "2024-12-31T00:00:00Z"
    }
  ]
}
```

### 4. 添加截图（可选）

如果有截图，放在 `screenshots/myplugin/` 目录下：

```
screenshots/
└── myplugin/
    ├── 1.png
    ├── 2.png
    └── 3.png
```

### 5. 提交 Pull Request

```bash
git add .
git commit -m "Add: My Awesome Plugin v1.0.0"
git push origin main
```

然后在 GitHub 上创建 Pull Request。

## 📝 PR 描述模板

```markdown
## 插件信息

- **插件名称**：My Awesome Plugin
- **插件 ID**：com.yourname.myplugin
- **版本**：1.0.0
- **分类**：工具
- **作者**：Your Name

## 插件描述

简要描述你的插件功能...

## 截图

（如果有的话）

## 检查清单

- [ ] 插件已测试
- [ ] 遵循开发指南
- [ ] 有 README 文档
- [ ] 有开源协议
- [ ] 已发布到 GitHub Release
- [ ] JSON 格式正确
```

## 🔍 审核标准

我们会检查以下内容：

### 必需项

- ✅ 插件 ID 唯一
- ✅ JSON 格式正确
- ✅ 下载链接有效
- ✅ 插件可以正常安装
- ✅ 插件功能正常
- ✅ 没有恶意代码

### 推荐项

- ✅ 有清晰的文档
- ✅ 有截图展示
- ✅ 代码质量良好
- ✅ 有开源协议
- ✅ 有测试用例

## 🚫 拒绝标准

以下情况会被拒绝：

- ❌ 包含恶意代码
- ❌ 侵犯版权
- ❌ 功能不完整
- ❌ 严重 Bug
- ❌ 缺少必要信息
- ❌ 插件 ID 重复

## 🔄 更新插件

如果要更新已发布的插件：

1. 更新 `plugins/com.yourname.myplugin.json` 中的版本信息
2. 在 `versions` 数组中添加新版本
3. 更新 `plugins.json` 中的版本号
4. 提交 PR

## 💡 最佳实践

### 1. 选择合适的分类

- `tool` - 工具类（Base64、JSON 格式化等）
- `formatter` - 格式化工具
- `encoder` - 编码/解码工具
- `productivity` - 效率工具
- `developer` - 开发者工具
- `entertainment` - 娱乐类

### 2. 添加准确的关键词

```json
{
  "keywords": ["base64", "编码", "解码", "encode", "decode"]
}
```

### 3. 声明必要的权限

只声明你需要的权限：

```json
{
  "permissions": ["clipboard"]  // 只需要剪贴板
}
```

### 4. 提供清晰的描述

```json
{
  "description": "Base64 编码/解码工具，支持文本和图片",
  "longDescription": "这是一个功能强大的 Base64 工具，支持：\n- 文本编码/解码\n- 图片编码/解码\n- 批量处理\n- 自动检测格式"
}
```

### 5. 添加截图

截图能让用户更好地了解你的插件：

```json
{
  "screenshots": [
    "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/myplugin/1.png",
    "https://cdn.jsdelivr.net/gh/yourname/unihub-plugins/screenshots/myplugin/2.png"
  ]
}
```

## 📞 获取帮助

如果有任何问题：

- 查看 [插件开发指南](../docs/PLUGIN_DEVELOPMENT.md)
- 查看 [示例插件](../examples/modern-vue-plugin)
- 提交 [Issue](https://github.com/yourname/unihub-plugins/issues)

---

**感谢你的贡献！** 🎉
