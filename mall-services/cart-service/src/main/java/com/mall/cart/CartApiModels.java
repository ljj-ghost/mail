package com.mall.cart;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

record AddCartItemRequest(@NotNull Long skuId, @NotNull @Min(1) Integer quantity) {
}

record CartItemDTO(Long skuId, String skuName, Integer quantity, BigDecimal salePrice) {
}

record ClearCartItemsRequest(@NotNull Long userId, @NotEmpty List<@NotNull Long> skuIds) {
}
