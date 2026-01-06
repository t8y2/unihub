#!/bin/bash

# UniHub Plugin CLI 发布脚本

set -e

echo "🚀 准备发布 @unihubjs/plugin-cli"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误: 请在 tools/plugin-cli 目录下运行此脚本"
  exit 1
fi

# 检查是否登录 npm
echo "📝 检查 npm 登录状态..."
if ! npm whoami > /dev/null 2>&1; then
  echo "❌ 未登录 npm，请先运行: npm login"
  exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ 已登录为: $NPM_USER"
echo ""

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 当前版本: $CURRENT_VERSION"
echo ""

# 询问版本类型
echo "请选择版本更新类型:"
echo "  1) patch (补丁版本, 如 1.0.0 -> 1.0.1)"
echo "  2) minor (小版本, 如 1.0.0 -> 1.1.0)"
echo "  3) major (大版本, 如 1.0.0 -> 2.0.0)"
echo "  4) 跳过版本更新，直接发布"
echo ""
read -p "请输入选项 (1-4): " VERSION_TYPE

case $VERSION_TYPE in
  1)
    echo "📈 更新 patch 版本..."
    npm version patch --no-git-tag-version
    ;;
  2)
    echo "📈 更新 minor 版本..."
    npm version minor --no-git-tag-version
    ;;
  3)
    echo "📈 更新 major 版本..."
    npm version major --no-git-tag-version
    ;;
  4)
    echo "⏭️  跳过版本更新"
    ;;
  *)
    echo "❌ 无效的选项"
    exit 1
    ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ 新版本: $NEW_VERSION"
echo ""

# 确认发布
read -p "确认发布 @unihubjs/plugin-cli@$NEW_VERSION? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ 已取消发布"
  exit 0
fi

# 确保 bin 文件有执行权限
echo "🔧 设置执行权限..."
chmod +x bin/cli.js

# 发布到 npm
echo "📤 发布到 npm..."
echo ""
echo "如果你的账号启用了两步验证，请准备好验证码"
read -p "请输入 OTP 验证码（如果没有启用两步验证，直接回车）: " OTP

if [ -n "$OTP" ]; then
  npm publish --access public --otp="$OTP"
else
  npm publish --access public
fi

echo ""
echo "✅ 发布成功！"
echo ""
echo "📋 后续步骤:"
echo "  1. 提交代码: git add . && git commit -m 'chore: release v$NEW_VERSION'"
echo "  2. 创建标签: git tag v$NEW_VERSION"
echo "  3. 推送代码: git push && git push --tags"
echo "  4. 在 GitHub 创建 Release"
echo ""
echo "🔗 查看包: https://www.npmjs.com/package/@unihubjs/plugin-cli"
echo ""
echo "🎉 完成！"
