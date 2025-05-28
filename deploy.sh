#!/bin/bash

# 删除本地 uploads 文件夹,防止覆盖线上文件,可自己备份到项目文件意外的地方
rm -rf ./uploads
rm -rf ./node_modules

# 上传当前目录（JCBC-SD）到 EC2 的 products 目录下
scp -i ./Ec2Key.pem -r . ec2-user@3.114.18.119:products/JCBC-SD

echo "✅ Upload complete"
