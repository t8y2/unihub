# 官方插件共享配置

此目录包含所有官方插件的共享配置文件，让各个插件目录保持简洁。

## 共享文件

- `tsconfig.json` - TypeScript 配置
- `tsconfig.node.json` - Node 环境 TypeScript 配置
- `vite.config.ts` - Vite 构建配置
- `scripts/package.js` - 打包脚本
- `.gitignore` - Git 忽略规则
- `create-plugin.sh` - 创建新插件脚本

## 插件目录结构

使用共享配置后，每个插件目录只需包含：

```
my-plugin/
├── src/              # 源代码和 UI 组件
│   ├── App.vue
│   ├── main.ts
│   └── style.css     # 插件自定义样式
├── package.json      # 插件元数据和依赖
├── index.html        # 入口文件
├── .gitignore        # Git 忽略规则
└── README.md         # 文档（可选）
```

**不再需要的文件：**

- ❌ `tsconfig.json` - 使用共享配置
- ❌ `tsconfig.node.json` - 使用共享配置
- ❌ `vite.config.ts` - 使用共享配置
- ❌ `scripts/package.js` - 使用共享脚本

## 创建新插件

使用脚本快速创建：

```bash
cd plugins/_shared
./create-plugin.sh my-plugin
```

## 配置 package.json

在插件的 `package.json` 中使用共享配置：

```json
{
  "scripts": {
    "dev": "vite --config ../_shared/vite.config.ts",
    "build": "vite build --config ../_shared/vite.config.ts",
    "package": "node ../_shared/scripts/package.js"
  }
}
```

## 注意事项

- ✅ **UI 组件不共享** - 每个插件保持独立的 UI 实现
- ✅ **style.css 不共享** - 每个插件可以自定义样式
- ✅ **配置文件共享** - tsconfig、vite.config 等配置统一管理
- ⚠️ 如果插件需要特殊配置，可以在插件目录下创建自己的配置文件覆盖
- ⚠️ 共享配置的修改会影响所有使用它的插件
