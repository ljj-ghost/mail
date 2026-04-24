#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
fi

if [[ ! -f ".env" ]]; then
  echo ".env 不存在，请先创建配置文件。"
  exit 1
fi

set -a
. ./.env
set +a

if ! command -v docker >/dev/null 2>&1; then
  echo "检测到 Docker 未安装，开始自动安装。"
  bash ./install-docker.sh
fi

mkdir -p \
  data/mysql \
  data/redis \
  data/rocketmq/namesrv/logs \
  data/rocketmq/broker/store \
  data/rocketmq/broker/logs \
  data/nacos/logs \
  data/nacos/data \
  rocketmq/conf

sed "s/__HOST_IP__/${HOST_IP}/g" rocketmq/conf/broker.conf.template > rocketmq/conf/broker.conf
chmod -R 0777 data/rocketmq 2>/dev/null || true
chmod 0666 rocketmq/conf/broker.conf 2>/dev/null || true

docker compose pull
docker compose up -d
docker compose ps

echo
echo "服务已经启动，常用访问地址如下："
echo "MySQL: ${HOST_IP}:3306  用户: root  密码: ${MYSQL_ROOT_PASSWORD}"
echo "Redis: ${HOST_IP}:6379  密码: 见 .env 中 REDIS_PASSWORD"
echo "Nacos: http://${HOST_IP}:8848/nacos"
echo "RocketMQ NameServer: ${HOST_IP}:9876"
echo "RocketMQ Broker: ${HOST_IP}:10911"
echo "RocketMQ Dashboard: http://${HOST_IP}:8081"
