package com.mall.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OrderSummaryDTO(
    String orderNo,
    Integer orderStatus,
    Integer payStatus,
    BigDecimal payAmount,
    String buyerRemark,
    OffsetDateTime createTime,
    Integer itemCount
) {
}
