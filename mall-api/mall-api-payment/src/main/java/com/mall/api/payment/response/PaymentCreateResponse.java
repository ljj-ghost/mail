package com.mall.api.payment.response;

import java.math.BigDecimal;

/**
 * 返回新建支付单及其收银地址。
 */
public record PaymentCreateResponse(String paymentNo, String orderNo, Integer payStatus, BigDecimal payAmount, String payUrl) {
}

