package com.mall.api.inventory.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 请求释放订单此前预占的库存。
 */
public record InventoryReleaseRequest(@NotBlank String orderNo, String reason) {
}

