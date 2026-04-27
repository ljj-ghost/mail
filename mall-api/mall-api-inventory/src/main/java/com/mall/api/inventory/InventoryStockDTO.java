package com.mall.api.inventory;

/**
 * 指定 SKU 的库存数量快照。
 */
public record InventoryStockDTO(Long skuId, Integer availableQty, Integer lockedQty, Integer saleableQty) {
}

