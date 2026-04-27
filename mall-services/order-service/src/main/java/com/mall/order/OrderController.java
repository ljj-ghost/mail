package com.mall.order;

import com.mall.api.order.OrderBaseDTO;
import com.mall.api.order.OrderDetailDTO;
import com.mall.api.order.OrderPaidRequest;
import com.mall.api.order.OrderSubmitRequest;
import com.mall.api.order.OrderSubmitResponse;
import com.mall.api.order.OrderSummaryDTO;
import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
 * 暴露面向用户和管理员的订单接口。
 */
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/api/v1/orders/submit")
    public CommonResponse<OrderSubmitResponse> submit(@Valid @RequestBody OrderSubmitRequest request) {
        return CommonResponse.success(orderService.submit(request));
    }

    @GetMapping("/api/v1/orders")
    public CommonResponse<List<OrderSummaryDTO>> list(
        @RequestParam(name = "status", required = false) Integer status,
        @RequestParam(name = "limit", defaultValue = "10") Integer limit
    ) {
        return CommonResponse.success(orderService.list(status, limit));
    }

    @GetMapping("/api/v1/orders/{orderNo}")
    public CommonResponse<OrderDetailDTO> detail(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.detail(orderNo));
    }

    @GetMapping("/api/v1/admin/orders")
    public CommonResponse<List<AdminOrderSummaryDTO>> adminList(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "orderStatus", required = false) Integer orderStatus,
        @RequestParam(name = "payStatus", required = false) Integer payStatus,
        @RequestParam(name = "userId", required = false) Long userId,
        @RequestParam(name = "limit", defaultValue = "20") Integer limit
    ) {
        return CommonResponse.success(orderService.adminList(keyword, orderStatus, payStatus, userId, limit));
    }

    @GetMapping("/api/v1/admin/orders/{orderNo}")
    public CommonResponse<OrderDetailDTO> adminDetail(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.adminDetail(orderNo));
    }

    @PostMapping("/api/v1/admin/orders")
    public CommonResponse<OrderDetailDTO> adminCreate(@Valid @RequestBody AdminOrderCreateRequest request) {
        return CommonResponse.success(orderService.adminCreate(request));
    }

    @PutMapping("/api/v1/admin/orders/{orderNo}")
    public CommonResponse<OrderDetailDTO> adminUpdate(
        @PathVariable("orderNo") String orderNo,
        @Valid @RequestBody AdminOrderUpdateRequest request
    ) {
        return CommonResponse.success(orderService.adminUpdate(orderNo, request));
    }

    @DeleteMapping("/api/v1/admin/orders/{orderNo}")
    public CommonResponse<Boolean> adminDelete(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.adminDelete(orderNo));
    }

    @PostMapping("/api/v1/orders/{orderNo}/cancel")
    public CommonResponse<Boolean> cancel(
        @PathVariable("orderNo") String orderNo,
        @RequestParam(name = "reason", defaultValue = "USER_CANCEL") String reason
    ) {
        return CommonResponse.success(orderService.cancel(orderNo, reason));
    }

    @DeleteMapping("/api/v1/orders/{orderNo}")
    public CommonResponse<Boolean> delete(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.delete(orderNo));
    }

    @PostMapping("/api/v1/orders/{orderNo}/confirm-receipt")
    public CommonResponse<Boolean> confirmReceipt(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.confirmReceipt(orderNo));
    }

    @GetMapping("/internal/v1/orders/{orderNo}")
    public CommonResponse<OrderBaseDTO> base(@PathVariable("orderNo") String orderNo) {
        return CommonResponse.success(orderService.base(orderNo));
    }

    @PostMapping("/internal/v1/orders/{orderNo}/paid")
    public CommonResponse<Boolean> markPaid(@PathVariable("orderNo") String orderNo, @RequestBody OrderPaidRequest request) {
        return CommonResponse.success(orderService.markPaid(orderNo, request));
    }

    @PostMapping("/internal/v1/orders/close-expired")
    public CommonResponse<OrderExpiredCloseResponse> closeExpired(
        @RequestParam(name = "minutes", defaultValue = "30") Integer minutes,
        @RequestParam(name = "limit", defaultValue = "100") Integer limit
    ) {
        return CommonResponse.success(orderService.closeExpired(minutes, limit));
    }
}

