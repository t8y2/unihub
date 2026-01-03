#!/bin/bash

# 简化版插件创建脚本 - 直接复制模板
# 用法: ./scripts/create-plugin-simple.sh <plugin-name>

set -e

if [ "$#" -ne 1 ]; then
    echo "用法: $0 <plugin-name>"
    echo "示例: $0 base64-tool"
    exit 1
fi

PLUGIN_NAME=$1
PLUGIN_DIR="plugins/$PLUGIN_NAME"

if [ -d "$PLUGIN_DIR" ]; then
    echo "❌ 错误: 插件目录已存在: $PLUGIN_DIR"
    exit 1
fi

echo "🚀 创建插件: $PLUGIN_NAME"
echo ""

# 复制模板
echo "📁 复制模板..."
cp -r plugins/_template "$PLUGIN_DIR"

echo ""
echo "✅ 插件创建完成！"
echo ""
echo "下一步："
echo "1. 编辑 $PLUGIN_DIR/package.json 修改插件信息"
echo "2. 实现 $PLUGIN_DIR/src/App.vue 的功能"
echo "3. 运行 cd $PLUGIN_DIR && npm install"
echo "4. 运行 npm run dev 开始开发"
echo ""
echo "提示: 所有样式和 UI 组件都已配置好，直接使用即可！"
