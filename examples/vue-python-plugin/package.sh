#!/bin/bash

echo "📦 打包 Vue + Python 插件..."

# 删除旧的打包文件
rm -f plugin.zip

# 创建 ZIP 包
zip -r plugin.zip manifest.json frontend/ backend/

echo "✅ 打包完成: plugin.zip"