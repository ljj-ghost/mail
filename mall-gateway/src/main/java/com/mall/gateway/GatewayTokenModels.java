package com.mall.gateway;

/**
 * 网关发给认证服务的内部令牌解析请求。
 */
record TokenParseRequest(String token) {
}

/**
 * 认证服务返回给网关的令牌解析结果。
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

