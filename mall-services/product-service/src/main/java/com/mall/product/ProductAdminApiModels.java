package com.mall.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * 管理员侧商品完整详情数据。
 */
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

/**
 * 管理员创建或更新商品 SKU 时使用的请求参数。
 */
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

/**
 * 返回上传商品图片后的存储文件名和公开访问地址。
 */
record ProductImageUploadResponse(
    String fileName,
    String url
) {
}

