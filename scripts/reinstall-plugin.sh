#!/bin/bash

# 重新安装示例插件的脚本

echo "🔧 重新构建插件..."
cd examples/modern-vue-plugin
npm run build
npm run package

echo ""
echo "✅ 插件已打包完成！"
echo ""
echo "📝 下一步操作："
echo "1. 在 UniHub 中打开「插件管理」"
echo "2. 卸载旧版本的 modern-vue-plugin"
echo "3. 重新安装 examples/modern-vue-plugin/plugin.zip"
echo "4. 允许权限请求（包括 spawn 权限）"
echo ""
echo "💡 提示：新版本已添加 spawn 权限，可以使用 Sidecar 功能了！"
