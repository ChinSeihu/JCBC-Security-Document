#!/bin/bash

# 删除本地 uploads 文件夹
rm -rf ./uploads
rm

# 上传当前目录（JCBC-SD）到 EC2 的 products 目录下
scp -i ./ec2key.pem -r . ec2-user@18.183.116.156:products/JCBC-SD

echo "✅ Upload complete"
