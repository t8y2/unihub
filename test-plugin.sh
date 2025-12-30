#!/bin/bash

# 快速测试插件脚本

echo "🎯 UniHub 插件测试工具"
echo ""
echo "选择要测试的插件："
echo "1. 原生 JS + Go 插件（高性能）"
echo "2. React + Python 插件（数据处理）"
echo "3. Vue + Node.js 插件（快速开发）"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📦 准备原生 JS + Go 插件..."
    cd examples/vanilla-go-plugin
    ./build.sh
    ./package.sh
    ;;
  2)
    echo ""
    echo "📦 准备 React + Python 插件..."
    cd examples/react-python-plugin
    ./package.sh
    ;;
  3)
    echo ""
    echo "📦 准备 Vue + Node.js 插件..."
    cd examples/simple-plugin
    ./package.sh
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac

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
