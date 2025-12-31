# UniHub 文档

## 📚 文档索引

### 核心文档

- [架构设计](./ARCHITECTURE.md) - 系统架构和设计理念
- [插件开发](./PLUGIN_DEVELOPMENT.md) - 插件开发完整指南
- [插件 API](./PLUGIN_API.md) - API 参考文档
- [插件隔离](./ISOLATION_DEMO.md) - 安全隔离机制说明

### 插件市场

- [市场指南](./MARKETPLACE_GUIDE.md) - 插件市场使用指南
- [市场部署](./MARKETPLACE_DEPLOYMENT.md) - 部署和配置指南
- [快速开始](../MARKETPLACE_QUICKSTART.md) - 5 分钟搭建市场

### 快速链接

- [主 README](../README.md) - 项目概览
- [提交插件](../marketplace/CONTRIBUTING.md) - 插件提交流程

## 🚀 快速开始

### 开发应用

```bash
pnpm install
pnpm dev
```

### 开发插件

```bash
node tools/create-plugin.js
```

### 部署市场

查看 [快速开始指南](../MARKETPLACE_QUICKSTART.md)

## 💡 常见问题

### 如何创建插件？

查看 [插件开发指南](./PLUGIN_DEVELOPMENT.md)

### 如何配置权限？

在 `package.json` 中配置：

```json
{
  "unihub": {
    "permissions": ["fs", "clipboard", "http"]
  }
}
```

### 如何发布插件？

查看 [提交指南](../marketplace/CONTRIBUTING.md)

## 🔗 相关资源

- [示例插件](../examples/modern-vue-plugin) - 完整的插件示例
- [插件工具](../tools/create-plugin.js) - 插件脚手架工具
- [测试脚本](../scripts/) - 开发测试脚本

---

**有问题？欢迎提 Issue！** 🎉
