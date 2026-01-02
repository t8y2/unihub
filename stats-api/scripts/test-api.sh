#!/bin/bash

# API 测试脚本

if [ -z "$1" ]; then
    echo "用法: ./test-api.sh <API_URL>"
    echo "示例: ./test-api.sh https://your-project.vercel.app/api"
    exit 1
fi

API_URL=$1
PLUGIN_ID="com.unihub.test"
USER_ID="user_$(date +%s)"

echo "🧪 测试 UniHub Stats API"
echo "API URL: $API_URL"
echo "================================"
echo ""

# 测试获取统计
echo "1️⃣ 测试获取统计 (GET /stats)"
echo "curl $API_URL/stats?pluginId=$PLUGIN_ID"
curl -s "$API_URL/stats?pluginId=$PLUGIN_ID" | jq .
echo ""

# 测试记录下载
echo "2️⃣ 测试记录下载 (POST /download)"
echo "curl -X POST $API_URL/download"
curl -s -X POST "$API_URL/download" \
  -H "Content-Type: application/json" \
  -d "{\"pluginId\":\"$PLUGIN_ID\",\"userId\":\"$USER_ID\"}" | jq .
echo ""

# 再次获取统计，验证下载量增加
echo "3️⃣ 验证下载量增加"
curl -s "$API_URL/stats?pluginId=$PLUGIN_ID" | jq .
echo ""

# 测试提交评分
echo "4️⃣ 测试提交评分 (POST /rate)"
echo "curl -X POST $API_URL/rate"
curl -s -X POST "$API_URL/rate" \
  -H "Content-Type: application/json" \
  -d "{\"pluginId\":\"$PLUGIN_ID\",\"rating\":5,\"userId\":\"$USER_ID\"}" | jq .
echo ""

# 测试获取用户评分
echo "5️⃣ 测试获取用户评分 (GET /user-rating)"
echo "curl $API_URL/user-rating?pluginId=$PLUGIN_ID&userId=$USER_ID"
curl -s "$API_URL/user-rating?pluginId=$PLUGIN_ID&userId=$USER_ID" | jq .
echo ""

echo "✅ 测试完成！"
