# 官方插件模板

这是官方插件的标准模板，包含所有必要的配置和 UI 组件。

## 使用方法

```bash
# 复制模板创建新插件
cp -r plugins/_template plugins/your-plugin-name

# 进入插件目录
cd plugins/your-plugin-name

# 修改 package.json 中的插件信息
# 实现 src/App.vue 的功能
# 安装依赖并开发
npm install
npm run dev
```

## 已包含的内容

- ✅ 完整的 Tailwind 配置（包含 CSS 变量）
- ✅ 完整的样式文件（包含深色模式）
- ✅ UI 组件（Button, Label, Input）
- ✅ 构建配置
- ✅ 打包脚本

## 只需修改

1. `package.json` - 插件元数据
2. `src/App.vue` - 插件功能实现

其他文件都可以直接使用！
