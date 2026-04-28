package com.mall.api.inventory.response;

/**
 * 返回库存服务产生的预占结果。
 */
public record InventoryReserveResponse(String reserveNo, String orderNo, boolean success, String message) {
}

