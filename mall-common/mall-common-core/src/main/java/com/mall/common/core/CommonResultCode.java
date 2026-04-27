package com.mall.common.core;

/**
 * 服务响应和异常映射使用的内置结果码定义。
 */
public enum CommonResultCode implements ResultCode {
    SUCCESS(0, "success"),
    BAD_REQUEST(400001, "Bad request"),
    UNAUTHORIZED(400101, "Unauthorized"),
    FORBIDDEN(400103, "Forbidden"),
    TOO_MANY_REQUESTS(400429, "Too many requests"),
    BUSINESS_ERROR(500100, "Business error"),
    SYSTEM_ERROR(500001, "System error");

    private final int code;
    private final String message;

    CommonResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public int code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }
}

