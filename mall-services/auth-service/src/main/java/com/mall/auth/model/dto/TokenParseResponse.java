package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 认证服务返回的令牌身份解析结果。
 */
public record TokenParseResponse (
    Long userId,
    String sessionNo,
    String loginName,
    String nickname,
    String userRole,
    String tokenType
) {
}
