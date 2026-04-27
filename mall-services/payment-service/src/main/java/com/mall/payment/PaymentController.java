package com.mall.payment;

import com.mall.api.payment.PaymentCreateRequest;
import com.mall.api.payment.PaymentCreateResponse;
import com.mall.api.payment.PaymentDetailDTO;
import com.mall.api.payment.PaymentMockSuccessRequest;
import com.mall.api.payment.PaymentSummaryDTO;
import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
/**
 * 暴露支付创建、查询以及模拟回调接口。
 */
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/api/v1/payments/create")
    public CommonResponse<PaymentCreateResponse> create(@Valid @RequestBody PaymentCreateRequest request) {
        return CommonResponse.success(paymentService.create(request));
    }

    @GetMapping("/api/v1/payments")
    public CommonResponse<List<PaymentSummaryDTO>> list(
        @RequestParam(name = "status", required = false) Integer status,
        @RequestParam(name = "limit", defaultValue = "10") Integer limit
    ) {
        return CommonResponse.success(paymentService.list(status, limit));
    }

    @GetMapping("/api/v1/payments/{paymentNo}")
    public CommonResponse<PaymentDetailDTO> detail(@PathVariable("paymentNo") String paymentNo) {
        return CommonResponse.success(paymentService.detail(paymentNo));
    }

    @PostMapping("/api/v1/payments/mock/success/{paymentNo}")
    public CommonResponse<PaymentDetailDTO> mockSuccess(
        @PathVariable("paymentNo") String paymentNo,
        @RequestBody(required = false) PaymentMockSuccessRequest request
    ) {
        PaymentMockSuccessRequest mockRequest = request == null ? new PaymentMockSuccessRequest("") : request;
        return CommonResponse.success(paymentService.mockSuccess(paymentNo, mockRequest));
    }

    @PostMapping("/internal/v1/payments/orders/{orderNo}/close")
    public CommonResponse<Boolean> closeByOrder(
        @PathVariable("orderNo") String orderNo,
        @RequestParam(name = "reason", defaultValue = "ORDER_CANCELLED") String reason
    ) {
        return CommonResponse.success(paymentService.closeByOrder(orderNo, reason));
    }
}

