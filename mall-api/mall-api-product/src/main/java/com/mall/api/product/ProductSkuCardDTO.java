package com.mall.api.product;

import java.math.BigDecimal;

/**
 * 商品列表页使用的卡片式 SKU 投影。
 */
public record ProductSkuCardDTO(
    Long skuId,
    Long spuId,
    Long categoryId,
    String categoryName,
    String spuName,
    String skuName,
    BigDecimal salePrice,
    BigDecimal marketPrice,
    Integer status,
    String mainImageUrl,
    String sellingPoint
) {
}

