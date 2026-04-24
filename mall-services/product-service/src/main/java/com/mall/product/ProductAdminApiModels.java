package com.mall.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

record AdminProductDetailDTO(
    Long skuId,
    Long spuId,
    Long categoryId,
    String categoryName,
    String spuName,
    String skuName,
    String brandName,
    BigDecimal salePrice,
    BigDecimal marketPrice,
    Integer status,
    String mainImageUrl,
    String sellingPoint,
    String description,
    Integer recommendSort
) {
}

record AdminProductSaveRequest(
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

record ProductImageUploadResponse(
    String fileName,
    String url
) {
}
