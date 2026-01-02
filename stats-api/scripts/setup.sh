#!/bin/bash

# UniHub Stats API 部署脚本

set -e

echo "🚀 UniHub Stats API 部署向导"
echo "================================"
echo ""

# 检查是否安装了必要的工具
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请访问 https://nodejs.org 安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI 安装完成"
else
    echo "✅ Vercel CLI 已安装"
fi
echo ""

# 提示创建 Gist
echo "📝 步骤 1: 创建 GitHub Gist"
echo "================================"
echo "1. 访问 https://gist.github.com"
echo "2. 创建新 Gist:"
echo "   - 文件名: unihub-plugin-stats.json"
echo "   - 内容: {}"
echo "   - 类型: Secret (推荐)"
echo "3. 创建后，复制 URL 中的 Gist ID"
echo ""
read -p "请输入 Gist ID: " GIST_ID

if [ -z "$GIST_ID" ]; then
    echo "❌ Gist ID 不能为空"
    exit 1
fi

echo "✅ Gist ID: $GIST_ID"
echo ""

# 提示创建 Token
echo "🔑 步骤 2: 创建 GitHub Token"
echo "================================"
echo "1. 访问 https://github.com/settings/tokens"
echo "2. Generate new token (classic)"
echo "3. 权限选择: gist"
echo "4. 生成并复制 token"
echo ""
read -sp "请输入 GitHub Token: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GitHub Token 不能为空"
    exit 1
fi

echo "✅ GitHub Token 已设置"
echo ""

# 创建 .env 文件用于本地测试
echo "📝 创建本地配置文件..."
cat > .env << EOF
GIST_ID=$GIST_ID
GITHUB_TOKEN=$GITHUB_TOKEN
EOF
echo "✅ .env 文件已创建"
echo ""

# 登录 Vercel
echo "🔐 步骤 3: 登录 Vercel"
echo "================================"
vercel login
echo ""

# 部署到 Vercel
echo "🚀 步骤 4: 部署到 Vercel"
echo "================================"
echo "开始部署..."
vercel

echo ""
echo "⚙️  步骤 5: 设置环境变量"
echo "================================"

# 设置环境变量
echo "设置 GIST_ID..."
echo "$GIST_ID" | vercel env add GIST_ID production

echo "设置 GITHUB_TOKEN..."
echo "$GITHUB_TOKEN" | vercel env add GITHUB_TOKEN production

echo "✅ 环境变量设置完成"
echo ""

# 生产部署
echo "🚀 步骤 6: 生产部署"
echo "================================"
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步:"
echo "1. 复制 Vercel 给你的 URL (类似 https://xxx.vercel.app)"
echo "2. 在主项目的 .env 文件中添加:"
echo "   VITE_STATS_API_URL=https://your-project.vercel.app/api"
echo "3. 重启主项目"
echo ""
echo "🧪 测试 API:"
echo "curl https://your-project.vercel.app/api/stats?pluginId=test"
echo ""
