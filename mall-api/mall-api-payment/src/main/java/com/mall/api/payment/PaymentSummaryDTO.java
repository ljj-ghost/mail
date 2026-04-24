package com.mall.api.payment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
