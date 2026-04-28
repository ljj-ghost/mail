package com.mall.cart.model.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 下单后批量清理购物车商品时使用的内部请求参数。
 */
public record ClearCartItemsRequest (@NotNull Long userId, @NotEmpty List<@NotNull Long> skuIds) {
}
