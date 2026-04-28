package com.mall.inventory.model.request;

import com.mall.api.inventory.request.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 管理员调整库存数量并附带审计备注时使用的请求参数。
 */
public record InventoryStockAdjustRequest (
    @NotNull Long skuId,
    @NotNull @Min(1) Integer quantity,
    @NotBlank String reason
) {
}
