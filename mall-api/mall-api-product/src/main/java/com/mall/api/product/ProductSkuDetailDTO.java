package com.mall.api.product;

import java.math.BigDecimal;

public record ProductSkuDetailDTO(
    Long skuId,
    Long spuId,
    Long categoryId,
    String categoryName,
    String spuName,
    String skuName,
    String brandName,
    BigDecimal salePrice,
    BigDecimal marketPrice,
    Integer status,
    String mainImageUrl,
    String sellingPoint,
    String description
) {
}
