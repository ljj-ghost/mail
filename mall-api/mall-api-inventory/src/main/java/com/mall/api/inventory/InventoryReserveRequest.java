package com.mall.api.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 请求在支付完成前为订单临时预占库存。
 */
public record InventoryReserveRequest(
    @NotBlank String orderNo,
    @NotNull OffsetDateTime expireTime,
    @NotEmpty List<@Valid InventoryItemRequest> items
) {
}

