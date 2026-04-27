package com.mall.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 订单服务返回的轻量级订单列表项。
 */
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

