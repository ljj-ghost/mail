# Mall Microservices

This repository contains a runnable backend scaffold for an online mall built with a microservice architecture.

The current delivery focuses on:
- multi-module Maven project structure
- gateway plus core business services
- shared API DTO modules and common libraries
- a verified core transaction flow for `inventory -> order -> payment`
- a verified auth flow for login, token refresh, logout, and token parsing
- MySQL-backed persistence for `inventory-service`, `order-service`, and `payment-service`
- Redis-based idempotency and cache support for the same three core services

The current implementation is a development baseline:
- `inventory-service`, `order-service`, and `payment-service` use MySQL as the primary store and Redis for cache or idempotency
- `auth-service` uses MySQL for accounts and sessions, Redis for session cache, and JWT for access or refresh tokens
- the three core services auto-create their databases and tables on startup when the MySQL account has permission
- service-to-service calls use OpenFeign
- cart, user, and product are still mock/demo implementations
- RocketMQ, Nacos registration, and search are reserved for the next phase

## Modules

- `mall-gateway`: API gateway, port `18080`
- `auth-service`: auth service, port `18081`, supports password login, refresh token, logout, session list, and token parse
- `user-service`: user and address service, port `18082`
- `product-service`: product and SKU service, port `18083`
- `inventory-service`: stock check, reserve, release, deduct, port `18084`
- `cart-service`: shopping cart service, port `18085`
- `order-service`: order submit, query, cancel, pay callback, port `18086`
- `payment-service`: payment create, query, mock success callback, port `18087`

## Build

Use the Maven installed on drive `D:`:

```powershell
& 'D:\apache-maven-3.6.3\bin\mvn.cmd' -q -DskipTests package
```

The project now includes low-memory Maven defaults in `.mvn/jvm.config` and `.mvn/maven.config`, so local package and import work better on 16 GB machines.

## Start And Stop

Start all local services:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1
```

The local startup script now defaults to the `compact` memory profile, which is tuned for 16 GB development machines:
- fixed per-service heap caps instead of JVM defaults
- smaller thread stacks and fewer worker threads
- lower Hikari and Tomcat thread counts for local development
- a short warm-up pause after each service to avoid eight JVMs peaking at once

Optional examples:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1 -MemoryProfile standard
powershell -ExecutionPolicy Bypass -File .\deploy\start-local.ps1 -SkipPackage -Services product-service,mall-gateway
```

Start backend plus the Vite frontend dev server with low-memory defaults:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\start-dev.ps1 -SkipPackage
```

Stop all local services started by the script:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\stop-local.ps1
```

The startup script defaults to:
- Maven: `D:\apache-maven-3.6.3\bin\mvn.cmd`
- Java: `%JAVA_HOME%\bin\java.exe`, or `java` from `PATH`

Core middleware defaults:
- VM host: configure with `MALL_VM_HOST`
- MySQL: `3306`, username and password from local environment variables
- Redis: `6379`, password from local environment variables
- Nacos: `8848`
- RocketMQ NameServer: `9876`

Demo auth accounts:
- login name: `demo`
- login name: `demo-phone`
- login name: `demo@example.com`
- password: configure with `MALL_AUTH_DEMO_PASSWORD`

Logs and PID files are written to:
- `deploy\logs`
- `deploy\run`

## Frontend Dev

The frontend lives in `mall-web` and its default scripts are now capped for lower Node memory usage:

```powershell
cd .\mall-web
npm run dev
npm run build
```

For a shared low-memory workflow in IntelliJ IDEA on a 16 GB machine:
- start the backend through `deploy\start-local.ps1` or `deploy\start-dev.ps1` instead of launching eight Spring Boot configurations at once
- use the generated Spring Boot run configurations only when you need to debug one service in isolation
- keep frontend development in the `mall-web` Vite process instead of running the React app from the IDE debugger by default

## Verified Flow

The following core flow was verified locally on `2026-04-02`:

1. submit order through `order-service`
2. create payment through `payment-service`
3. simulate payment success callback
4. query order status
5. query inventory after deduction
6. restart services and query the same order and payment again

Verified result:
- order status changed from `10` to `20`
- pay status changed from `0` to `2`
- SKU `20001` stock changed from `100` to `99`
- SKU `20002` stock changed from `80` to `79`
- repeated submit with the same `idempotencyKey` returned the same order number
- after service restart, order, payment, and stock state were still readable from MySQL
- auth login, refresh, logout, and token parse were verified against the VM MySQL and Redis middleware
- auth token parse still worked after service restart, confirming session fallback from MySQL

## Useful Commands

Build a single service:

```powershell
& 'D:\apache-maven-3.6.3\bin\mvn.cmd' -pl mall-services/order-service -am -DskipTests package
```

Run one service manually:

```powershell
& 'D:\jdk21\bin\java.exe' -jar .\mall-services\order-service\target\order-service-1.0.0-SNAPSHOT.jar
```

## Next Suggested Steps

- migrate user, product, and cart from mock data to MySQL or Redis
- add RocketMQ events for order, payment, and inventory consistency
- connect gateway and services to Nacos
- add integration tests and OpenAPI YAML output
