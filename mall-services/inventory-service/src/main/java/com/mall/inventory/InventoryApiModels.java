package com.mall.inventory;

import com.mall.api.inventory.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 表示一条已保存的库存预占记录。
 */
record InventoryReservationDTO(
    String reserveNo,
    String orderNo,
    Integer status,
    String statusText,
    OffsetDateTime expireTime,
    List<InventoryItemRequest> items
) {
}

/**
 * 管理员调整库存数量并附带审计备注时使用的请求参数。
 */
record InventoryStockAdjustRequest(
    @NotNull Long skuId,
    @NotNull @Min(1) Integer quantity,
    @NotBlank String reason
) {
}

/**
 * 管理员直接覆盖可售库存时使用的简化请求参数。
 */
record AdminInventoryStockUpdateRequest(@NotNull @Min(0) Integer availableQty) {
}

/**
 * 展示给管理员的低库存预警项。
 */
record InventoryLowStockDTO(Long skuId, Integer availableQty, Integer lockedQty, Integer saleableQty) {
}

/**
 * 批量释放过期库存预占后的结果。
 */
record InventoryExpiredReleaseResponse(int releasedCount, List<String> releasedOrderNos) {
}

