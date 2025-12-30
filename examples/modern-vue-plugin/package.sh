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
mkdir -p temp_package/frontend temp_package/backend

# 复制构建后的文件
cp dist/index.html temp_package/frontend/
cp -r backend/* temp_package/backend/

# 创建 manifest.json
cat > temp_package/manifest.json << EOF
{
  "id": "com.example.modern-vue",
  "name": "现代化 Vue 插件",
  "version": "1.0.0",
  "description": "使用 Vite + Vue 3 + TypeScript 构建的现代化插件",
  "author": {
    "name": "UniHub Team"
  },
  "main": "frontend/index.html",
  "icon": "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "category": "tool",
  "keywords": ["vue", "typescript", "modern", "encode", "encrypt"],
  "permissions": ["backend"]
}
EOF

# 创建 ZIP 包
cd temp_package
zip -r ../plugin.zip *
cd ..

# 清理临时目录
rm -rf temp_package

echo "✅ 打包完成: plugin.zip"
echo "📁 包含文件:"
unzip -l plugin.zip