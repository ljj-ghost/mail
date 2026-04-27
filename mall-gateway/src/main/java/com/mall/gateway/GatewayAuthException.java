package com.mall.gateway;

/**
 * 封装认证校验异常，便于网关统一转换为面向客户端的响应。
 */
class GatewayAuthException extends RuntimeException {

    private final boolean unauthorized;

    GatewayAuthException(String message, boolean unauthorized) {
        super(message);
        this.unauthorized = unauthorized;
    }

    boolean unauthorized() {
        return unauthorized;
    }
}

