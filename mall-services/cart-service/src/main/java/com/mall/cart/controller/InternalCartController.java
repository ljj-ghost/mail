package com.mall.cart.controller;

import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.mall.cart.model.request.ClearCartItemsRequest;
import com.mall.cart.service.CartService;


@Validated
@RestController
/**
 * 暴露供其他服务调用的内部购物车接口。
 */
public class InternalCartController {

    private final CartService cartService;

    public InternalCartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/internal/v1/cart/items/clear")
    public CommonResponse<Boolean> clearItems(@Valid @RequestBody ClearCartItemsRequest request) {
        return CommonResponse.success(cartService.clearItems(request));
    }
}

