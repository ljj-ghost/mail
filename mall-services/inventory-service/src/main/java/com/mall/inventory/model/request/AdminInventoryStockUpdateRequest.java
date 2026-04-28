package com.mall.inventory.model.request;

import com.mall.api.inventory.request.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 管理员直接覆盖可售库存时使用的简化请求参数。
 */
public record AdminInventoryStockUpdateRequest (@NotNull @Min(0) Integer availableQty) {
}
