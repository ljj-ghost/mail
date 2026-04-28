package com.mall.product.model.response;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 返回上传商品图片后的存储文件名和公开访问地址。
 */
public record ProductImageUploadResponse (
    String fileName,
    String url
) {
}
