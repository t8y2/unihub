# 插件配置

`package.json` 是插件的配置文件，包含插件的元信息、权限声明等。UniHub 特定的配置放在 `unihub` 字段中。

## 完整示例

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "这是一个示例插件",
  "main": "index.html",
  "author": {
    "name": "开发者名称",
    "email": "developer@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://github.com/example/my-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/example/my-plugin"
  },
  "unihub": {
    "id": "com.example.my-plugin",
    "name": "我的插件",
    "icon": "https://api.iconify.design/mdi/puzzle.svg",
    "category": "tool",
    "keywords": ["example", "demo", "示例"],
    "permissions": ["clipboard", "storage"]
  }
}
```

## 标准字段

这些是标准的 npm package.json 字段：

| 字段          | 类型          | 说明                   |
| ------------- | ------------- | ---------------------- |
| `name`        | string        | 包名（用于 npm）       |
| `version`     | string        | 版本号，遵循语义化版本 |
| `description` | string        | 插件描述               |
| `main`        | string        | 入口文件路径           |
| `author`      | object/string | 作者信息               |
| `homepage`    | string        | 插件主页               |
| `repository`  | object/string | 代码仓库               |

## UniHub 字段

`unihub` 对象包含 UniHub 特定的配置：

| 字段          | 类型     | 必需 | 说明                |
| ------------- | -------- | ---- | ------------------- |
| `id`          | string   | ✅   | 插件唯一标识符      |
| `name`        | string   | ✅   | 插件显示名称        |
| `icon`        | string   |      | 图标 URL 或本地路径 |
| `category`    | string   |      | 分类                |
| `keywords`    | string[] |      | 搜索关键词          |
| `permissions` | string[] |      | 所需权限            |

## 字段详解

### unihub.id

插件的唯一标识符，用于区分不同插件。

**格式要求**:

- 推荐使用反向域名格式：`com.company.plugin-name`
- 只能包含字母、数字、点和连字符
- 长度不超过 100 个字符

**示例**:

```json
{
  "unihub": {
    "id": "com.unihub.markdown-editor"
  }
}
```

### version

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

**格式**: `主版本号.次版本号.修订号`

- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能新增
- 修订号：向下兼容的问题修正

**示例**:

```json
{
  "version": "1.2.3"
}
```

### author

作者信息，支持对象或字符串格式。

```json
// 对象格式
{
  "author": {
    "name": "开发者名称",
    "email": "developer@example.com",
    "url": "https://example.com"
  }
}

// 字符串格式
{
  "author": "开发者名称 <developer@example.com> (https://example.com)"
}
```

### unihub.icon

插件图标，支持以下格式：

1. **URL**: 在线图标地址

   ```json
   { "unihub": { "icon": "https://api.iconify.design/mdi/puzzle.svg" } }
   ```

2. **本地路径**: 相对于插件根目录

   ```json
   { "unihub": { "icon": "./assets/icon.svg" } }
   ```

3. **Emoji**: 直接使用 emoji
   ```json
   { "unihub": { "icon": "🧩" } }
   ```

**推荐**:

- 使用 SVG 格式
- 尺寸建议 64x64 或更大
- 支持深色/浅色主题

### unihub.category

插件分类，用于在侧边栏中分组显示。

**可用分类**:

- `tool` - 工具
- `formatter` - 格式化
- `encoder` - 编码/解码
- `generator` - 生成器
- `converter` - 转换器
- `other` - 其他

### unihub.keywords

搜索关键词数组，帮助用户找到插件。

```json
{
  "unihub": {
    "keywords": ["json", "格式化", "美化", "压缩"]
  }
}
```

### unihub.permissions

插件所需的权限列表。详见 [权限系统](/plugin/permissions)。

```json
{
  "unihub": {
    "permissions": ["clipboard", "storage", "fs"]
  }
}
```

## 验证配置

在发布前，确保：

- [ ] `unihub.id` 唯一且符合格式要求
- [ ] `version` 遵循语义化版本
- [ ] `name` 和 `description` 清晰准确
- [ ] `main` 指向正确的入口文件
- [ ] `unihub.permissions` 只声明必需的权限
- [ ] `unihub.icon` 可以正常加载
