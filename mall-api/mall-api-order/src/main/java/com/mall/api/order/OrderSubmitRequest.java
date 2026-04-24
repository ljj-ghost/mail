package com.mall.api.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record OrderSubmitRequest(
    @NotBlank String idempotencyKey,
    @NotBlank String submitToken,
    Long addressId,
    String buyerRemark,
    @Valid @NotEmpty List<OrderSubmitSkuItem> items
) {
}
