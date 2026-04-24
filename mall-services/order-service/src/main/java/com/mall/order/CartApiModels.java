package com.mall.order;

import java.util.List;

record ClearCartItemsRequest(Long userId, List<Long> skuIds) {
}
