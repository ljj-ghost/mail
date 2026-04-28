package com.mall.api.inventory.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 请求对已支付订单执行最终库存扣减。
 */
public record InventoryDeductRequest(@NotBlank String orderNo) {
}

