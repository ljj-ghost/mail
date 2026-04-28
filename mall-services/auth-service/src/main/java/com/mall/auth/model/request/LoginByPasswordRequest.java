package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 密码登录请求参数。
 */
public record LoginByPasswordRequest (
    @NotBlank String loginName,
    @NotBlank String password,
    String deviceId,
    Integer deviceType
) {
}
