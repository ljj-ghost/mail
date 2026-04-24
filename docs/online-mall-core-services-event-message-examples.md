# 订单、支付、库存核心服务事件消息体 JSON 示例

## 1. 文档说明

- 文档名称：订单、支付、库存核心服务事件消息体示例
- 目标：统一三大核心服务的 MQ 事件结构、字段含义和示例报文
- 适用范围：`order-service`、`payment-service`、`inventory-service`
- 消息中间件：RocketMQ

## 2. 统一消息规范

## 2.1 Topic 规划

| Topic | 生产者 | 主要事件 |
| --- | --- | --- |
| `order-event` | `order-service` | `order.created` `order.cancelled` `order.paid` `order.finished` |
| `payment-event` | `payment-service` | `payment.succeeded` `payment.failed` `refund.succeeded` |
| `inventory-event` | `inventory-service` | `inventory.reserved` `inventory.released` `inventory.deducted` |

## 2.2 通用消息结构

```json
{
  "eventId": "evt_202604021300000001",
  "eventType": "order.created",
  "topic": "order-event",
  "tag": "CREATED",
  "producer": "order-service",
  "bizNo": "202604021234567890",
  "bizType": "ORDER",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:00:00.123+08:00",
  "version": 1,
  "payload": {}
}
```

## 2.3 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `eventId` | string | 事件唯一 ID，用于消费幂等 |
| `eventType` | string | 业务事件类型 |
| `topic` | string | MQ Topic |
| `tag` | string | MQ Tag |
| `producer` | string | 事件生产服务 |
| `bizNo` | string | 主业务编号，如订单号、支付单号 |
| `bizType` | string | 业务类型，如 `ORDER`、`PAYMENT` |
| `traceId` | string | 链路追踪 ID |
| `occurTime` | string | 事件发生时间 |
| `version` | number | 事件版本号 |
| `payload` | object | 业务负载 |

## 2.4 消费幂等建议

- 以 `eventId` 做消费幂等
- 消费记录表唯一键：`consumerGroup + eventId`
- 消费成功后写入消费记录
- 重复消息直接返回成功

## 3. order-service 事件

## 3.1 `order.created`

### 3.1.1 触发时机

- 订单主数据落库成功
- 库存预占成功
- 优惠券锁定成功

### 3.1.2 主要消费者

- `notification-service`
- `report-service`
- `payment-service`

### 3.1.3 JSON 示例

```json
{
  "eventId": "evt_202604021301000001",
  "eventType": "order.created",
  "topic": "order-event",
  "tag": "CREATED",
  "producer": "order-service",
  "bizNo": "202604021234567890",
  "bizType": "ORDER",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:01:00.123+08:00",
  "version": 1,
  "payload": {
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "orderType": 1,
    "orderStatus": 10,
    "payStatus": 0,
    "sourceType": 1,
    "productAmount": 299.00,
    "discountAmount": 30.00,
    "freightAmount": 0.00,
    "payAmount": 269.00,
    "couponAmount": 20.00,
    "promotionAmount": 10.00,
    "submitTime": "2026-04-02T13:00:58.100+08:00",
    "expireTime": "2026-04-02T13:30:58.100+08:00",
    "items": [
      {
        "orderItemNo": "OI20260402100001",
        "skuId": 20001,
        "spuId": 10001,
        "skuName": "iPhone 16 256G 黑色",
        "buyPrice": 269.00,
        "buyQuantity": 1,
        "itemAmount": 269.00
      }
    ]
  }
}
```

## 3.2 `order.cancelled`

### 3.2.1 触发时机

- 用户主动取消
- 超时关单
- 后台关闭订单

### 3.2.2 主要消费者

- `inventory-service`
- `promotion-service`
- `payment-service`
- `notification-service`

### 3.2.3 JSON 示例

```json
{
  "eventId": "evt_202604021331000001",
  "eventType": "order.cancelled",
  "topic": "order-event",
  "tag": "CANCELLED",
  "producer": "order-service",
  "bizNo": "202604021234567890",
  "bizType": "ORDER",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:31:00.123+08:00",
  "version": 1,
  "payload": {
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "cancelType": "TIMEOUT",
    "cancelReason": "订单超时未支付",
    "orderStatus": 50,
    "payStatus": 0,
    "cancelTime": "2026-04-02T13:31:00.100+08:00",
    "couponLocks": [
      {
        "couponCode": "CPN202604020001"
      }
    ],
    "stockReservations": [
      {
        "reserveNo": "RSV202604020001",
        "skuId": 20001,
        "quantity": 1
      }
    ]
  }
}
```

## 3.3 `order.paid`

### 3.3.1 触发时机

- 支付成功回写订单成功

### 3.3.2 主要消费者

- `inventory-service`
- `logistics-service`
- `notification-service`
- `report-service`

### 3.3.3 JSON 示例

```json
{
  "eventId": "evt_202604021305000001",
  "eventType": "order.paid",
  "topic": "order-event",
  "tag": "PAID",
  "producer": "order-service",
  "bizNo": "202604021234567890",
  "bizType": "ORDER",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:05:00.123+08:00",
  "version": 1,
  "payload": {
    "orderNo": "202604021234567890",
    "paymentNo": "PAY20260402111111",
    "userId": 1001001,
    "payChannel": 1,
    "payAmount": 269.00,
    "payTime": "2026-04-02T13:04:58.900+08:00",
    "orderStatus": 20,
    "items": [
      {
        "orderItemNo": "OI20260402100001",
        "skuId": 20001,
        "quantity": 1
      }
    ]
  }
}
```

## 3.4 `order.finished`

### 3.4.1 触发时机

- 用户确认收货
- 系统自动完成

### 3.4.2 JSON 示例

```json
{
  "eventId": "evt_202604051800000001",
  "eventType": "order.finished",
  "topic": "order-event",
  "tag": "FINISHED",
  "producer": "order-service",
  "bizNo": "202604021234567890",
  "bizType": "ORDER",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-05T18:00:00.123+08:00",
  "version": 1,
  "payload": {
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "finishTime": "2026-04-05T18:00:00.100+08:00",
    "orderStatus": 40,
    "items": [
      {
        "orderItemNo": "OI20260402100001",
        "skuId": 20001,
        "quantity": 1
      }
    ]
  }
}
```

## 4. payment-service 事件

## 4.1 `payment.succeeded`

### 4.1.1 触发时机

- 支付回调验签成功
- 支付单状态更新成功

### 4.1.2 主要消费者

- `order-service`
- `notification-service`
- `report-service`

### 4.1.3 JSON 示例

```json
{
  "eventId": "evt_202604021304590001",
  "eventType": "payment.succeeded",
  "topic": "payment-event",
  "tag": "PAY_SUCCEEDED",
  "producer": "payment-service",
  "bizNo": "PAY20260402111111",
  "bizType": "PAYMENT",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:04:59.123+08:00",
  "version": 1,
  "payload": {
    "paymentNo": "PAY20260402111111",
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "payChannel": 1,
    "payStatus": 2,
    "payAmount": 269.00,
    "currency": "CNY",
    "thirdTradeNo": "ALI202604021357990001",
    "payTime": "2026-04-02T13:04:58.900+08:00",
    "notifyTime": "2026-04-02T13:04:59.120+08:00"
  }
}
```

## 4.2 `payment.failed`

### 4.2.1 触发时机

- 渠道明确返回支付失败
- 支付单关闭前明确为失败

### 4.2.2 JSON 示例

```json
{
  "eventId": "evt_202604021305300001",
  "eventType": "payment.failed",
  "topic": "payment-event",
  "tag": "PAY_FAILED",
  "producer": "payment-service",
  "bizNo": "PAY20260402111111",
  "bizType": "PAYMENT",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:05:30.123+08:00",
  "version": 1,
  "payload": {
    "paymentNo": "PAY20260402111111",
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "payChannel": 1,
    "payStatus": 3,
    "failCode": "CHANNEL_PAY_FAIL",
    "failMessage": "用户支付失败或渠道拒绝",
    "occurTime": "2026-04-02T13:05:30.100+08:00"
  }
}
```

## 4.3 `payment.closed`

### 4.3.1 触发时机

- 订单取消后关闭支付单
- 支付超时自动关闭

### 4.3.2 JSON 示例

```json
{
  "eventId": "evt_202604021331050001",
  "eventType": "payment.closed",
  "topic": "payment-event",
  "tag": "PAY_CLOSED",
  "producer": "payment-service",
  "bizNo": "PAY20260402111111",
  "bizType": "PAYMENT",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:31:05.123+08:00",
  "version": 1,
  "payload": {
    "paymentNo": "PAY20260402111111",
    "orderNo": "202604021234567890",
    "closeReason": "ORDER_CANCELLED",
    "closeTime": "2026-04-02T13:31:05.100+08:00",
    "payStatus": 4
  }
}
```

## 4.4 `refund.succeeded`

### 4.4.1 触发时机

- 退款回调验签成功
- 退款单状态更新成功

### 4.4.2 主要消费者

- `order-service`
- `notification-service`
- `report-service`

### 4.4.3 JSON 示例

```json
{
  "eventId": "evt_202604031015000001",
  "eventType": "refund.succeeded",
  "topic": "payment-event",
  "tag": "REFUND_SUCCEEDED",
  "producer": "payment-service",
  "bizNo": "REF20260403000001",
  "bizType": "REFUND",
  "traceId": "trace_77bca109d002",
  "occurTime": "2026-04-03T10:15:00.123+08:00",
  "version": 1,
  "payload": {
    "refundNo": "REF20260403000001",
    "paymentNo": "PAY20260402111111",
    "orderNo": "202604021234567890",
    "userId": 1001001,
    "refundAmount": 269.00,
    "refundStatus": 2,
    "thirdRefundNo": "ALI_REF_20260403100001",
    "refundTime": "2026-04-03T10:14:59.500+08:00"
  }
}
```

## 5. inventory-service 事件

## 5.1 `inventory.reserved`

### 5.1.1 触发时机

- 订单提交时库存预占成功

### 5.1.2 主要消费者

- `report-service`
- `order-service` 可选

### 5.1.3 JSON 示例

```json
{
  "eventId": "evt_202604021300500001",
  "eventType": "inventory.reserved",
  "topic": "inventory-event",
  "tag": "RESERVED",
  "producer": "inventory-service",
  "bizNo": "RSV202604020001",
  "bizType": "RESERVATION",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:00:50.123+08:00",
  "version": 1,
  "payload": {
    "reserveNo": "RSV202604020001",
    "orderNo": "202604021234567890",
    "status": 1,
    "expireTime": "2026-04-02T13:30:58.100+08:00",
    "items": [
      {
        "skuId": 20001,
        "warehouseId": 1,
        "reserveQty": 1
      }
    ]
  }
}
```

## 5.2 `inventory.released`

### 5.2.1 触发时机

- 订单取消
- 超时关单
- 订单落库失败补偿

### 5.2.2 JSON 示例

```json
{
  "eventId": "evt_202604021331100001",
  "eventType": "inventory.released",
  "topic": "inventory-event",
  "tag": "RELEASED",
  "producer": "inventory-service",
  "bizNo": "RSV202604020001",
  "bizType": "RESERVATION",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:31:10.123+08:00",
  "version": 1,
  "payload": {
    "reserveNo": "RSV202604020001",
    "orderNo": "202604021234567890",
    "status": 2,
    "releaseReason": "ORDER_TIMEOUT_CANCELLED",
    "items": [
      {
        "skuId": 20001,
        "warehouseId": 1,
        "releaseQty": 1
      }
    ]
  }
}
```

## 5.3 `inventory.deducted`

### 5.3.1 触发时机

- 支付成功后确认扣减库存成功

### 5.3.2 主要消费者

- `report-service`
- `search-service` 可选

### 5.3.3 JSON 示例

```json
{
  "eventId": "evt_202604021305050001",
  "eventType": "inventory.deducted",
  "topic": "inventory-event",
  "tag": "DEDUCTED",
  "producer": "inventory-service",
  "bizNo": "RSV202604020001",
  "bizType": "RESERVATION",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:05:05.123+08:00",
  "version": 1,
  "payload": {
    "reserveNo": "RSV202604020001",
    "orderNo": "202604021234567890",
    "status": 3,
    "deductTime": "2026-04-02T13:05:05.100+08:00",
    "items": [
      {
        "skuId": 20001,
        "warehouseId": 1,
        "deductQty": 1,
        "availableQtyAfter": 98,
        "lockedQtyAfter": 0,
        "saleableQtyAfter": 98
      }
    ]
  }
}
```

## 5.4 `inventory.low.warning`

### 5.4.1 触发时机

- 扣减后低于预警阈值

### 5.4.2 JSON 示例

```json
{
  "eventId": "evt_202604021305050099",
  "eventType": "inventory.low.warning",
  "topic": "inventory-event",
  "tag": "LOW_WARNING",
  "producer": "inventory-service",
  "bizNo": "SKU_20001",
  "bizType": "INVENTORY",
  "traceId": "trace_3f9a6b21d001",
  "occurTime": "2026-04-02T13:05:05.999+08:00",
  "version": 1,
  "payload": {
    "skuId": 20001,
    "warehouseId": 1,
    "warningQty": 10,
    "saleableQty": 8,
    "availableQty": 8,
    "triggerReason": "AFTER_DEDUCT"
  }
}
```

## 6. 事件生产建议

## 6.1 生产时机

- 业务主表事务成功后
- 通过 outbox 或事务消息发送

## 6.2 不建议的做法

- 先发 MQ 再写数据库
- 在 Controller 里直接发事件
- 多个地方拼装不同格式的同类事件

## 6.3 生产者建议类

- `OrderEventPublisher`
- `PaymentEventPublisher`
- `InventoryEventPublisher`

## 7. 事件消费建议

## 7.1 消费者命名建议

- `OrderPaidEventConsumer`
- `PaymentSucceededEventConsumer`
- `InventoryReleasedEventConsumer`

## 7.2 消费者实现建议

统一步骤：

1. 解析消息
2. 校验版本
3. 做幂等检查
4. 执行业务逻辑
5. 记录消费成功

## 7.3 消费失败处理建议

- 可重试异常：抛出重试
- 不可重试异常：记录异常并进入死信
- 金额不一致、状态冲突类问题：进入人工排查

## 8. 版本演进建议

### 8.1 字段新增规则

- 新增字段只追加，不删除旧字段
- 消费者对未知字段保持兼容

### 8.2 版本升级规则

- 小改动保持 `version = 1`
- 结构性变化再升 `version = 2`
- 不建议频繁变更事件名

## 9. 最关键的消费关系

### 9.1 必须实现

- `payment.succeeded -> order-service`
- `order.cancelled -> inventory-service`
- `order.cancelled -> payment-service`
- `order.paid -> inventory-service`
- `refund.succeeded -> order-service`

### 9.2 可后置实现

- `inventory.deducted -> search-service`
- `order.finished -> report-service`
- `inventory.low.warning -> notification-service`

## 10. 下一步建议

这份事件文档已经够支持 MQ 事件定义和联调。继续往下最适合的是：

1. 把这些事件补成 Java `EventDTO` 类定义
2. 为每个事件补 RocketMQ 生产者/消费者代码模板
3. 继续输出“三个服务的可执行开发任务拆解清单”
