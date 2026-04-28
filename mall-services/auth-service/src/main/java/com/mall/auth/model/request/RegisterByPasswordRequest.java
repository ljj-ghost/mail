package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 用于创建密码登录会员账号的注册请求参数。
 */
public record RegisterByPasswordRequest (
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(min = 6, max = 32) String password,
    String deviceId,
    Integer deviceType
) {
}
