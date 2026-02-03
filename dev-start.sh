#!/bin/bash

# LibreChat 本地开发环境启动脚本

echo "🚀 启动 LibreChat 本地开发环境"
echo "================================"

# 检查数据库服务
echo "📦 检查数据库服务..."
if ! docker ps | grep -q chat-mongodb; then
    echo "启动数据库服务..."
    docker compose -f docker-compose.dev.yml up -d
    echo "等待数据库启动..."
    sleep 3
else
    echo "✓ 数据库服务已运行"
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    npm install
fi

echo ""
echo "================================"
echo "✅ 准备完成！"
echo ""
echo "现在可以运行以下命令启动开发服务器："
echo ""
echo "  # 启动后端 API (端口 3080)"
echo "  npm run backend:dev"
echo ""
echo "  # 启动前端 (端口 3090, 新开一个终端)"
echo "  npm run frontend:dev"
echo ""
echo "  # 或者分屏同时运行两个命令"
echo ""
echo "访问地址："
echo "  前端: http://localhost:3090"
echo "  API:  http://localhost:3080"
echo ""
echo "数据库服务："
echo "  MongoDB:     localhost:27017"
echo "  Meilisearch: localhost:7700"
echo ""
