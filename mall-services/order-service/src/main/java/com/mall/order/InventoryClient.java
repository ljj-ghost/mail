package com.mall.order;

import com.mall.api.inventory.InventoryCheckRequest;
import com.mall.api.inventory.InventoryCheckResponse;
import com.mall.api.inventory.InventoryDeductRequest;
import com.mall.api.inventory.InventoryReleaseRequest;
import com.mall.api.inventory.InventoryReserveRequest;
import com.mall.api.inventory.InventoryReserveResponse;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "${services.inventory.url}")
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
