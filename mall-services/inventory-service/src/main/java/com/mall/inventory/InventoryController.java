package com.mall.inventory;

import com.mall.api.inventory.InventoryCheckRequest;
import com.mall.api.inventory.InventoryCheckResponse;
import com.mall.api.inventory.InventoryDeductRequest;
import com.mall.api.inventory.InventoryReleaseRequest;
import com.mall.api.inventory.InventoryReserveRequest;
import com.mall.api.inventory.InventoryReserveResponse;
import com.mall.api.inventory.InventoryStockDTO;
import com.mall.common.core.CommonResponse;
import com.mall.common.security.UserContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping
/**
 * 暴露库存校验、预占、释放以及管理员库存管理接口。
 */
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/api/v1/admin/inventory/stock/{skuId}")
    public CommonResponse<InventoryStockDTO> stock(@PathVariable("skuId") Long skuId) {
        UserContext.requireAdmin();
        return CommonResponse.success(inventoryService.getStock(skuId));
    }

    @GetMapping("/api/v1/admin/inventory/low-stock")
    public CommonResponse<List<InventoryLowStockDTO>> lowStock(@RequestParam(name = "threshold", defaultValue = "10") @Min(0) Integer threshold) {
        UserContext.requireAdmin();
        return CommonResponse.success(inventoryService.lowStock(threshold));
    }

    @PutMapping("/api/v1/admin/inventory/stock/{skuId}")
    public CommonResponse<InventoryStockDTO> updateStock(
        @PathVariable("skuId") Long skuId,
        @Valid @RequestBody AdminInventoryStockUpdateRequest request
    ) {
        UserContext.requireAdmin();
        return CommonResponse.success(inventoryService.updateStock(skuId, request.availableQty()));
    }

    @PostMapping("/internal/v1/inventory/check")
    public CommonResponse<InventoryCheckResponse> check(@Valid @RequestBody InventoryCheckRequest request) {
        return CommonResponse.success(inventoryService.check(request));
    }

    @PostMapping("/internal/v1/inventory/reserve")
    public CommonResponse<InventoryReserveResponse> reserve(@Valid @RequestBody InventoryReserveRequest request) {
        return CommonResponse.success(inventoryService.reserve(request));
    }

    @PostMapping("/internal/v1/inventory/release")
    public CommonResponse<Boolean> release(@Valid @RequestBody InventoryReleaseRequest request) {
        return CommonResponse.success(inventoryService.release(request));
    }

    @PostMapping("/internal/v1/inventory/confirm-deduct")
    public CommonResponse<Boolean> deduct(@Valid @RequestBody InventoryDeductRequest request) {
        return CommonResponse.success(inventoryService.deduct(request));
    }

    @GetMapping("/internal/v1/inventory/reservations/{orderNo}")
    public CommonResponse<InventoryReservationDTO> reservation(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(inventoryService.reservation(orderNo));
    }

    @PostMapping("/internal/v1/inventory/stock/replenish")
    public CommonResponse<InventoryStockDTO> replenish(@Valid @RequestBody InventoryStockAdjustRequest request) {
        return CommonResponse.success(inventoryService.replenish(request));
    }

    @PostMapping("/internal/v1/inventory/reservations/release-expired")
    public CommonResponse<InventoryExpiredReleaseResponse> releaseExpired(
        @RequestParam(name = "limit", defaultValue = "100") @Min(1) Integer limit
    ) {
        return CommonResponse.success(inventoryService.releaseExpired(limit));
    }
}

