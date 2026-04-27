package com.mall.api.inventory;

/**
 * 描述单个 SKU 的库存校验结果。
 */
public record InventoryCheckItemResult(Long skuId, Integer quantity, Integer saleableQty, boolean enough, String reason) {
}

