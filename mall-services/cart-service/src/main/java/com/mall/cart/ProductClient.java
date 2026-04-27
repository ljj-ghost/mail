package com.mall.cart;

import com.mall.api.product.SkuBaseDTO;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "${services.product.url}")
/**
 * 从商品服务获取 SKU 信息以完成购物车校验。
 */
public interface ProductClient {

    @GetMapping("/internal/v1/products/skus/{skuId}")
    CommonResponse<SkuBaseDTO> getSku(@PathVariable("skuId") Long skuId);
}

