package com.mall.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

record LoginByPasswordRequest(
    @NotBlank String loginName,
    @NotBlank String password,
    String deviceId,
    Integer deviceType
) {
}

record RegisterByPasswordRequest(
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(min = 6, max = 32) String password,
    String deviceId,
    Integer deviceType
) {
}

record TokenRefreshRequest(@NotBlank String refreshToken) {
}

record CurrentUserPasswordResetRequest(
    @NotBlank @Size(min = 6, max = 32) String currentPassword,
    @NotBlank @Size(min = 6, max = 32) String newPassword
) {
}

record TokenInfoDTO(
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

record UserSessionDTO(
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

record TokenParseRequest(@NotBlank String token) {
}

record TokenParseResponse(
    Long userId,
    String sessionNo,
    String loginName,
    String nickname,
    String userRole,
    String tokenType
) {
}

record UserAuthStatusDTO(@NotNull Long userId, Boolean enabled) {
}

record AdminUserSummaryDTO(
    Integer totalUsers,
    Integer adminUsers,
    Integer memberUsers,
    Integer activeUsers,
    Integer totalAddresses
) {
}

record AdminUserListItemDTO(
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

record AdminUserDetailDTO(
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

record AdminUserCreateRequest(
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(min = 6, max = 32) String password,
    @NotBlank @Size(max = 32) String userRole,
    Integer status
) {
}

record AdminUserUpdateRequest(
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(max = 32) String userRole,
    Integer status
) {
}

record AdminUserPasswordResetRequest(@NotBlank @Size(min = 6, max = 32) String password) {
}
