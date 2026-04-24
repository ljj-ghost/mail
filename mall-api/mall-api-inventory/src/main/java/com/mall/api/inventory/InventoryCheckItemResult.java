package com.mall.api.inventory;

public record InventoryCheckItemResult(Long skuId, Integer quantity, Integer saleableQty, boolean enough, String reason) {
}
