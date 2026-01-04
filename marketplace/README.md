# 插件市场

## 发布插件

### 给开发者

如果你想发布自己的插件到市场：

1. 开发并测试你的插件
2. 将插件包上传到公开可访问的地址（GitHub Release、jsDelivr 等）
3. Fork 本项目，编辑 `plugins.json` 添加你的插件信息
4. 提交 PR，等待审核

详细步骤请查看：[插件发布指南](../docs/plugin-development/publishing-guide.md)

### 给维护者

如果你是项目维护者，需要上传插件到官方 COS：

```bash
# 打包插件
cd plugins/your-plugin
npm run package

# 上传到 COS
cd ../..
npm run upload:cos plugins/your-plugin
```

详细说明请查看：[COS 上传指南](../docs/plugin-development/upload-to-cos.md)

## plugins.json 格式

```json
{
  "id": "com.example.plugin",
  "name": "插件名称",
  "description": "插件描述",
  "version": "1.0.0",
  "author": {
    "name": "作者名称",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "category": "tool",
  "icon": "🔧",
  "keywords": ["关键词1", "关键词2"],
  "permissions": ["clipboard"],
  "install": {
    "zip": "https://example.com/plugin.zip",
    "npm": "@scope/plugin-name",
    "github": "owner/repo"
  },
  "homepage": "https://github.com/owner/repo",
  "repository": "https://github.com/owner/repo"
}
```

## 安装方式

插件支持多种安装方式：

### 1. ZIP 包（推荐）

```json
"install": {
  "zip": "https://cdn.jsdelivr.net/gh/owner/repo@main/plugin.zip"
}
```

### 2. npm 包

```json
"install": {
  "npm": "@unihub/plugin-name"
}
```

### 3. GitHub Release

```json
"install": {
  "github": "owner/repo"
}
```

自动从 `https://github.com/owner/repo/releases/latest/download/plugin.zip` 下载

### 4. 本地文件

用户可以直接拖拽 `.zip` 文件到插件管理页面安装

## 字段说明

- `id`: 插件唯一标识，格式 `com.author.plugin-name`
- `name`: 插件显示名称
- `description`: 插件描述
- `version`: 版本号（遵循 semver）
- `author`: 作者信息（对象或字符串）
- `category`: 分类（`tool`/`formatter`/`encoder`/`custom`）
- `icon`: 图标，支持三种格式：
  - **Emoji**: `"🔧"` - 简单直观
  - **SVG Path**: `"M12 4v16m8-8H4"` - 矢量图标
  - **图片 URL**: `"https://example.com/icon.png"` - 自定义图片
- `keywords`: 搜索关键词数组
- `permissions`: 权限列表（`clipboard`/`fs`/`http`/`spawn`/`backend`）
- `install`: 安装方式配置（至少提供一种）
- `homepage`: 项目主页
- `repository`: 代码仓库

## Icon 格式示例

```json
// Emoji（推荐，简单）
"icon": "🔧"

// SVG Path（矢量，可自定义颜色）
"icon": "M12 4v16m8-8H4"

// 图片 URL（完全自定义）
"icon": "https://cdn.example.com/plugin-icon.png"
```

### 图片 URL 要求

如果使用图片 URL 作为图标：

- **推荐尺寸**: 128x128px 或更高（正方形）
- **格式**: PNG、JPG、WebP、SVG
- **注意**: 图片会被自动裁剪为正方形并缩放到固定尺寸，建议使用正方形图片以避免变形
- **CDN**: 建议使用 CDN 加速（如 jsDelivr、Cloudflare）
