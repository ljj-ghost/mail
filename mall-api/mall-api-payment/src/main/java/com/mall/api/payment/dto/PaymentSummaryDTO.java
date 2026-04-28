package com.mall.api.payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 用于支付列表或摘要展示的轻量级支付投影。
 */
public record PaymentSummaryDTO(
    String paymentNo,
    String orderNo,
    Integer payChannel,
    Integer payStatus,
    BigDecimal payAmount,
    OffsetDateTime createTime,
    OffsetDateTime payTime,
    OffsetDateTime closeTime
) {
}

