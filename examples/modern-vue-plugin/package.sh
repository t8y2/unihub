#!/bin/bash

echo "📦 打包现代化 Vue 插件..."

# 确保构建目录存在
if [ ! -d "dist" ]; then
    echo "❌ 构建目录不存在，请先运行 npm run build"
    exit 1
fi

# 删除旧的打包文件
rm -f plugin.zip

# 创建临时目录
mkdir -p temp_package/dist temp_package/backend

# 复制构建后的文件
cp dist/index.html temp_package/dist/
cp -r backend/* temp_package/backend/

# 复制 package.json（作为配置文件）
cp package.json temp_package/

# 复制 README（可选）
if [ -f "README.md" ]; then
    cp README.md temp_package/
fi

# 创建 ZIP 包
cd temp_package
zip -r ../plugin.zip *
cd ..

# 清理临时目录
rm -rf temp_package

echo "✅ 打包完成: plugin.zip"
echo "📁 包含文件:"
unzip -l plugin.zip