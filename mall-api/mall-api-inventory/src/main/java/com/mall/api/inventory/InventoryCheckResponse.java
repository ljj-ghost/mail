package com.mall.api.inventory;

import java.util.List;

/**
 * 返回所有请求库存项是否都能被满足。
 */
public record InventoryCheckResponse(boolean passed, List<InventoryCheckItemResult> items) {
}

