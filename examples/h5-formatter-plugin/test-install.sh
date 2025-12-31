#!/bin/bash

# H5 Formatter 插件本地测试脚本

echo "🧪 H5 Formatter 插件本地测试"
echo "================================"

# 检查插件包是否存在
if [ ! -f "plugin.zip" ]; then
  echo "❌ plugin.zip 不存在，请先运行: npm run build && npm run package"
  exit 1
fi

echo "✅ 找到 plugin.zip"

# 启动本地服务器
echo ""
echo "🚀 启动本地 HTTP 服务器..."
echo "📍 URL: http://localhost:8080/plugin.zip"
echo ""
echo "📝 测试步骤:"
echo "   1. 打开 UniHub"
echo "   2. 进入「插件管理」→「手动安装」"
echo "   3. 输入 URL: http://localhost:8080/plugin.zip"
echo "   4. 点击「从 URL 安装」"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo ""

# 启动 Python HTTP 服务器
python3 -m http.server 8080
