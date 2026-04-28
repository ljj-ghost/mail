package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 当前用户修改登录密码时使用的请求参数。
 */
public record CurrentUserPasswordResetRequest (
    @NotBlank @Size(min = 6, max = 32) String currentPassword,
    @NotBlank @Size(min = 6, max = 32) String newPassword
) {
}
