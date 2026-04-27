package com.mall.order;

import com.mall.api.order.OrderSubmitSkuItem;
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
record AdminOrderSummaryDTO(
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

/**
 * 管理员代用户创建订单时使用的请求参数。
 */
record AdminOrderCreateRequest(
    @NotNull Long userId,
    String buyerRemark,
    @NotEmpty List<@Valid OrderSubmitSkuItem> items
) {
}

/**
 * 管理员调整可变订单字段时使用的请求参数。
 */
record AdminOrderUpdateRequest(
    String buyerRemark,
    Integer orderStatus,
    Integer payStatus,
    @Min(1) Integer payChannel,
    String deliveryCompany,
    String deliveryNo
) {
}

