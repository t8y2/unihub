# 插件市场

## 发布插件

1. 开发并测试你的插件
2. 提交 PR 到 `plugins.json`
3. 等待审核

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
- `icon`: emoji 图标
- `keywords`: 搜索关键词数组
- `permissions`: 权限列表（`clipboard`/`fs`/`http`/`spawn`/`backend`）
- `install`: 安装方式配置（至少提供一种）
- `homepage`: 项目主页
- `repository`: 代码仓库
