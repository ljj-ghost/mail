package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 管理员视角下的完整用户详情。
 */
public record AdminUserDetailDTO (
    Long userId,
    String loginName,
    String nickname,
    String mobile,
    String email,
    Integer status,
    String userRole,
    Integer addressCount
) {
}
