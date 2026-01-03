# UniHub 官方插件

## 📦 已发布的插件

### 🔐 JWT 工具 (jwt-tool)

- **ID**: `com.unihub.jwt-tool`
- **版本**: 1.0.0
- **描述**: JWT 编码解码与验证工具，支持 HS256/HS384/HS512 算法
- **大小**: 49KB

## 🚀 快速创建新插件

```bash
# 一键创建
./scripts/create-plugin-simple.sh your-plugin-name

# 进入目录
cd plugins/your-plugin-name

# 修改 package.json 和 src/App.vue
# 安装依赖并开发
npm install
npm run dev
```

详细说明请查看 [QUICK_START.md](./QUICK_START.md)

## 📁 目录结构

```
plugins/
├── _template/          # 插件模板（包含所有配置和 UI 组件）
├── jwt-tool/           # JWT 工具插件
├── official-plugins.json  # 官方插件管理配置
├── QUICK_START.md      # 快速开始指南
└── README.md           # 本文件
```

## 🎯 计划迁移的插件

### 高优先级

- [ ] Base64 工具
- [ ] URL 编码工具
- [ ] 时间戳工具

### 中优先级

- [ ] 二维码工具
- [ ] 2FA 验证码
- [ ] 格式转换工具
- [ ] 代码格式化工具

## 📚 文档

- [快速开始指南](./QUICK_START.md) - 如何创建新插件
- [插件开发指南](../docs/OFFICIAL_PLUGINS_MIGRATION.md) - 详细的迁移指南

## 许可证

MIT
