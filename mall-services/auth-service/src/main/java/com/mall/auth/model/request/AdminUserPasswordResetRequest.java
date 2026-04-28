package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 管理员重置用户密码时使用的请求参数。
 */
public record AdminUserPasswordResetRequest (@NotBlank @Size(min = 6, max = 32) String password) {
}
