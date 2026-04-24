package com.mall.api.product;

import java.math.BigDecimal;

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
