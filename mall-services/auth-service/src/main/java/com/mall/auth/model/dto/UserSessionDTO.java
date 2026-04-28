package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 描述一个活动中或历史登录会话。
 */
public record UserSessionDTO (
    String sessionNo,
    Integer deviceType,
    String deviceId,
    String clientIp,
    String userAgent,
    OffsetDateTime lastActiveTime,
    OffsetDateTime expireTime,
    Integer status,
    Boolean current
) {
}
