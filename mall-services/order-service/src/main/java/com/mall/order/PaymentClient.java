package com.mall.order;

import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "payment-service", url = "${services.payment.url}")
public interface PaymentClient {

    @PostMapping("/internal/v1/payments/orders/{orderNo}/close")
    CommonResponse<Boolean> closeByOrder(
        @PathVariable("orderNo") String orderNo,
        @RequestParam("reason") String reason
    );
}
