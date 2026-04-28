package com.mall.api.order.response;

/**
 * 返回下单后的订单标识和初始状态。
 */
public record OrderSubmitResponse(String orderNo, Integer orderStatus, Integer payStatus) {
}

