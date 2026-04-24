package com.mall.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderDetailDTO(
    String orderNo,
    Long userId,
    Integer orderStatus,
    Integer payStatus,
    BigDecimal payAmount,
    String buyerRemark,
    OffsetDateTime createTime,
    String deliveryCompany,
    String deliveryNo,
    OffsetDateTime deliveryTime,
    OffsetDateTime finishTime,
    List<OrderItemDTO> items
) {
}
