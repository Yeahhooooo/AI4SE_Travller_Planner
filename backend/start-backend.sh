#!/bin/bash

# 旅行者规划器后端 Docker 启动脚本

echo "🚀 启动旅行者规划器后端服务..."

# 停止并删除现有容器（如果存在）
if [ "$(docker ps -aq -f name=traveler-backend)" ]; then
    echo "📦 停止现有容器..."
    docker stop traveler-backend 2>/dev/null
    docker rm traveler-backend 2>/dev/null
fi

# 启动新容器
echo "🌟 启动新的后端容器..."
docker run -d \
  --name traveler-backend \
  -p 3001:3001 \
  --restart unless-stopped \
  traveler-planner-backend:latest

# 检查容器状态
echo "⏳ 等待服务启动..."
sleep 3

if [ "$(docker ps -q -f name=traveler-backend)" ]; then
    echo "✅ 后端服务启动成功！"
    echo "🌐 访问地址: http://localhost:3001"
    echo "📋 查看日志: docker logs traveler-backend"
    echo "🛑 停止服务: docker stop traveler-backend"
else
    echo "❌ 后端服务启动失败！"
    echo "📋 查看错误日志: docker logs traveler-backend"
    exit 1
fi