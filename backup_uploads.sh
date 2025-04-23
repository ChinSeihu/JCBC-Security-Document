#!/bin/bash

# 设置路径
UPLOADS_DIR="./uploads"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
NEW_BACKUP="$BACKUP_DIR/uploads-$TIMESTAMP"

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

# 复制 uploads 文件夹
cp -r "$UPLOADS_DIR" "$NEW_BACKUP"
echo "✅ 备份完成: $NEW_BACKUP"

# 获取已有的备份目录（按时间升序排列）
BACKUPS=($(ls -1 $BACKUP_DIR | grep '^uploads-' | sort))

# 计算总数
NUM_BACKUPS=${#BACKUPS[@]}

# 保留最近的 5 个备份，超出的删除
if [ $NUM_BACKUPS -gt 5 ]; then
    NUM_TO_DELETE=$((NUM_BACKUPS - 5))
    for ((i=0; i<$NUM_TO_DELETE; i++)); do
        TO_DELETE="${BACKUPS[$i]}"
        rm -rf "$BACKUP_DIR/$TO_DELETE"
        echo "🗑️ 删除旧备份: $BACKUP_DIR/$TO_DELETE"
    done
fi
