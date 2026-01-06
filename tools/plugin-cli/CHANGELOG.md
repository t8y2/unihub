# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-06

### Added

- 🎉 首次发布 UniHub Plugin CLI
- ✨ 支持三种模板：Simple HTML、Vue 3、React 18
- 🚀 交互式插件创建向导
- 🔨 构建命令支持
- 📦 一键打包为 .zip 文件
- 🔍 插件配置验证功能
- 💻 开发服务器支持
- 📝 完整的文档和使用指南
- 🎨 支持自定义图标、分类和权限
- 🔧 TypeScript 支持
- 📚 示例代码和最佳实践

### Features

#### 命令

- `create` - 创建新插件项目
- `dev` - 启动开发服务器
- `build` - 构建插件
- `package` - 打包插件
- `validate` - 验证插件配置

#### 模板

- **Simple** - 纯 HTML/CSS/JS，适合简单插件
- **Vue** - Vue 3 + TypeScript，推荐使用
- **React** - React 18 + TypeScript，React 开发者首选

#### 配置

- 支持所有 UniHub 插件配置项
- 自动生成插件 ID
- 权限选择器
- 分类选择器
- 图标配置（Emoji/URL/本地文件）

#### 开发体验

- 热重载支持
- TypeScript 类型定义
- 完整的错误提示
- 彩色终端输出
- 进度指示器

### Documentation

- README.md - 完整使用文档
- GUIDE.md - 快速入门指南
- 示例代码和最佳实践
- API 参考文档

### Dependencies

- commander - CLI 框架
- inquirer - 交互式命令行
- chalk - 终端颜色
- ora - 加载动画
- archiver - ZIP 打包

## [Unreleased]

### Planned

- [ ] 支持更多模板（Svelte、Solid.js）
- [ ] 插件热更新
- [ ] 插件调试工具
- [ ] 插件测试框架
- [ ] 插件发布助手
- [ ] 插件市场集成
- [ ] 可视化配置编辑器
- [ ] 插件依赖管理
- [ ] 插件版本管理
- [ ] CI/CD 集成

[1.0.0]: https://github.com/t8y2/unihub/releases/tag/plugin-cli-v1.0.0
