package com.mall.api.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryItemRequest(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}
