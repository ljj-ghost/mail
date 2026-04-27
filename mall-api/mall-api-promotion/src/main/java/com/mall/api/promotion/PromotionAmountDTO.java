package com.mall.api.promotion;

import java.math.BigDecimal;

/**
 * 应用到订单上的促销优惠拆分结果。
 */
public record PromotionAmountDTO(BigDecimal couponAmount, BigDecimal promotionAmount) {
}

