package com.mall.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 订单已支付后由支付服务发送的回调参数。
 */
public record OrderPaidRequest(String paymentNo, Integer payChannel, BigDecimal payAmount, OffsetDateTime payTime) {
}

