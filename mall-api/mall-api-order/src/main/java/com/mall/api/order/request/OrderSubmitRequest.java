package com.mall.api.order.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * 用户提交订单时使用的请求参数。
 */
public record OrderSubmitRequest(
    @NotBlank String idempotencyKey,
    @NotBlank String submitToken,
    Long addressId,
    String buyerRemark,
    @Valid @NotEmpty List<OrderSubmitSkuItem> items
) {
}

