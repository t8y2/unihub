#!/bin/bash

echo "📦 打包 React + Python 插件..."

# 给 Python 脚本添加执行权限
chmod +x backend/main.py

# 删除旧的 ZIP
rm -f plugin.zip

# 打包
zip -r plugin.zip manifest.json frontend/ backend/

echo "✅ 打包完成: plugin.zip"
