package com.mall.api.order;

import java.math.BigDecimal;

public record OrderBaseDTO(String orderNo, Long userId, Integer orderStatus, Integer payStatus, BigDecimal payAmount) {
}
