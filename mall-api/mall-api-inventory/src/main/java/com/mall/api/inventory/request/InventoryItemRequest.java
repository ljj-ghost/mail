package com.mall.api.inventory.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * 承载库存接口使用的 SKU 与数量组合。
 */
public record InventoryItemRequest(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}

