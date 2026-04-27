# 商城微服务项目

这个仓库提供了一个可直接运行的商城后端脚手架，整体采用微服务架构组织。

当前版本的重点包括：
- 多模块 Maven 工程结构
- 网关加核心业务服务的基础链路
- 共享 API DTO 模块与公共基础库
- 已验证的核心交易流程：`inventory -> order -> payment`
- 已验证的认证流程：登录、刷新令牌、登出、令牌解析
- `inventory-service`、`order-service`、`payment-service` 基于 MySQL 持久化
- 上述三个核心服务同时具备基于 Redis 的幂等与缓存支持

当前实现仍然属于开发基线版本：
- `inventory-service`、`order-service`、`payment-service` 以 MySQL 为主存储，Redis 用于缓存或幂等控制
- `auth-service` 使用 MySQL 存储账号和会话，Redis 作为会话缓存，JWT 用于访问令牌和刷新令牌
- 三个核心服务在 MySQL 账号权限允许时，会在启动阶段自动创建数据库和表
- 服务之间调用基于 OpenFeign
- `cart`、`user`、`product` 目前仍然保留部分 mock / demo 实现
- RocketMQ、Nacos 注册与搜索能力留作下一阶段扩展

## 模块说明

- `mall-gateway`：API 网关，端口 `18080`
- `auth-service`：认证服务，端口 `18081`，支持密码登录、刷新令牌、登出、会话列表和令牌解析
- `user-service`：用户与地址服务，端口 `18082`
- `product-service`：商品与 SKU 服务，端口 `18083`
- `inventory-service`：库存校验、预占、释放、扣减服务，端口 `18084`
- `cart-service`：购物车服务，端口 `18085`
- `order-service`：订单提交、查询、取消、支付回调服务，端口 `18086`
- `payment-service`：支付创建、查询、模拟成功回调服务，端口 `18087`

## 目录结构

- `mall-dependencies`：只负责父级依赖 BOM 和插件版本管理，不放业务代码
- `mall-common`：通用核心能力、安全上下文和 Web 支撑代码
- `mall-api`：跨服务共享的 DTO 与请求响应模型
- `mall-gateway`：对外流量统一入口网关
- `mall-services`：核心业务微服务集合
- `mall-job`：为后续定时任务、离线作业预留的聚合模块
- `mall-web`：前端应用
- `deploy`：本地启动、停止、日志与运行时文件
- `docs`：项目文档和归档后的 SQL 快照

## 构建

使用 `D:` 盘安装的 Maven：

```powershell
& 'D:\apache-maven-3.6.3\bin\mvn.cmd' -q -DskipTests package
```

项目已经在 `.mvn/jvm.config` 和 `.mvn/maven.config` 中内置了低内存参数，因此在 16 GB 机器上本地构建和导入会更稳定。

## 启动与停止

启动全部本地服务：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1
```

本地启动脚本默认使用 `compact` 内存配置，针对 16 GB 开发机器做了优化：
- 为每个服务固定堆内存上限，而不是使用 JVM 默认值
- 使用更小的线程栈和更少的工作线程
- 降低 Hikari 与 Tomcat 线程数，适合本地开发
- 每个服务启动后增加短暂预热间隔，避免 8 个 JVM 同时冲高内存

可选示例：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1 -MemoryProfile standard
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1 -SkipPackage -Services product-service,mall-gateway
```

使用低内存默认参数同时启动后端和 Vite 前端开发服务：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-dev.ps1 -SkipPackage
```

停止脚本启动的全部本地服务：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\stop-local.ps1
```

启动脚本默认使用：
- Maven：`D:\apache-maven-3.6.3\bin\mvn.cmd`
- Java：`%JAVA_HOME%\bin\java.exe`，或 `PATH` 中的 `java`

核心中间件默认配置：
- 虚拟机地址：通过 `MALL_VM_HOST` 配置
- MySQL：`3306`，用户名和密码读取本地环境变量
- Redis：`6379`，密码读取本地环境变量
- Nacos：`8848`
- RocketMQ NameServer：`9876`

演示认证账号：
- 登录名：`demo`
- 登录名：`demo-phone`
- 登录名：`demo@example.com`
- 密码：通过 `MALL_AUTH_DEMO_PASSWORD` 配置

日志与 PID 文件输出位置：
- `deploy\logs`
- `deploy\run`

## 前端开发

前端项目位于 `mall-web`，默认脚本已经限制了较低的 Node 内存占用：

```powershell
cd .\mall-web
npm run dev
npm run build
```

在 16 GB 机器上，如果使用 IntelliJ IDEA，推荐采用以下低内存开发方式：
- 通过 `deploy\start-local.ps1` 或 `deploy\start-dev.ps1` 启动后端，而不是一次性在 IDE 里拉起 8 个 Spring Boot 配置
- 仅在需要单独调试某个服务时，再使用生成的 Spring Boot 运行配置
- 前端开发尽量使用 `mall-web` 下的 Vite 进程，而不是默认通过 IDE 调试 React 应用

## 已验证流程

以下核心流程已于 `2026-04-02` 在本地验证通过：

1. 通过 `order-service` 提交订单
2. 通过 `payment-service` 创建支付单
3. 模拟支付成功回调
4. 查询订单状态
5. 扣减后查询库存
6. 重启服务后再次查询同一订单和支付单

验证结果：
- 订单状态从 `10` 变为 `20`
- 支付状态从 `0` 变为 `2`
- SKU `20001` 库存从 `100` 变为 `99`
- SKU `20002` 库存从 `80` 变为 `79`
- 使用相同 `idempotencyKey` 重复提交时，返回的是同一个订单号
- 服务重启后，订单、支付和库存状态仍然可以从 MySQL 正常读取
- 已在虚拟机 MySQL 和 Redis 中间件环境下验证认证登录、刷新、登出与令牌解析流程
- 服务重启后令牌解析依旧可用，说明会话能够从 MySQL 回退恢复

## 常用命令

构建单个服务：

```powershell
& 'D:\apache-maven-3.6.3\bin\mvn.cmd' -pl mall-services/order-service -am -DskipTests package
```

手动运行单个服务：

```powershell
& 'D:\jdk21\bin\java.exe' -jar .\mall-services\order-service\target\order-service-1.0.0-SNAPSHOT.jar
```

## 下一步建议

- 将 `user`、`product`、`cart` 从 mock 数据迁移到 MySQL 或 Redis
- 为订单、支付和库存一致性补充 RocketMQ 事件链路
- 将网关和各服务接入 Nacos
- 增加集成测试和 OpenAPI YAML 输出
