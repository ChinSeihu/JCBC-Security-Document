#!/bin/bash

# 删除本地 uploads 文件夹
rm -rf ./uploads
rm

# 上传当前目录（JCBC-SD）到 EC2 的 products 目录下
scp -i ./Ec2Key.pem -r . ec2-user@3.114.18.119:products/JCBC-SD

echo "✅ Upload complete"
