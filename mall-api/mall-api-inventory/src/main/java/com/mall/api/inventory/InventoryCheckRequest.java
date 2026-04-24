package com.mall.api.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record InventoryCheckRequest(@NotEmpty List<@Valid InventoryItemRequest> items) {
}
