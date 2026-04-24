package com.mall.api.order;

import java.math.BigDecimal;

public record OrderItemDTO(Long skuId, String skuName, Integer quantity, BigDecimal salePrice, BigDecimal itemAmount) {
}
