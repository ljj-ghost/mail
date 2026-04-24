package com.mall.cart;

import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/items")
    public CommonResponse<List<CartItemDTO>> items() {
        return CommonResponse.success(cartService.items());
    }

    @PostMapping("/items")
    public CommonResponse<Boolean> addItem(@Valid @RequestBody AddCartItemRequest request) {
        return CommonResponse.success(cartService.addItem(request));
    }

    @DeleteMapping("/items/{skuId}")
    public CommonResponse<Boolean> deleteItem(@PathVariable("skuId") Long skuId) {
        return CommonResponse.success(cartService.deleteItem(skuId));
    }
}
