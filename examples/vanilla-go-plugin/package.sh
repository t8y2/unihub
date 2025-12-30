#!/bin/bash

echo "📦 打包插件..."

# 先编译后端
./build.sh

# 删除旧的 ZIP
rm -f plugin.zip

# 打包
zip -r plugin.zip manifest.json frontend/ backend/main

echo "✅ 打包完成: plugin.zip"
echo ""
echo "测试方法："
echo "python3 -m http.server 8080"
echo "然后在插件商店输入: http://localhost:8080/plugin.zip"
