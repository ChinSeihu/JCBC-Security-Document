#!/bin/bash

echo "🛑 停止并删除 Docker Compose 容器..."
docker-compose down --volumes --remove-orphans

echo "🧼 清理 Docker 缓存..."
docker system prune -a -f --volumes

echo "🔧 重新构建镜像并后台启动..."
docker-compose up -d --build

echo "✅ 当前运行中的容器："
docker ps
