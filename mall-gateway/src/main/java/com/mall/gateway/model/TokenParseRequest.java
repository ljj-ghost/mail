package com.mall.gateway.model;

/**
 * 网关发给认证服务的内部令牌解析请求。
 */
public record TokenParseRequest (String token) {
}
