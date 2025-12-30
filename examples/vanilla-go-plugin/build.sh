#!/bin/bash

echo "🔨 编译 Go 后端..."

cd backend

# 编译为当前平台的二进制文件
go build -o main main.go

echo "✅ 编译完成"
