package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 通过有效的刷新令牌换取新的访问令牌。
 */
public record TokenRefreshRequest (@NotBlank String refreshToken) {
}
