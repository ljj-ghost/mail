package com.mall.api.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * 请求对一批订单商品执行可售性校验。
 */
public record InventoryCheckRequest(@NotEmpty List<@Valid InventoryItemRequest> items) {
}

