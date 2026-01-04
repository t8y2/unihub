# 插件发布指南

本文档介绍如何将你开发的插件发布到 UniHub 插件市场。

## 📋 发布流程

### 方式一：提交 PR（推荐）

这是最简单的方式，适合大多数开发者。

#### 1. 准备插件

确保你的插件已经开发完成并测试通过：

```bash
# 在插件目录下
npm run dev      # 开发测试
npm run package  # 打包插件
```

#### 2. 上传插件包

你需要将打包好的 `plugin.zip` 上传到一个公开可访问的地址。有以下几种方式：

**选项 A：GitHub Release（推荐）**

1. 在 GitHub 上创建你的插件仓库
2. 创建一个 Release
3. 上传 `plugin.zip` 作为 Release 资产
4. 获取下载链接，格式类似：
   ```
   https://github.com/yourname/your-plugin/releases/download/v1.0.0/plugin.zip
   ```

**选项 B：jsDelivr CDN**

如果你的插件在 GitHub 仓库中：

```
https://cdn.jsdelivr.net/gh/yourname/your-plugin@main/plugin.zip
```

**选项 C：其他 CDN**

- Cloudflare R2
- 阿里云 OSS
- 七牛云
- 任何支持公开访问的存储服务

#### 3. 准备插件信息

创建一个 JSON 配置，包含你的插件信息：

```json
{
  "id": "com.yourname.your-plugin",
  "name": "你的插件名称",
  "version": "1.0.0",
  "description": "插件描述，简要说明插件的功能",
  "author": {
    "name": "你的名字",
    "email": "your@email.com",
    "url": "https://github.com/yourname"
  },
  "icon": "🚀",
  "category": "tool",
  "keywords": ["关键词1", "关键词2", "工具"],
  "permissions": ["clipboard"],
  "install": {
    "zip": "https://github.com/yourname/your-plugin/releases/download/v1.0.0/plugin.zip",
    "github": "yourname/your-plugin"
  },
  "homepage": "https://github.com/yourname/your-plugin",
  "repository": "https://github.com/yourname/your-plugin",
  "screenshots": ["https://raw.githubusercontent.com/yourname/your-plugin/main/screenshots/1.png"],
  "downloads": 0,
  "rating": 5.0,
  "createdAt": "2025-01-04T00:00:00Z",
  "updatedAt": "2025-01-04T00:00:00Z"
}
```

#### 4. 提交 PR

1. Fork 本项目
2. 编辑 `marketplace/plugins.json`，将你的插件信息添加到 `plugins` 数组中
3. 提交 PR，标题格式：`feat: 添加插件 - 你的插件名称`
4. 在 PR 描述中说明：
   - 插件功能
   - 测试情况
   - 截图（可选）

#### 5. 等待审核

维护者会审核你的 PR，可能会提出一些修改建议。审核通过后，你的插件就会出现在插件市场中！

### 方式二：自托管

如果你想完全控制插件的分发，可以自己托管：

1. 将插件上传到你自己的服务器或 CDN
2. 在你的网站/文档中提供下载链接
3. 用户可以手动下载 `.zip` 文件并拖拽到 UniHub 安装

## 📝 字段说明

### 必填字段

| 字段          | 说明                                  | 示例                        |
| ------------- | ------------------------------------- | --------------------------- |
| `id`          | 插件唯一标识，格式：`com.作者.插件名` | `"com.yourname.calculator"` |
| `name`        | 插件显示名称                          | `"计算器"`                  |
| `version`     | 版本号（遵循 semver）                 | `"1.0.0"`                   |
| `description` | 插件描述                              | `"一个简单的计算器工具"`    |
| `author`      | 作者信息                              | `{"name": "张三"}`          |
| `icon`        | 图标（Emoji 或 SVG）                  | `"🧮"`                      |
| `category`    | 分类                                  | `"tool"`                    |
| `install`     | 安装方式（至少一种）                  | `{"zip": "https://..."}`    |

### 可选字段

| 字段          | 说明          | 示例                       |
| ------------- | ------------- | -------------------------- |
| `keywords`    | 搜索关键词    | `["calculator", "math"]`   |
| `permissions` | 所需权限      | `["clipboard", "db"]`      |
| `homepage`    | 项目主页      | `"https://github.com/..."` |
| `repository`  | 代码仓库      | `"https://github.com/..."` |
| `screenshots` | 截图 URL 数组 | `["https://..."]`          |

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
- `db` - 数据库存储
- `fs` - 文件系统访问
- `http` - HTTP 请求
- `notification` - 系统通知
- `system` - 系统信息
- `spawn` - 后端进程

## ✅ 发布检查清单

在提交 PR 前，请确保：

- [ ] 插件已经过充分测试
- [ ] `package.json` 中的 `unihub` 配置完整
- [ ] 插件 ID 格式正确且唯一
- [ ] 版本号遵循 semver 规范
- [ ] 图标清晰美观（推荐使用 Emoji）
- [ ] 描述清晰，关键词准确
- [ ] 下载链接可公开访问
- [ ] 权限声明准确（只申请必要权限）
- [ ] 代码符合项目规范
- [ ] 没有恶意代码或安全隐患

## 🔄 更新插件

当你需要更新插件时：

1. 修改插件代码
2. 更新 `package.json` 中的版本号
3. 重新打包：`npm run package`
4. 上传新版本到你的托管位置
5. 提交 PR 更新 `marketplace/plugins.json` 中的版本号和下载链接
6. 更新 `updatedAt` 字段为当前时间

## 🚫 审核标准

以下情况可能导致 PR 被拒绝：

- 包含恶意代码或安全漏洞
- 侵犯他人版权或商标
- 功能描述不实或误导用户
- 申请了不必要的权限
- 代码质量过低或存在明显 bug
- 与现有插件功能完全重复

## 💡 最佳实践

### 1. 使用 GitHub Release

推荐使用 GitHub Release 托管插件，这样：

- 版本管理清晰
- 下载稳定可靠
- 用户可以查看更新日志

### 2. 提供截图

在 `screenshots` 字段中提供 1-3 张截图，帮助用户了解插件功能。

### 3. 编写文档

在你的 GitHub 仓库中提供：

- README.md - 功能介绍、使用说明
- CHANGELOG.md - 版本更新记录
- LICENSE - 开源协议

### 4. 语义化版本

遵循 [semver](https://semver.org/) 规范：

- `1.0.0` → `1.0.1` - 修复 bug
- `1.0.0` → `1.1.0` - 新增功能（向后兼容）
- `1.0.0` → `2.0.0` - 破坏性更新

### 5. 测试充分

在提交前：

- 在开发模式下测试
- 打包后安装测试
- 在不同场景下测试
- 确保没有控制台错误

## 📞 需要帮助？

- 查看 [插件开发文档](./README.md)
- 参考 [示例插件](../../examples/)
- 提交 [Issue](https://github.com/yourrepo/issues)
- 加入开发者社区

## 🎉 发布后

插件发布后：

1. **推广你的插件**
   - 在社交媒体分享
   - 写博客介绍
   - 在相关社区推荐

2. **收集反馈**
   - 关注 GitHub Issues
   - 回复用户评论
   - 根据反馈改进

3. **持续维护**
   - 修复 bug
   - 添加新功能
   - 保持更新

感谢你为 UniHub 生态做出贡献！🎉
