package com.mall.cart;

import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
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
