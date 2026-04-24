# Docker 基础设施部署包

这套部署包默认启动以下服务：

- MySQL 8.0
- Redis 7.4
- RocketMQ 4.9.6
- Nacos 2.3.2

当前默认按你的机器 IP `192.168.145.128` 和密码 `123456` 预填了配置，适合本地开发或测试环境。上线前请务必改掉默认密码。

## 目录说明

- `docker-compose.yml`: 服务编排文件
- `.env`: 运行参数
- `install-docker.sh`: 自动安装 Docker 和 Compose
- `start.sh`: 一键拉起所有服务
- `mysql/init/01-nacos-mysql.sql`: 官方 Nacos MySQL 初始化表结构

## 使用方式

在 Linux 服务器上进入这个目录后执行：

```bash
chmod +x install-docker.sh start.sh
./start.sh
```

如果你的网卡 IP 变了，先改 `.env` 里的 `HOST_IP`，再启动。

## 常用命令

```bash
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f mysql
docker compose logs -f nacos
docker compose logs -f rmqbroker
```

## 对外端口

- `3306`: MySQL
- `6379`: Redis
- `8848`: Nacos 控制台
- `9848`: Nacos gRPC
- `9849`: Nacos 集群通信
- `9876`: RocketMQ NameServer
- `10909`: RocketMQ Broker VIP Channel
- `10911`: RocketMQ Broker
- `10912`: RocketMQ HA
- `8081`: RocketMQ Dashboard

## 说明

- Docker 镜像默认通过 `docker.m.daocloud.io` 代理拉取，适合当前这台机器的网络环境。
- Nacos 当前使用 MySQL 持久化，初始化 SQL 来自官方仓库。
- 所有容器端口默认只绑定到 `.env` 里的 `HOST_IP`，这样可以避开宿主机本地已有端口占用。
- `start.sh` 会根据 `.env` 里的 `HOST_IP` 自动生成 `rocketmq/conf/broker.conf`。
- 当前 `Nacos` 默认关闭鉴权，适合开发环境；生产环境建议开启并单独做安全加固。
