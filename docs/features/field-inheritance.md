# UniHub 字段自动继承功能

## 🎯 功能概述

UniHub 现在支持从 `package.json` 的标准字段自动继承到 `unihub` 配置中，大幅减少重复配置，让插件开发更加简洁。

## ✨ 主要特性

- **自动继承**: 除了 `name` 字段外，其他字段如果在 `unihub` 中未提供，会自动从 `package.json` 继承
- **智能覆盖**: `unihub` 中的字段优先级更高，可以覆盖 `package.json` 中的值
- **类型兼容**: 支持不同格式的字段自动转换（如 author、repository）
- **向后兼容**: 完全兼容现有的插件配置

## 📋 支持的继承字段

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

## 🔄 使用示例

### 最简配置

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "一个很棒的插件",
  "author": "张三",
  "keywords": ["tool", "utility"],
  "homepage": "https://github.com/zhangsan/my-plugin",
  "repository": "https://github.com/zhangsan/my-plugin",
  "license": "MIT",
  "unihub": {
    "id": "com.zhangsan.awesome",
    "icon": "🚀",
    "category": "tool",
    "entry": "dist/index.html"
  }
}
```

### 选择性覆盖

```json
{
  "name": "technical-plugin-name",
  "version": "1.0.0",
  "description": "技术描述",
  "author": "开发者",
  "unihub": {
    "id": "com.dev.plugin",
    "name": "用户友好的插件名称", // 覆盖 package.json 中的 name
    "description": "用户友好的描述", // 覆盖 package.json 中的 description
    "entry": "dist/index.html"
    // version, author 等字段自动继承
  }
}
```

## 🛠️ 实现细节

### 继承优先级

1. **unihub 字段优先**: 如果 `unihub` 中已定义字段，使用 `unihub` 中的值
2. **package.json 继承**: 如果 `unihub` 中未定义，从 `package.json` 继承
3. **默认值**: 如果两处都未定义，使用默认值（如果有）

### 特殊字段处理

#### author 字段

支持字符串和对象格式的自动处理：

```json
// package.json 中的不同格式
"author": "张三"
// 或
"author": {
  "name": "张三",
  "email": "zhangsan@example.com"
}

// 都可以被正确继承
```

#### repository 字段

支持字符串和对象格式：

```json
// package.json 中的不同格式
"repository": "https://github.com/user/repo"
// 或
"repository": {
  "type": "git",
  "url": "https://github.com/user/repo"
}

// 都会被继承为字符串格式的 URL
```

## 📈 优势对比

### 传统方式

- ❌ 需要在两个地方维护相同信息
- ❌ 容易出现不一致
- ❌ 配置冗长

### 新方式

- ✅ 单一数据源，避免重复
- ✅ 自动保持一致性
- ✅ 配置简洁
- ✅ 向后兼容

## 🔧 技术实现

功能在 `src/main/plugin-manager.ts` 中的 `mergePackageJsonWithUnihub` 方法实现：

```typescript
private mergePackageJsonWithUnihub(pkg: PackageJson): PluginMetadata {
  const unihub = pkg.unihub!

  return {
    // 必填字段
    id: unihub.id,
    entry: unihub.entry,

    // 可继承字段
    name: unihub.name || pkg.name,
    version: unihub.version || pkg.version,
    description: unihub.description || pkg.description || '',
    author: getAuthorInfo(unihub.author, pkg.author),

    // ... 其他字段
  }
}
```

## 📚 相关文档

- [插件配置指南](docs/plugin-development/package-json-guide.md) - 完整的配置说明和示例
- [插件开发指南](DOCS.md) - 插件开发的完整指南

## 🎉 总结

这个功能让插件开发变得更加简洁和高效，开发者只需要在 `package.json` 中维护标准字段，在 `unihub` 中只配置插件特有的字段即可。这不仅减少了重复工作，还降低了配置错误的可能性。
