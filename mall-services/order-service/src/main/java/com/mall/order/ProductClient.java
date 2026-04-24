package com.mall.order;

import com.mall.api.product.SkuBaseDTO;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "product-service", url = "${services.product.url}")
public interface ProductClient {

    @GetMapping("/internal/v1/products/skus/{skuId}")
    CommonResponse<SkuBaseDTO> getSku(@PathVariable("skuId") Long skuId);

    @PostMapping("/internal/v1/products/skus/batch")
    CommonResponse<List<SkuBaseDTO>> batchSku(@RequestBody List<Long> skuIds);
}
