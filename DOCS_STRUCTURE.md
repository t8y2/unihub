# 📚 文档结构

## 核心文档

```
.
├── README.md                                    # 项目主文档
├── docs/
│   └── plugin-development/
│       └── package-json-guide.md               # 插件配置完整指南
├── examples/
│   ├── README.md                               # 插件示例总览
│   ├── simple-html-plugin/README.md            # 纯 HTML 插件示例
│   ├── h5-formatter-plugin/README.md           # Vue 3 插件示例
│   └── modern-vue-plugin/README.md             # Vue 3 + 后端插件示例
└── marketplace/
    ├── README.md                               # 插件市场说明
    └── CONTRIBUTING.md                         # 插件发布指南
```

## 文档说明

### 项目级别

- **README.md** - 项目介绍、快速开始、功能特性

### 插件开发

- **docs/plugin-development/package-json-guide.md** - 插件配置的完整说明，包括所有字段、自动继承功能、常见错误

### 插件示例

- **examples/README.md** - 三个示例的对比和选择指南
- **examples/\*/README.md** - 各个示例的详细说明和使用方法

### 插件市场

- **marketplace/README.md** - 插件市场介绍
- **marketplace/CONTRIBUTING.md** - 如何发布插件到市场

---

**原则**: 保持文档精简、实用、易于维护
