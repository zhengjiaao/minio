#!/bin/bash

# linux/mac 默认启动 ./minio_start.sh

SCRIPT_PATH=$(readlink -f "$0")
CURRENT_DIR=$(dirname $SCRIPT_PATH)

# 配置用户/密码
export MINIO_ACCESS_KEY=username
export MINIO_SECRET_KEY=password

# 启动命令
${CURRENT_DIR}/minio server ${CURRENT_DIR}/data
