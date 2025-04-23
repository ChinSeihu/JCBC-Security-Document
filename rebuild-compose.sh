#!/bin/bash

SERVICE=app

echo "📂 备份 uploads 文件夹..."
./backup_uploads.sh

echo "🛑 停止并删除 $SERVICE 容器..."
docker-compose stop $SERVICE
docker-compose rm -f $SERVICE

echo "🔧 重新构建 $SERVICE 并启动..."
docker-compose up -d --build $SERVICE

echo "🧹 清理未使用的镜像和容器（保留数据卷）..."
docker system prune -f

echo "✅ 当前运行中的容器："
docker ps
