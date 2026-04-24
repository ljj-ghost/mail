package com.mall.api.payment;

import java.math.BigDecimal;

public record PaymentCreateResponse(String paymentNo, String orderNo, Integer payStatus, BigDecimal payAmount, String payUrl) {
}
