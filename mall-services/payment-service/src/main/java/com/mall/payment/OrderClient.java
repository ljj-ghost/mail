package com.mall.payment;

import com.mall.api.order.OrderBaseDTO;
import com.mall.api.order.OrderPaidRequest;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service", url = "${services.order.url}")
/**
 * 调用订单服务同步支付结果。
 */
public interface OrderClient {

    @GetMapping("/internal/v1/orders/{orderNo}")
    CommonResponse<OrderBaseDTO> getOrder(@PathVariable("orderNo") String orderNo);

    @PostMapping("/internal/v1/orders/{orderNo}/paid")
    CommonResponse<Boolean> markPaid(@PathVariable("orderNo") String orderNo, @RequestBody OrderPaidRequest request);
}

