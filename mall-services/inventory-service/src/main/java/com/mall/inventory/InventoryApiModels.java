package com.mall.inventory;

import com.mall.api.inventory.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;

record InventoryReservationDTO(
    String reserveNo,
    String orderNo,
    Integer status,
    String statusText,
    OffsetDateTime expireTime,
    List<InventoryItemRequest> items
) {
}

record InventoryStockAdjustRequest(
    @NotNull Long skuId,
    @NotNull @Min(1) Integer quantity,
    @NotBlank String reason
) {
}

record AdminInventoryStockUpdateRequest(@NotNull @Min(0) Integer availableQty) {
}

record InventoryLowStockDTO(Long skuId, Integer availableQty, Integer lockedQty, Integer saleableQty) {
}

record InventoryExpiredReleaseResponse(int releasedCount, List<String> releasedOrderNos) {
}
