# 官方插件迁移指南

本文档说明如何将内置功能迁移为官方插件，以及如何管理官方插件。

## 为什么要迁移？

将内置功能迁移为官方插件有以下好处：

1. **模块化**: 每个功能独立开发和维护
2. **按需安装**: 用户可以选择需要的功能
3. **独立更新**: 插件可以独立于主应用更新
4. **减小体积**: 主应用体积更小，启动更快
5. **易于扩展**: 更容易添加新功能

## 迁移步骤

### 1. 创建插件目录结构

```bash
mkdir -p plugins/your-plugin/src/components/ui/{button,label,input}
mkdir -p plugins/your-plugin/scripts
```

### 2. 创建 package.json

```json
{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "UniHub Team",
    "email": "team@unihub.dev"
  },
  "keywords": ["keyword1", "keyword2"],
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "package": "node scripts/package.js"
  },
  "unihub": {
    "id": "com.unihub.your-plugin",
    "name": "插件名称",
    "icon": "SVG path",
    "category": "tool",
    "permissions": ["clipboard"],
    "entry": "dist/index.html"
  },
  "dependencies": {
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "archiver": "^7.0.1",
    "vite": "^6.0.3"
  }
}
```

### 3. 复制组件代码

将内置组件代码复制到 `src/App.vue`，确保：

- 移除对主应用的依赖
- 使用独立的 UI 组件
- 保持相同的 UI 和交互

### 4. 创建配置文件

- `vite.config.ts` - Vite 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `index.html` - HTML 入口

### 5. 创建打包脚本

`scripts/package.js`:

```javascript
import archiver from 'archiver'
import { createWriteStream, readFileSync } from 'fs'
import { join } from 'path'

const output = createWriteStream('plugin.zip')
const archive = archiver('zip', { zlib: { level: 9 } })

archive.pipe(output)
archive.directory('dist', 'dist')
archive.append(readFileSync('package.json'), { name: 'package.json' })
archive.finalize()
```

### 6. 构建和测试

```bash
cd plugins/your-plugin
npm install
npm run build
npm run package
```

### 7. 更新内置插件列表

在 `src/renderer/src/plugins/builtin/index.ts` 中：

```typescript
// 注释掉或删除内置定义
// import YourTool from '@/components/YourTool.vue'

// 在数组中注释掉插件定义
// {
//   metadata: { ... },
//   component: YourTool,
//   enabled: true
// },
```

### 8. 更新 Marketplace

在 `marketplace/plugins.json` 中添加：

```json
{
  "id": "com.unihub.your-plugin",
  "name": "插件名称",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "UniHub Team",
    "email": "team@unihub.dev"
  },
  "icon": "🔧",
  "category": "tool",
  "keywords": ["keyword1", "keyword2"],
  "permissions": ["clipboard"],
  "downloadUrl": "https://cdn.jsdelivr.net/gh/user/repo@main/plugins/your-plugin/plugin.zip",
  "homepage": "https://github.com/user/repo",
  "downloads": 0,
  "rating": 5.0,
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

## 已完成的迁移

### ✅ JWT 工具 (2025-01-03)

- **插件 ID**: `com.unihub.jwt-tool`
- **位置**: `plugins/jwt-tool/`
- **状态**: 已发布到 Marketplace
- **UI 变化**: 无（完全保持原样）

## 计划迁移的功能

以下内置功能计划迁移为官方插件：

1. **Base64 工具** - Base64 编码解码
2. **URL 编码工具** - URL 编码解码
3. **时间戳工具** - 时间戳与日期互转
4. **二维码工具** - 二维码生成与识别
5. **2FA 验证码** - TOTP 双因素验证码生成
6. **格式转换工具** - JSON/YAML/TOML/XML 互转
7. **代码格式化工具** - JavaScript/CSS/HTML 格式化

## 注意事项

### UI 一致性

- 保持与主应用相同的设计风格
- 使用相同的颜色方案和组件样式
- 确保深色模式支持

### 权限管理

- 明确声明所需权限
- 最小化权限请求
- 在文档中说明权限用途

### 性能优化

- 优化打包体积
- 使用代码分割
- 延迟加载非关键资源

### 兼容性

- 确保与主应用版本兼容
- 测试不同操作系统
- 处理边界情况

## 发布流程

1. **本地测试**: 在开发环境测试插件
2. **构建打包**: 运行 `npm run build && npm run package`
3. **上传文件**: 将 `plugin.zip` 上传到 CDN 或 GitHub Release
4. **更新 Marketplace**: 更新 `marketplace/plugins.json`
5. **提交代码**: 提交并推送到仓库
6. **发布公告**: 在社区发布更新公告

## 用户迁移指南

对于已经使用内置 JWT 工具的用户：

1. 更新到最新版本的 UniHub
2. 打开插件管理页面
3. 在 Marketplace 中找到 "JWT 工具"
4. 点击安装
5. 安装完成后，JWT 工具会出现在工具列表中

**注意**: 安装官方插件后，功能和 UI 完全相同，无需重新学习。

## 常见问题

### Q: 为什么要将内置功能改为插件？

A: 这样可以让主应用更轻量，用户可以按需安装功能，同时插件可以独立更新。

### Q: 官方插件和第三方插件有什么区别？

A: 官方插件由 UniHub 团队维护，质量有保证，与主应用风格一致。第三方插件由社区开发者贡献。

### Q: 安装官方插件后，UI 会变化吗？

A: 不会。官方插件保持与原内置功能完全相同的 UI 和交互。

### Q: 如何卸载官方插件？

A: 在插件管理页面，找到对应插件，点击卸载即可。

### Q: 官方插件是免费的吗？

A: 是的，所有官方插件都是免费的。

## 贡献指南

如果你想帮助迁移更多内置功能为官方插件：

1. 在 GitHub 上创建 Issue，说明你想迁移的功能
2. Fork 仓库并创建新分支
3. 按照本指南完成迁移
4. 提交 Pull Request
5. 等待审核和合并

## 许可证

所有官方插件都使用 MIT 许可证。
