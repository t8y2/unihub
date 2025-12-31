# 简单计算器插件

一个纯 HTML/CSS/JS 实现的 UniHub 插件示例，**无需构建工具**。

## 🎯 特点

- ✅ 纯 HTML/CSS/JS
- ✅ 单文件，易于理解
- ✅ 使用标准 `package.json`
- ✅ 适合初学者

## 📁 文件结构

```
simple-html-plugin/
├── package.json     ← 配置文件
├── dist/
│   └── index.html   ← 插件主文件
└── README.md
```

## 📦 打包方式

```bash
# 打包
zip -r plugin.zip package.json dist/

# 在 UniHub 中安装
# 上传 plugin.zip
```

## 🔧 配置说明

### package.json

```json
{
  "name": "simple-calculator",
  "version": "1.0.0",
  "description": "简单计算器",
  "author": "你的名字",
  "unihub": {
    "id": "com.unihub.simple-calculator",
    "icon": "🧮",
    "category": "tool",
    "entry": "dist/index.html",
    "permissions": ["clipboard"]
  }
}
```

## 🚀 开发流程

```bash
# 1. 创建项目
mkdir my-plugin && cd my-plugin
mkdir dist

# 2. 创建 package.json（复制上面的模板）

# 3. 编写 dist/index.html

# 4. 打包
zip -r plugin.zip package.json dist/

# 5. 在 UniHub 中测试
```

## 📚 相关文档

- [插件开发指南](../../docs/PLUGIN_DEVELOPMENT.md)
- [插件 API 参考](../../docs/PLUGIN_API.md)
