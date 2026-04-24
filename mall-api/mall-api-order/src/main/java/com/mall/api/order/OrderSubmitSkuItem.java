package com.mall.api.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderSubmitSkuItem(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}
