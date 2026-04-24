package com.mall.common.core;

public record CommonResponse<T>(int code, String message, T data, String traceId) {

    public static <T> CommonResponse<T> success(T data) {
        return new CommonResponse<>(CommonResultCode.SUCCESS.code(), CommonResultCode.SUCCESS.message(), data, "");
    }

    public static <T> CommonResponse<T> success(T data, String traceId) {
        return new CommonResponse<>(CommonResultCode.SUCCESS.code(), CommonResultCode.SUCCESS.message(), data, traceId);
    }

    public static <T> CommonResponse<T> failure(ResultCode resultCode) {
        return new CommonResponse<>(resultCode.code(), resultCode.message(), null, "");
    }

    public static <T> CommonResponse<T> failure(ResultCode resultCode, String traceId) {
        return new CommonResponse<>(resultCode.code(), resultCode.message(), null, traceId);
    }

    public static <T> CommonResponse<T> failure(int code, String message, String traceId) {
        return new CommonResponse<>(code, message, null, traceId);
    }
}
