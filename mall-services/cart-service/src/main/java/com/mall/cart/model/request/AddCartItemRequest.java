package com.mall.cart.model.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 向当前用户购物车新增或累加一个 SKU。
 */
public record AddCartItemRequest (@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}
