package com.mall.order.model.dto;

import com.mall.api.order.request.OrderSubmitSkuItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 订单管理页面中面向管理员的汇总行数据。
 */
public record AdminOrderSummaryDTO (
    String orderNo,
    Long userId,
    Integer orderStatus,
    Integer payStatus,
    BigDecimal payAmount,
    String buyerRemark,
    OffsetDateTime createTime,
    Integer itemCount
) {
}
