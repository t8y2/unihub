#!/bin/bash

echo "🚀 UniHub 插件安装流程演示"
echo "================================"
echo ""

# 插件信息
PLUGIN_URL="http://localhost:8080/plugin.zip"
PLUGIN_NAME="modern-vue-plugin"

echo "📦 步骤 1: 插件已打包"
echo "   文件: examples/modern-vue-plugin/plugin.zip"
echo "   大小: 33 KB"
echo ""

echo "📋 步骤 2: 查看插件内容"
unzip -l examples/modern-vue-plugin/plugin.zip
echo ""

echo "📄 步骤 3: 查看插件配置"
echo "   从 package.json 读取配置..."
unzip -p examples/modern-vue-plugin/plugin.zip package.json | jq '.unihub'
echo ""

echo "🌐 步骤 4: 插件下载地址"
echo "   URL: $PLUGIN_URL"
echo "   状态: HTTP 服务器运行在 http://localhost:8080"
echo ""

echo "✅ 准备就绪！"
echo ""
echo "📝 下一步操作："
echo "   1. 启动 UniHub 应用: npm run dev"
echo "   2. 打开插件管理页面"
echo "   3. 输入插件 URL: $PLUGIN_URL"
echo "   4. 点击安装"
echo ""
echo "🔍 或者使用 curl 测试下载："
echo "   curl -I $PLUGIN_URL"
