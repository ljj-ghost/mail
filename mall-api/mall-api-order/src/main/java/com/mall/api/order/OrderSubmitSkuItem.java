package com.mall.api.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * 下单请求中的单个 SKU 项。
 */
public record OrderSubmitSkuItem(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}

