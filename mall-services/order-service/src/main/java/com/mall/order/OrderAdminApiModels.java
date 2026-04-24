package com.mall.order;

import com.mall.api.order.OrderSubmitSkuItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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

record AdminOrderCreateRequest(
    @NotNull Long userId,
    String buyerRemark,
    @NotEmpty List<@Valid OrderSubmitSkuItem> items
) {
}

record AdminOrderUpdateRequest(
    String buyerRemark,
    Integer orderStatus,
    Integer payStatus,
    @Min(1) Integer payChannel,
    String deliveryCompany,
    String deliveryNo
) {
}
