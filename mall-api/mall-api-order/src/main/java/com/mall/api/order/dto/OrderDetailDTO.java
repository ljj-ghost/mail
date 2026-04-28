package com.mall.api.order.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 返回给前台和管理员调用方的完整订单详情。
 */
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

