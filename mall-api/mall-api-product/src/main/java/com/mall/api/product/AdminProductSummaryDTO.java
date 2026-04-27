package com.mall.api.product;

import java.math.BigDecimal;

/**
 * 管理员商品看板使用的商品汇总统计。
 */
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

