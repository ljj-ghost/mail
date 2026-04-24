package com.mall.api.inventory;

public record InventoryReserveResponse(String reserveNo, String orderNo, boolean success, String message) {
}
