package com.mall.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 管理员更新用户基础信息和状态时使用的请求参数。
 */
public record AdminUserUpdateRequest (
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(max = 32) String userRole,
    Integer status
) {
}
