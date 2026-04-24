package com.mall.api.order;

public record OrderSubmitResponse(String orderNo, Integer orderStatus, Integer payStatus) {
}
