package com.mall.api.inventory;

import jakarta.validation.constraints.NotBlank;

public record InventoryReleaseRequest(@NotBlank String orderNo, String reason) {
}
