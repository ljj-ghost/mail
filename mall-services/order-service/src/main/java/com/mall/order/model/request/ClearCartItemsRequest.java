package com.mall.order.model.request;

import java.util.List;

/**
 * 用于从购物车服务移除已购买商品的内部请求参数。
 */
public record ClearCartItemsRequest (Long userId, List<Long> skuIds) {
}
