package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 供网关和下游服务使用的内部令牌解析请求。
 */
public record TokenParseRequest (@NotBlank String token) {
}
