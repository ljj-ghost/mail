package com.mall.product.model.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 管理员创建或更新商品 SKU 时使用的请求参数。
 */
public record AdminProductSaveRequest (
    @NotNull Long categoryId,
    @NotBlank @Size(max = 128) String spuName,
    @NotBlank @Size(max = 128) String skuName,
    @NotBlank @Size(max = 64) String brandName,
    @NotNull @DecimalMin("0") BigDecimal marketPrice,
    @NotNull @DecimalMin("0") BigDecimal salePrice,
    Integer status,
    String mainImageUrl,
    @Size(max = 255) String sellingPoint,
    String description,
    @Min(0) Integer recommendSort
) {
}
