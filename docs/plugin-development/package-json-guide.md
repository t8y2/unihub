# 插件配置完整指南

## 📋 最小配置（必填字段）

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "你的名字",
  "unihub": {
    "id": "com.yourname.myplugin",
    "entry": "dist/index.html"
  }
}
```

> **✨ 自动继承功能**: 除了 `name` 字段外，unihub 配置中的其他字段如果未提供，会自动从 package.json 的对应字段继承。

### 完整的最小配置示例

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "unihub": {
    "id": "com.yourname.myplugin",
    "name": "我的插件",
    "version": "1.0.0",
    "description": "插件描述",
    "author": {
      "name": "你的名字"
    },
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html"
  }
}
```

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

UniHub 支持从 package.json 的标准字段自动继承到 unihub 配置中，减少重复配置。

### 继承规则

| unihub 字段   | 继承自 package.json | 说明         |
| ------------- | ------------------- | ------------ |
| `name`        | `name`              | 插件显示名称 |
| `version`     | `version`           | 插件版本号   |
| `description` | `description`       | 插件描述     |
| `author`      | `author`            | 作者信息     |
| `keywords`    | `keywords`          | 关键词数组   |
| `homepage`    | `homepage`          | 主页链接     |
| `repository`  | `repository`        | 仓库地址     |
| `license`     | `license`           | 许可证       |

### 继承优先级

1. **unihub 字段优先**: 如果 unihub 中已定义字段，则使用 unihub 中的值
2. **package.json 继承**: 如果 unihub 中未定义，则从 package.json 继承
3. **默认值**: 如果两处都未定义，使用默认值（如果有）

### 示例对比

#### ❌ 传统方式（重复配置）

```json
{
  "name": "my-awesome-plugin",
  "version": "2.1.0",
  "description": "一个很棒的插件，提供强大的功能",
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "keywords": ["tool", "utility", "awesome"],
  "homepage": "https://github.com/zhangsan/my-awesome-plugin",
  "repository": "https://github.com/zhangsan/my-awesome-plugin",
  "license": "MIT",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "name": "我的很棒插件", // 重复
    "version": "2.1.0", // 重复
    "description": "一个很棒的插件，提供强大的功能", // 重复
    "author": {
      // 重复
      "name": "张三",
      "email": "zhangsan@example.com"
    },
    "keywords": ["tool", "utility", "awesome"], // 重复
    "homepage": "https://github.com/zhangsan/my-awesome-plugin", // 重复
    "repository": "https://github.com/zhangsan/my-awesome-plugin", // 重复
    "icon": "⚡",
    "category": "tool",
    "entry": "dist/index.html"
  }
}
```

#### ✅ 新方式（自动继承）

```json
{
  "name": "my-awesome-plugin",
  "version": "2.1.0",
  "description": "一个很棒的插件，提供强大的功能",
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "keywords": ["tool", "utility", "awesome"],
  "homepage": "https://github.com/zhangsan/my-awesome-plugin",
  "repository": "https://github.com/zhangsan/my-awesome-plugin",
  "license": "MIT",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "name": "我的很棒插件", // 可选：覆盖 package.json 中的 name
    "icon": "⚡",
    "category": "tool",
    "entry": "dist/index.html"
    // 其他字段自动从 package.json 继承
  }
}
```

### 特殊字段处理

#### author 字段

支持字符串和对象两种格式的自动转换：

```json
// package.json 中的字符串格式
"author": "张三 <zhangsan@example.com>"

// 或对象格式
"author": {
  "name": "张三",
  "email": "zhangsan@example.com",
  "url": "https://zhangsan.com"
}

// unihub 中可以覆盖
"unihub": {
  "author": {
    "name": "张三（UniHub版）"
  }
}
```

#### repository 字段

支持字符串和对象格式：

```json
// package.json 中的字符串格式
"repository": "https://github.com/user/repo"

// 或对象格式
"repository": {
  "type": "git",
  "url": "https://github.com/user/repo"
}

// 都会被继承为字符串格式的 URL
```

### 最佳实践

1. **标准字段放在 package.json 根级别**

   ```json
   {
     "name": "plugin-name",
     "version": "1.0.0",
     "description": "插件描述",
     "author": "作者名",
     "keywords": ["关键词"],
     "homepage": "主页地址",
     "repository": "仓库地址",
     "license": "MIT"
   }
   ```

2. **UniHub 特有字段放在 unihub 中**

   ```json
   {
     "unihub": {
       "id": "com.author.plugin",
       "icon": "🚀",
       "category": "tool",
       "entry": "dist/index.html",
       "permissions": ["clipboard"]
     }
   }
   ```

3. **需要覆盖时才在 unihub 中重新定义**
   ```json
   {
     "name": "technical-plugin-name",
     "unihub": {
       "name": "用户友好的插件名称" // 覆盖 package.json 中的 name
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

## 🎯 快速开始模板

### 纯 HTML 插件（最简配置）

```json
{
  "name": "my-simple-plugin",
  "version": "1.0.0",
  "description": "一个简单的插件",
  "author": "你的名字",
  "unihub": {
    "id": "com.yourname.simpleplugin",
    "icon": "🎨",
    "category": "tool",
    "entry": "dist/index.html"
  }
}
```

### Vue/React 插件（推荐配置）

```json
{
  "name": "my-vue-plugin",
  "version": "1.0.0",
  "description": "我的 Vue 插件",
  "author": {
    "name": "你的名字",
    "email": "your@email.com"
  },
  "license": "MIT",
  "keywords": ["vue", "tool", "utility"],
  "homepage": "https://github.com/yourname/my-vue-plugin",
  "repository": "https://github.com/yourname/my-vue-plugin",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "package": "npm run build && node scripts/package.js"
  },
  "unihub": {
    "id": "com.yourname.vueplugin",
    "name": "我的 Vue 插件",
    "icon": "⚡",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard", "db"],
    "dev": {
      "enabled": false,
      "url": "http://localhost:5173",
      "autoReload": true
    }
  }
}
```

### 对比：传统 vs 新方式

#### ❌ 传统方式（重复配置）

```json
{
  "name": "awesome-plugin",
  "version": "2.0.0",
  "description": "很棒的插件",
  "author": "张三",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "name": "awesome-plugin", // 重复
    "version": "2.0.0", // 重复
    "description": "很棒的插件", // 重复
    "author": "张三", // 重复
    "entry": "dist/index.html"
  }
}
```

#### ✅ 新方式（自动继承）

```json
{
  "name": "awesome-plugin",
  "version": "2.0.0",
  "description": "很棒的插件",
  "author": "张三",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "entry": "dist/index.html"
    // 其他字段自动继承
  }
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
