package com.mall.api.inventory;

import jakarta.validation.constraints.NotBlank;

public record InventoryDeductRequest(@NotBlank String orderNo) {
}
