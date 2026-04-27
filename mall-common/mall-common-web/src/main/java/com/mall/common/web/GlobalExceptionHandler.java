package com.mall.common.web;

import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResponse;
import com.mall.common.core.CommonResultCode;
import com.mall.common.core.TraceIds;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
/**
 * 将未捕获异常统一转换为共享接口响应体。
 */
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public CommonResponse<Void> handleBusiness(BusinessException ex) {
        return CommonResponse.failure(ex.getCode(), ex.getMessage(), TraceIds.newTraceId());
    }

    @ExceptionHandler({
        MethodArgumentNotValidException.class,
        BindException.class,
        ConstraintViolationException.class,
        HttpMessageNotReadableException.class
    })
    public CommonResponse<Void> handleBadRequest(Exception ex) {
        return CommonResponse.failure(CommonResultCode.BAD_REQUEST.code(), ex.getMessage(), TraceIds.newTraceId());
    }

    @ExceptionHandler(Exception.class)
    public CommonResponse<Void> handleOther(Exception ex) {
        return CommonResponse.failure(CommonResultCode.SYSTEM_ERROR.code(), ex.getMessage(), TraceIds.newTraceId());
    }
}

