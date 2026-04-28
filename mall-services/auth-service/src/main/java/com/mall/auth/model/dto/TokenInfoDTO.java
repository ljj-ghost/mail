package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 返回签发后的访问令牌、刷新令牌以及会话基础信息。
 */
public record TokenInfoDTO (
    String accessToken,
    String refreshToken,
    Long userId,
    String nickname,
    String userRole,
    String sessionNo,
    OffsetDateTime accessTokenExpireTime,
    OffsetDateTime refreshTokenExpireTime
) {
}
