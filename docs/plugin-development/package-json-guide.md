# 插件配置指南

## 📋 最小配置

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "你的名字",
  "unihub": {
    "id": "com.yourname.myplugin",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html"
  }
}
```

> **✨ 自动继承**: `unihub` 中未提供的字段会自动从 `package.json` 继承（除了 `name` 字段）。

## 📝 完整配置（所有字段）

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "你的名字",
  "license": "MIT",
  "keywords": ["tool", "utility"],
  "homepage": "https://github.com/yourname/my-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/my-plugin"
  },
  "files": ["dist", "package.json", "README.md"],
  "unihub": {
    "id": "com.yourname.myplugin",
    "name": "我的插件",
    "version": "1.0.0",
    "description": "插件描述",
    "author": {
      "name": "你的名字",
      "email": "your@email.com",
      "url": "https://yourwebsite.com"
    },
    "icon": "🚀",
    "category": "tool",
    "keywords": ["tool", "utility"],
    "entry": "dist/index.html",
    "permissions": ["clipboard", "db"],
    "screenshots": ["https://example.com/screenshot1.png"],
    "homepage": "https://github.com/yourname/my-plugin",
    "repository": "https://github.com/yourname/my-plugin",
    "install": {
      "npm": "@unihub/my-plugin",
      "github": "yourname/my-plugin",
      "zip": "https://cdn.example.com/plugin.zip"
    },
    "dev": {
      "enabled": false,
      "url": "http://localhost:5173",
      "autoReload": true
    }
  }
}
```

## 🔄 自动继承功能

UniHub 支持从 `package.json` 自动继承字段到 `unihub` 配置，减少重复。

### 继承规则

| unihub 字段   | 继承自        | 说明       |
| ------------- | ------------- | ---------- |
| `version`     | `version`     | 插件版本号 |
| `description` | `description` | 插件描述   |
| `author`      | `author`      | 作者信息   |
| `keywords`    | `keywords`    | 关键词数组 |
| `homepage`    | `homepage`    | 主页链接   |
| `repository`  | `repository`  | 仓库地址   |
| `license`     | `license`     | 许可证     |

**优先级**: unihub 中的字段 > package.json 中的字段 > 默认值

### 示例

```json
{
  "name": "my-awesome-plugin",
  "version": "2.1.0",
  "description": "一个很棒的插件",
  "author": "张三",
  "keywords": ["tool", "utility"],
  "homepage": "https://github.com/zhangsan/my-plugin",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "icon": "⚡",
    "category": "tool",
    "entry": "dist/index.html"
    // 其他字段自动继承
  }
}
```

## 🔍 字段说明

### package.json 标准字段

| 字段          | 必填 | 类型          | 说明     | 示例                         |
| ------------- | ---- | ------------- | -------- | ---------------------------- |
| `name`        | ✅   | string        | npm 包名 | `"my-plugin"`                |
| `version`     | ✅   | string        | 版本号   | `"1.0.0"`                    |
| `description` | ⭕   | string        | 描述     | `"我的插件"`                 |
| `author`      | ⭕   | string        | 作者     | `"Your Name"`                |
| `license`     | ⭕   | string        | 许可证   | `"MIT"`                      |
| `keywords`    | ⭕   | string[]      | 关键词   | `["tool"]`                   |
| `homepage`    | ⭕   | string        | 主页     | `"https://..."`              |
| `repository`  | ⭕   | object/string | 仓库     | `{"type":"git","url":"..."}` |
| `files`       | ⭕   | string[]      | 发布文件 | `["dist"]`                   |

### unihub 字段

| 字段          | 必填 | 类型     | 说明         | 示例                    |
| ------------- | ---- | -------- | ------------ | ----------------------- |
| `id`          | ✅   | string   | 插件唯一ID   | `"com.yourname.plugin"` |
| `name`        | ✅   | string   | 插件显示名称 | `"我的插件"`            |
| `version`     | ✅   | string   | 插件版本     | `"1.0.0"`               |
| `description` | ✅   | string   | 插件描述     | `"这是一个..."`         |
| `author`      | ✅   | object   | 作者信息     | `{"name":"..."}`        |
| `icon`        | ✅   | string   | 图标         | `"🚀"`                  |
| `category`    | ✅   | string   | 分类         | `"tool"`                |
| `entry`       | ✅   | string   | 入口文件     | `"dist/index.html"`     |
| `keywords`    | ⭕   | string[] | 关键词       | `["tool"]`              |
| `permissions` | ⭕   | string[] | 权限列表     | `["clipboard"]`         |
| `screenshots` | ⭕   | string[] | 截图URL      | `["https://..."]`       |
| `homepage`    | ⭕   | string   | 主页         | `"https://..."`         |
| `repository`  | ⭕   | string   | 仓库         | `"https://..."`         |
| `install`     | ⭕   | object   | 安装方式     | `{"npm":"..."}`         |
| `dev`         | ⭕   | object   | 开发配置     | `{"enabled":false}`     |

## 📌 字段详细说明

### ✅ 必填字段

#### unihub.id

- **格式**: 反向域名格式
- **规则**:
  - 必须唯一
  - 只能包含小写字母、数字、点、连字符
  - 推荐格式: `com.作者名.插件名`
- **示例**:
  ```json
  "id": "com.unihub.calculator"
  "id": "com.yourname.myplugin"
  ```

#### unihub.name

- **格式**: 任意字符串
- **说明**: 显示在插件市场和应用中的名称
- **示例**:
  ```json
  "name": "简单计算器"
  "name": "My Awesome Plugin"
  ```

#### unihub.version

- **格式**: 语义化版本 `major.minor.patch`
- **规则**: 遵循 [semver](https://semver.org/)
- **示例**:
  ```json
  "version": "1.0.0"
  "version": "2.1.3"
  ```

#### unihub.description

- **格式**: 任意字符串
- **长度**: 建议 20-200 字符
- **示例**:
  ```json
  "description": "一个简单的计算器插件，支持基本的四则运算"
  ```

#### unihub.author

- **格式**: 对象
- **必需字段**: `name`
- **可选字段**: `email`, `url`
- **示例**:
  ```json
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "url": "https://zhangsan.com"
  }
  ```

#### unihub.icon

- **格式**: Emoji 或 SVG path
- **推荐**: 使用 Emoji（简单直观）
- **示例**:
  ```json
  "icon": "🚀"
  "icon": "🧮"
  "icon": "M12 2L2 7l10 5 10-5-10-5z"
  ```

#### unihub.category

- **格式**: 字符串
- **可选值**:
  - `tool` - 工具
  - `formatter` - 格式化
  - `encoder` - 编码
  - `productivity` - 效率
  - `developer` - 开发者
  - `entertainment` - 娱乐
  - `custom` - 自定义
- **示例**:
  ```json
  "category": "tool"
  ```

#### unihub.entry

- **格式**: 相对路径
- **说明**: 插件的 HTML 入口文件
- **示例**:
  ```json
  "entry": "dist/index.html"
  "entry": "index.html"
  ```

### ⭕ 可选字段

#### unihub.keywords

- **格式**: 字符串数组
- **说明**: 用于搜索和分类
- **示例**:
  ```json
  "keywords": ["calculator", "math", "tool", "计算器"]
  ```

#### unihub.permissions

- **格式**: 字符串数组
- **可选值**:
  - `clipboard` - 剪贴板读写
  - `db` - 数据库存储
  - `fs` - 文件系统访问
  - `http` - HTTP 请求
  - `notification` - 系统通知
  - `system` - 系统信息
  - `spawn` - 后端进程
- **示例**:
  ```json
  "permissions": ["clipboard", "db"]
  ```

#### unihub.screenshots

- **格式**: URL 数组
- **说明**: 插件截图，显示在市场中
- **示例**:
  ```json
  "screenshots": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ]
  ```

#### unihub.homepage

- **格式**: URL 字符串
- **说明**: 插件主页或文档地址
- **示例**:
  ```json
  "homepage": "https://github.com/yourname/my-plugin"
  ```

#### unihub.repository

- **格式**: URL 字符串
- **说明**: 源码仓库地址
- **示例**:
  ```json
  "repository": "https://github.com/yourname/my-plugin"
  ```

#### unihub.install

- **格式**: 对象
- **字段**:
  - `npm`: npm 包名
  - `github`: GitHub 仓库（格式：owner/repo）
  - `zip`: 直接下载链接
- **示例**:
  ```json
  "install": {
    "npm": "@unihub/my-plugin",
    "github": "yourname/my-plugin",
    "zip": "https://cdn.example.com/plugin.zip"
  }
  ```

#### unihub.dev

- **格式**: 对象
- **说明**: 开发模式配置
- **字段**:
  - `enabled`: 是否启用（boolean）
  - `url`: 开发服务器地址（string）
  - `autoReload`: 是否自动重载（boolean）
- **示例**:
  ```json
  "dev": {
    "enabled": true,
    "url": "http://localhost:5173",
    "autoReload": true
  }
  ```

## ⚠️ 常见错误

### 1. ID 格式错误

❌ 错误:

```json
"id": "MyPlugin"           // 不能有大写
"id": "my_plugin"          // 不能用下划线
"id": "my plugin"          // 不能有空格
```

✅ 正确:

```json
"id": "com.yourname.myplugin"
```

### 2. 版本号格式错误

❌ 错误:

```json
"version": "1.0"           // 缺少 patch 版本
"version": "v1.0.0"        // 不要加 v 前缀
```

✅ 正确:

```json
"version": "1.0.0"
```

### 3. 分类拼写错误

❌ 错误:

```json
"category": "tools"        // 应该是单数
"category": "Tool"         // 不能大写
```

✅ 正确:

```json
"category": "tool"
```

### 4. 入口文件路径错误

❌ 错误:

```json
"entry": "/dist/index.html"    // 不要以 / 开头
"entry": "./dist/index.html"   // 不要用 ./
```

✅ 正确:

```json
"entry": "dist/index.html"
```
