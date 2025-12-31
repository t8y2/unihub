#!/bin/bash

# 快速测试插件脚本

echo "🎯 UniHub 插件测试工具"
echo ""

PLUGIN_DIR="examples/modern-vue-plugin"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "❌ 插件目录不存在: $PLUGIN_DIR"
  exit 1
fi

echo "📦 构建插件..."
cd "$PLUGIN_DIR"

if [ ! -f "package.json" ]; then
  echo "❌ package.json 不存在"
  exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
  echo "📥 安装依赖..."
  npm install
fi

# 构建
echo "🔨 构建中..."
npm run build

# 打包
echo "📦 打包中..."
npm run package

if [ ! -f "plugin.zip" ]; then
  echo "❌ 打包失败"
  exit 1
fi

echo ""
echo "✅ 插件已打包完成！"
echo ""
echo "🚀 启动测试服务器..."
echo ""
echo "插件 URL: http://localhost:8080/plugin.zip"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

python3 -m http.server 8080
