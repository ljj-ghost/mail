package com.mall.api.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 当前用户更新基础资料时使用的请求参数。
 */
public record UserProfileUpdateRequest(
    @NotBlank @Size(max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email
) {
}

