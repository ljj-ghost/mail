package com.mall.api.payment;

/**
 * 在本地开发环境中模拟第三方支付成功回调。
 */
public record PaymentMockSuccessRequest(String thirdTradeNo) {
}

