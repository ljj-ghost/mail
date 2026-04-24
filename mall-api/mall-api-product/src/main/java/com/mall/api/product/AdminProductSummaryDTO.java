package com.mall.api.product;

import java.math.BigDecimal;

public record AdminProductSummaryDTO(
    Long totalCategories,
    Long totalSpus,
    Long totalSkus,
    Long activeSkus,
    Long featuredSkus,
    BigDecimal priceFloor,
    BigDecimal priceCeiling
) {
}
