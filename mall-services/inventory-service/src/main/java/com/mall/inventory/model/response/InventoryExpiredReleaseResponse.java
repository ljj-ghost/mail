package com.mall.inventory.model.response;

import com.mall.api.inventory.request.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 批量释放过期库存预占后的结果。
 */
public record InventoryExpiredReleaseResponse (int releasedCount, List<String> releasedOrderNos) {
}
