package com.mall.gateway;

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
