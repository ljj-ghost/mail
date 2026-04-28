package com.mall.api.product.dto;

import java.math.BigDecimal;

/**
 * 服务间共享的最小 SKU 快照。
 */
public record SkuBaseDTO(Long skuId, Long spuId, String skuName, BigDecimal salePrice, Integer status) {
}

