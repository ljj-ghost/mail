package com.mall.gateway.exception;

/**
 * 封装认证校验异常，便于网关统一转换为面向客户端的响应。
 */
public class GatewayAuthException extends RuntimeException {

    private final boolean unauthorized;

    public GatewayAuthException(String message, boolean unauthorized) {
        super(message);
        this.unauthorized = unauthorized;
    }

    public boolean unauthorized() {
        return unauthorized;
    }
}

