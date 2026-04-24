package com.mall.order;

import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "cart-service", url = "${services.cart.url}")
public interface CartClient {

    @PostMapping("/internal/v1/cart/items/clear")
    CommonResponse<Boolean> clearItems(@RequestBody ClearCartItemsRequest request);
}
