package com.mall.api.promotion;

import java.math.BigDecimal;

public record PromotionAmountDTO(BigDecimal couponAmount, BigDecimal promotionAmount) {
}
