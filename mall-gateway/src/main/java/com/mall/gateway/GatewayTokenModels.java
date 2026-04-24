package com.mall.gateway;

record TokenParseRequest(String token) {
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
