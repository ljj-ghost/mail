package com.mall.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

/**
 * 密码登录请求参数。
 */
record LoginByPasswordRequest(
    @NotBlank String loginName,
    @NotBlank String password,
    String deviceId,
    Integer deviceType
) {
}

/**
 * 用于创建密码登录会员账号的注册请求参数。
 */
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

/**
 * 通过有效的刷新令牌换取新的访问令牌。
 */
record TokenRefreshRequest(@NotBlank String refreshToken) {
}

/**
 * 当前用户修改登录密码时使用的请求参数。
 */
record CurrentUserPasswordResetRequest(
    @NotBlank @Size(min = 6, max = 32) String currentPassword,
    @NotBlank @Size(min = 6, max = 32) String newPassword
) {
}

/**
 * 返回签发后的访问令牌、刷新令牌以及会话基础信息。
 */
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

/**
 * 描述一个活动中或历史登录会话。
 */
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

/**
 * 供网关和下游服务使用的内部令牌解析请求。
 */
record TokenParseRequest(@NotBlank String token) {
}

/**
 * 认证服务返回的令牌身份解析结果。
 */
record TokenParseResponse(
    Long userId,
    String sessionNo,
    String loginName,
    String nickname,
    String userRole,
    String tokenType
) {
}

/**
 * 返回指定用户账号是否允许认证登录。
 */
record UserAuthStatusDTO(@NotNull Long userId, Boolean enabled) {
}

/**
 * 管理员用户看板使用的汇总统计信息。
 */
record AdminUserSummaryDTO(
    Integer totalUsers,
    Integer adminUsers,
    Integer memberUsers,
    Integer activeUsers,
    Integer totalAddresses
) {
}

/**
 * 管理员用户管理列表中的单行数据。
 */
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

/**
 * 管理员视角下的完整用户详情。
 */
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

/**
 * 管理员创建托管用户账号时使用的请求参数。
 */
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

/**
 * 管理员更新用户基础信息和状态时使用的请求参数。
 */
record AdminUserUpdateRequest(
    @NotBlank @Size(min = 3, max = 64) String loginName,
    @NotBlank @Size(min = 2, max = 32) String nickname,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String mobile,
    @NotBlank @Email @Size(max = 64) String email,
    @NotBlank @Size(max = 32) String userRole,
    Integer status
) {
}

/**
 * 管理员重置用户密码时使用的请求参数。
 */
record AdminUserPasswordResetRequest(@NotBlank @Size(min = 6, max = 32) String password) {
}

