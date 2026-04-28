package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 返回指定用户账号是否允许认证登录。
 */
public record UserAuthStatusDTO (@NotNull Long userId, Boolean enabled) {
}
