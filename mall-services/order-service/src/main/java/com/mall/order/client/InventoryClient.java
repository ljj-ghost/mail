package com.mall.order.client;

import com.mall.api.inventory.request.InventoryCheckRequest;
import com.mall.api.inventory.response.InventoryCheckResponse;
import com.mall.api.inventory.request.InventoryDeductRequest;
import com.mall.api.inventory.request.InventoryReleaseRequest;
import com.mall.api.inventory.request.InventoryReserveRequest;
import com.mall.api.inventory.response.InventoryReserveResponse;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "${services.inventory.url}")
/**
 * 在订单预占和补偿流程中调用库存服务。
 */
public interface InventoryClient {

    @PostMapping("/internal/v1/inventory/check")
    CommonResponse<InventoryCheckResponse> check(@RequestBody InventoryCheckRequest request);

    @PostMapping("/internal/v1/inventory/reserve")
    CommonResponse<InventoryReserveResponse> reserve(@RequestBody InventoryReserveRequest request);

    @PostMapping("/internal/v1/inventory/release")
    CommonResponse<Boolean> release(@RequestBody InventoryReleaseRequest request);

    @PostMapping("/internal/v1/inventory/confirm-deduct")
    CommonResponse<Boolean> deduct(@RequestBody InventoryDeductRequest request);
}

