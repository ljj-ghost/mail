package com.mall.api.order.dto;

import java.math.BigDecimal;

/**
 * 订单中记录的一条 SKU 行项目快照。
 */
public record OrderItemDTO(Long skuId, String skuName, Integer quantity, BigDecimal salePrice, BigDecimal itemAmount) {
}

