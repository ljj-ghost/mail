package com.mall.gateway.model;

/**
 * 认证服务返回给网关的令牌解析结果。
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
