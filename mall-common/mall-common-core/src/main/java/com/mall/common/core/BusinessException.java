package com.mall.common.core;

/**
 * 表示应作为预期接口错误返回的业务异常。
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(ResultCode resultCode) {
        super(resultCode.message());
        this.code = resultCode.code();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}

