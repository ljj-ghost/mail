package com.mall.api.payment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 支付查询返回的完整支付详情。
 */
public record PaymentDetailDTO(
    String paymentNo,
    String orderNo,
    Long userId,
    Integer payChannel,
    Integer payStatus,
    BigDecimal payAmount,
    String thirdTradeNo,
    OffsetDateTime createTime,
    OffsetDateTime payTime,
    OffsetDateTime closeTime,
    String closeReason
) {
}

