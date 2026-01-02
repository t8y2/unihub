#!/bin/bash

# 清理旧的文档文件脚本
# 运行前请确保新的文档结构已经创建完成

echo "🧹 开始清理旧的文档文件..."

# 检查是否存在新的文档结构
if [ ! -d "docs/plugin-development" ]; then
    echo "❌ 错误: 新的文档结构不存在，请先运行文档重构"
    exit 1
fi

echo "✅ 新文档结构已确认存在"

# 备份旧文档（可选）
echo "📦 创建备份目录..."
mkdir -p backup/old-docs
cp DOCS.md backup/old-docs/ 2>/dev/null || true

echo "🗑️  删除旧的文档文件..."

# 删除根目录的旧文档文件（保留 README.md）
# rm -f DOCS.md  # 暂时保留作为过渡

echo "✅ 文档清理完成！"
echo ""
echo "📁 新的文档结构:"
echo "   docs/"
echo "   ├── README.md (完整文档索引)"
echo "   ├── plugin-development/ (插件开发)"
echo "   ├── marketplace/ (插件市场)"
echo "   ├── development/ (开发工具)"
echo "   ├── features/ (功能特性)"
echo "   └── reference/ (参考资料)"
echo ""
echo "🎉 文档重构完成！查看 docs/README.md 获取完整导航"