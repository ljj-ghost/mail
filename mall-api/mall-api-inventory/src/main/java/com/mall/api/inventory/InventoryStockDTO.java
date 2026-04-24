package com.mall.api.inventory;

public record InventoryStockDTO(Long skuId, Integer availableQty, Integer lockedQty, Integer saleableQty) {
}
