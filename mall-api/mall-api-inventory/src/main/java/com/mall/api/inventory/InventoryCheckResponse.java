package com.mall.api.inventory;

import java.util.List;

public record InventoryCheckResponse(boolean passed, List<InventoryCheckItemResult> items) {
}
