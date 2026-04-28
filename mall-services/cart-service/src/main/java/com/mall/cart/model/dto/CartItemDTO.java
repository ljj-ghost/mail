package com.mall.cart.model.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 返回给前台的购物车行项目。
 */
public record CartItemDTO (Long skuId, String skuName, Integer quantity, BigDecimal salePrice) {
}
