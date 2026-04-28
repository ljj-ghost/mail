package com.mall.product.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 管理员侧商品完整详情数据。
 */
public record AdminProductDetailDTO (
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
