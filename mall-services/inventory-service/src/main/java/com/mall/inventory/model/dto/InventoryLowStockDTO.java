package com.mall.inventory.model.dto;

import com.mall.api.inventory.request.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 展示给管理员的低库存预警项。
 */
public record InventoryLowStockDTO (Long skuId, Integer availableQty, Integer lockedQty, Integer saleableQty) {
}
