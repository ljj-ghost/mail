package com.mall.cart;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * 向当前用户购物车新增或累加一个 SKU。
 */
record AddCartItemRequest(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}

/**
 * 返回给前台的购物车行项目。
 */
record CartItemDTO(Long skuId, String skuName, Integer quantity, BigDecimal salePrice) {
}

/**
 * 下单后批量清理购物车商品时使用的内部请求参数。
 */
record ClearCartItemsRequest(@NotNull Long userId, @NotEmpty List<@NotNull Long> skuIds) {
}

