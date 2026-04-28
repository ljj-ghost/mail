package com.mall.inventory.model.dto;

import com.mall.api.inventory.request.InventoryItemRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 表示一条已保存的库存预占记录。
 */
public record InventoryReservationDTO (
    String reserveNo,
    String orderNo,
    Integer status,
    String statusText,
    OffsetDateTime expireTime,
    List<InventoryItemRequest> items
) {
}
