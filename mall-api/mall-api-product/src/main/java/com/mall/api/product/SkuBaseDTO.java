package com.mall.api.product;

import java.math.BigDecimal;

public record SkuBaseDTO(Long skuId, Long spuId, String skuName, BigDecimal salePrice, Integer status) {
}
