# 迁移指南：将现有插件迁移到共享配置

本指南帮助你将现有的官方插件迁移到使用共享配置，让插件目录更简洁。

## 迁移步骤

### 1. 删除不再需要的配置文件

```bash
cd plugins/your-plugin
rm tsconfig.json
rm tsconfig.node.json
rm vite.config.ts
rm -rf scripts
```

### 2. 更新 package.json 脚本

将 `package.json` 中的 scripts 部分修改为：

```json
{
  "scripts": {
    "dev": "vite --config ../_shared/vite.config.ts",
    "build": "vite build --config ../_shared/vite.config.ts",
    "package": "node ../_shared/scripts/package.js"
  }
}
```

### 3. 验证构建

```bash
# 测试开发模式
pnpm dev

# 测试构建
pnpm build

# 测试打包
pnpm package
```

## 迁移前后对比

### 迁移前

```
my-plugin/
├── src/
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── scripts/
│   └── package.js          ❌ 删除
├── index.html
├── package.json
├── tsconfig.json            ❌ 删除
├── tsconfig.node.json       ❌ 删除
├── vite.config.ts           ❌ 删除
├── .gitignore
└── README.md
```

### 迁移后

```
my-plugin/
├── src/
│   ├── App.vue
│   ├── main.ts
│   └── style.css           ✅ 保留（插件自定义）
├── index.html              ✅ 保留
├── package.json            ✅ 保留（更新 scripts）
├── .gitignore              ✅ 保留
└── README.md               ✅ 保留
```

## 保留的文件说明

- **src/** - 源代码和 UI 组件（每个插件独立）
- **src/style.css** - 插件自定义样式（不共享）
- **index.html** - 入口 HTML 文件
- **package.json** - 插件元数据、依赖和脚本
- **.gitignore** - Git 忽略规则
- **README.md** - 插件文档

## 共享的配置

这些配置现在统一在 `plugins/_shared/` 目录：

- `tsconfig.json` - TypeScript 配置
- `tsconfig.node.json` - Node 环境配置
- `vite.config.ts` - Vite 构建配置
- `scripts/package.js` - 打包脚本

## 注意事项

1. **UI 组件不共享** - 每个插件的 UI 实现保持独立
2. **样式文件不共享** - `src/style.css` 由各插件自定义
3. **特殊配置** - 如果插件需要特殊配置，可以在插件目录创建配置文件覆盖共享配置
4. **构建输出** - `dist/` 目录和 `plugin.zip` 仍在插件目录生成

## 示例：jwt-tool 插件迁移

```bash
cd plugins/jwt-tool

# 1. 删除配置文件
rm tsconfig.json tsconfig.node.json vite.config.ts
rm -rf scripts

# 2. 更新 package.json（手动编辑）
# 将 scripts 改为使用共享配置

# 3. 验证
pnpm build
pnpm package
```

## 遇到问题？

如果遇到构建问题：

1. 确认 `package.json` 中的 scripts 路径正确
2. 确认已删除所有本地配置文件
3. 尝试清理并重新构建：
   ```bash
   rm -rf dist node_modules
   pnpm install
   pnpm build
   ```
