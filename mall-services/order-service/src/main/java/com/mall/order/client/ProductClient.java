package com.mall.order.client;

import com.mall.api.product.dto.SkuBaseDTO;
import com.mall.common.core.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "product-service", url = "${services.product.url}")
/**
 * 在创建订单时从商品服务获取 SKU 快照。
 */
public interface ProductClient {

    @GetMapping("/internal/v1/products/skus/{skuId}")
    CommonResponse<SkuBaseDTO> getSku(@PathVariable("skuId") Long skuId);

    @PostMapping("/internal/v1/products/skus/batch")
    CommonResponse<List<SkuBaseDTO>> batchSku(@RequestBody List<Long> skuIds);
}

