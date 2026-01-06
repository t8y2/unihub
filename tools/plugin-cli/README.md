# @unihubjs/plugin-cli

UniHub 官方插件开发 CLI 工具，快速创建、构建和打包 UniHub 插件。

## 安装

```bash
# 全局安装
npm install -g @unihubjs/plugin-cli

# 或使用 npx（无需安装）
npx @unihubjs/plugin-cli create my-plugin
```

## 快速开始

### 1. 创建插件

```bash
# 交互式创建
unihub-plugin create

# 或使用简写
uhp create

# 指定插件名称
uhp create my-awesome-plugin

# 指定模板
uhp create my-plugin --template vue
```

支持的模板：

- `simple` - 纯 HTML/CSS/JS，最简单
- `vue` - Vue 3 + TypeScript，推荐
- `react` - React 18 + TypeScript

### 2. 开发插件

```bash
cd my-plugin
npm install
npm run dev

# 或使用 CLI
uhp dev
```

### 3. 构建插件

```bash
npm run build

# 或使用 CLI
uhp build
```

### 4. 打包插件

```bash
npm run package

# 或使用 CLI
uhp package
```

生成的 `plugin.zip` 可以直接拖拽到 UniHub 安装。

## 命令

### create

创建新插件项目

```bash
uhp create [name] [options]

选项:
  -t, --template <type>  模板类型 (simple|vue|react)
  -d, --dir <directory>  目标目录
```

### dev

启动开发服务器

```bash
uhp dev [options]

选项:
  -p, --port <port>  端口号 (默认: 5173)
```

### build

构建插件

```bash
uhp build [options]

选项:
  -w, --watch  监听文件变化
```

### package

打包插件为 .zip 文件

```bash
uhp package [options]

选项:
  -o, --output <path>  输出路径 (默认: plugin.zip)
```

### validate

验证插件配置

```bash
uhp validate
```

检查：

- package.json 配置完整性
- unihub 字段必填项
- 权限和分类有效性
- 入口文件是否存在

## 插件结构

```
my-plugin/
├── package.json          # 插件配置
├── dist/                 # 构建输出
│   └── index.html       # 入口文件
├── src/                  # 源代码
│   ├── main.ts
│   ├── App.vue
│   └── style.css
├── scripts/
│   └── package.js       # 打包脚本
└── README.md
```

## package.json 配置

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的插件",
  "author": "Your Name",
  "unihub": {
    "id": "com.yourname.myplugin",
    "name": "我的插件",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard"]
  }
}
```

### 必填字段

| 字段       | 说明                          | 示例                      |
| ---------- | ----------------------------- | ------------------------- |
| `id`       | 插件唯一标识（反向域名格式）  | `"com.yourname.myplugin"` |
| `name`     | 插件显示名称                  | `"我的插件"`              |
| `icon`     | 图标（Emoji、URL 或相对路径） | `"🚀"`                    |
| `category` | 分类                          | `"tool"`                  |
| `entry`    | 入口文件路径                  | `"dist/index.html"`       |

### 可选字段

| 字段          | 说明       | 示例                  |
| ------------- | ---------- | --------------------- |
| `permissions` | 权限列表   | `["clipboard", "fs"]` |
| `keywords`    | 搜索关键词 | `["tool", "utility"]` |

### 分类（category）

- `tool` - 工具
- `formatter` - 格式化
- `encoder` - 编码/解码
- `productivity` - 效率
- `developer` - 开发者工具
- `entertainment` - 娱乐
- `custom` - 自定义

### 权限（permissions）

- `clipboard` - 剪贴板读写
- `fs` - 文件系统访问
- `http` - HTTP 请求
- `spawn` - 后端进程
- `db` - 数据库存储
- `notification` - 系统通知
- `system` - 系统信息

## UniHub API

插件可以通过 `window.unihub` 访问系统功能：

```javascript
// 剪贴板
await window.unihub.clipboard.writeText('text')
const text = await window.unihub.clipboard.readText()

// 文件系统（需要 fs 权限）
const content = await window.unihub.fs.readFile(path)
await window.unihub.fs.writeFile(path, content)

// HTTP 请求（需要 http 权限）
const data = await window.unihub.http.get(url)
await window.unihub.http.post(url, data)

// 数据库（需要 db 权限）
const value = await window.unihub.db.get(key)
await window.unihub.db.set(key, value)

// 通知（需要 notification 权限）
await window.unihub.notification.show(title, body)
```

## 开发技巧

### TypeScript 类型定义

```typescript
declare global {
  interface Window {
    unihub?: {
      clipboard?: {
        writeText: (text: string) => Promise<void>
        readText: () => Promise<string>
      }
      // 其他 API...
    }
  }
}
```

### 热重载

使用 `uhp dev` 启动开发服务器，支持热重载。

### 调试

在 UniHub 中打开开发者工具（F12）查看控制台输出。

## 发布插件

### 方式一：提交到插件市场

1. 将 `plugin.zip` 上传到 GitHub Release 或 CDN
2. Fork UniHub 项目，编辑 `marketplace/plugins.json`
3. 添加插件信息并提交 PR

### 方式二：本地安装

用户可以直接拖拽 `plugin.zip` 到 UniHub 的插件管理页面安装。

## 示例

查看 UniHub 项目中的示例插件：

- `examples/simple-html-plugin` - 纯 HTML 实现
- `examples/modern-vue-plugin` - Vue 3 实现
- `examples/h5-formatter-plugin` - 格式化工具

## 许可证

MIT

## 相关链接

- [UniHub 项目](https://github.com/t8y2/unihub)
- [插件开发文档](https://github.com/t8y2/unihub#插件开发指南)
